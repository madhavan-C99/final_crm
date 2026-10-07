import re
from collections import Counter

from django.contrib.auth import get_user_model
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import Q
from rest_framework.exceptions import ValidationError as APIValidationError

from telecalling.models import Lead, CampaignName, LeadSource, PipelineStage

User = get_user_model()


def verify_lead_rows(rows, user):
    if not isinstance(rows, list):
        raise APIValidationError({"rows": "Rows must be a list."})

    org = getattr(user, "organization", None)
    normalized_rows = []
    errors_by_row = []
    mobile_counts = Counter()

    for row_number, row in enumerate(rows, start=1):
        if not isinstance(row, dict):
            normalized_rows.append({})
            errors_by_row.append([{
                "field": "row",
                "message": "Each row must be an object."
            }])
            continue

        name = str(row.get("name") or "").strip()
        email = str(row.get("email") or "").strip().lower()
        raw_mobile = re.sub(r"\D", "", str(row.get("mobile") or ""))
        mobile = raw_mobile[-10:] if len(raw_mobile) >= 10 else raw_mobile
        campaign_id = row.get("campaign_id")
        source_id = row.get("source_id")
        assigned_to_id = row.get("assigned_to_id")
        pipeline_stage_id = row.get("pipeline_stage_id")

        normalized_rows.append({
            "name": name,
            "email": email,
            "mobile": mobile,
            "campaign_id": campaign_id,
            "source_id": source_id,
            "assigned_to_id": assigned_to_id,
            "pipeline_stage_id": pipeline_stage_id,
        })

        errors = []

        if not name:
            errors.append({
                "field": "name",
                "message": "Name is required."
            })

        if email:
            try:
                validate_email(email)
            except ValidationError:
                errors.append({
                    "field": "email",
                    "message": "Enter a valid email address."
                })

        if not re.fullmatch(r"[6-9]\d{9}", mobile):
            errors.append({
                "field": "mobile",
                "message": "Enter a valid 10-digit mobile number."
            })
        else:
            mobile_counts[mobile] += 1

        errors_by_row.append(errors)

    for index, row in enumerate(normalized_rows):
        mobile = row.get("mobile")
        if mobile and mobile_counts[mobile] > 1:
            errors_by_row[index].append({
                "field": "mobile",
                "message": "This mobile number is duplicated in the uploaded data."
            })

    valid_mobiles = {
        row["mobile"][-10:]
        for row in normalized_rows
        if row.get("mobile") and re.fullmatch(r"[6-9]\d{9}", row["mobile"][-10:])
    }

    existing_mobiles = set()
    if valid_mobiles:
        mobile_q = Q()
        for m in valid_mobiles:
            mobile_q |= Q(mobile_no__endswith=m)

        lead_qs = Lead.objects.filter(mobile_q)
        if org:
            org_id = getattr(org, "id", org)
            lead_qs = lead_qs.filter(Q(organization_id=org_id) | Q(organization__isnull=True))

        for db_mob in lead_qs.values_list("mobile_no", flat=True):
            clean_db_mob = re.sub(r"\D", "", str(db_mob or ""))[-10:]
            if clean_db_mob:
                existing_mobiles.add(clean_db_mob)

    for index, row in enumerate(normalized_rows):
        row_mob = row.get("mobile", "")[-10:]
        if row_mob in existing_mobiles:
            errors_by_row[index].append({
                "field": "mobile",
                "message": "A lead with this mobile number already exists."
            })

    error_count = sum(len(errors) for errors in errors_by_row)

    return {
        "total_rows": len(rows),
        "valid_rows": sum(not errors for errors in errors_by_row),
        "invalid_rows": sum(bool(errors) for errors in errors_by_row),
        "error_count": error_count,
        "rows": [
            {
                "row_number": index + 1,
                "errors": errors,
            }
            for index, errors in enumerate(errors_by_row)
        ],
        "normalized_rows": normalized_rows,
    }


def submit_lead_rows(rows, user, campaign_id=None, source_id=None, assigned_to_id=None, pipeline_stage_id=None):
    result = verify_lead_rows(rows, user)

    if result["error_count"] > 0:
        raise APIValidationError({
            "message": "Please fix all validation errors before submitting.",
            "data": {
                key: value
                for key, value in result.items()
                if key != "normalized_rows"
            },
        })

    org = getattr(user, "organization", None)

    default_campaign = CampaignName.objects.filter(id=campaign_id).first() if campaign_id else None
    default_source = LeadSource.objects.filter(id=source_id).first() if source_id else None

    dist_type = getattr(default_campaign, "lead_distribution_type", "on_demand") if default_campaign else "on_demand"
    telecallers = list(default_campaign.assigned_agents.filter(is_active=True)) if default_campaign else []

    default_stage = None
    if pipeline_stage_id:
        default_stage = PipelineStage.objects.filter(id=pipeline_stage_id).first()
    if not default_stage and default_campaign and default_campaign.pipeline_category:
        default_stage = PipelineStage.objects.filter(
            pipeline_category=default_campaign.pipeline_category,
            is_active=True
        ).order_by("order_no").first()
    if not default_stage:
        default_stage = PipelineStage.objects.first()

    leads = []
    for idx, row in enumerate(result["normalized_rows"]):
        row_camp_id = row.get("campaign_id") or campaign_id
        row_src_id = row.get("source_id") or source_id
        row_tele_id = row.get("assigned_to_id")
        row_stage_id = row.get("pipeline_stage_id")

        camp = CampaignName.objects.filter(id=row_camp_id).first() if row_camp_id else default_campaign
        src = LeadSource.objects.filter(id=row_src_id).first() if row_src_id else default_source
        stage = PipelineStage.objects.filter(id=row_stage_id).first() if row_stage_id else default_stage

        if dist_type == "equal":
            if row_tele_id:
                tele_user = User.objects.filter(id=row_tele_id).first() or (telecallers[idx % len(telecallers)] if telecallers else user)
            elif telecallers:
                tele_user = telecallers[idx % len(telecallers)]
            else:
                tele_user = user
        else:
            tele_user = None

        formatted_mobile = f"+91 {row['mobile']}" if row.get("mobile") else ""

        lead_item = Lead(
            full_name=row["name"],
            email=row["email"],
            mobile_no=formatted_mobile,
            organization=org,
            campaign=camp,
            lead_source=src,
            assigned_to=tele_user,
            pipeline_stage=stage,
            created_by=user.username if hasattr(user, "username") else "admin",
        )
        leads.append(lead_item)

    with transaction.atomic():
        Lead.objects.bulk_create(leads)

    msg_detail = (
        f"{len(leads)} leads created in Unassigned Pool for {default_campaign.name if default_campaign else 'Campaign'}. Telecallers can self-assign on demand."
        if dist_type == "on_demand"
        else f"{len(leads)} leads created and equally distributed among campaign telecallers via Round-Robin."
    )

    return {
        "created_count": len(leads),
        "distribution_type": dist_type,
        "message": msg_detail,
    }
