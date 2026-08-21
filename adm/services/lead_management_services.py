from rest_framework.exceptions import APIException
from django.utils import timezone
from telecalling.models.user import User
from telecalling.models.leads import Lead, CampaignName, LeadSource, PipelineStage
from adm.models.pipeline_category import PipelineCategory


def fetch_add_lead_dropdowns(user, **data):
    try:
        campaigns = CampaignName.objects.filter(is_active=True).values("id", "name").order_by("id")
        categories = PipelineCategory.objects.filter(is_active=True).values("id", "category_name", "display_name").order_by("id")
        sources = LeadSource.objects.filter(is_active=True).values("id", "name").order_by("id")
        
        telecallers = User.objects.filter(is_active=True, role__name__iexact="telecaller").values(
            "id", "username", "first_name", "last_name"
        ).order_by("id")

        users_list = []
        for t in telecallers:
            name = f"{t['first_name'] or ''} {t['last_name'] or ''}".strip() or t["username"]
            users_list.append({"id": t["id"], "name": name, "username": t["username"]})

        return {
            "campaigns": list(campaigns),
            "pipeline_categories": list(categories),
            "sources": list(sources),
            "users": users_list,
        }
    except Exception as e:
        raise APIException(str(e))


def create_new_lead(user, **data):
    try:
        first_name = data.get("first_name", "").strip()
        last_name = data.get("last_name", "").strip()
        full_name = f"{first_name} {last_name}".strip()
        mobile_no = data.get("mobile_no", "").strip()
        email = data.get("email", "").strip() or None
        campaign_id = data.get("campaign_id")
        lead_source_id = data.get("lead_source_id")
        assigned_to_id = data.get("assigned_to_id")
        enquiry_date = data.get("enquiry_date")

        if not full_name:
            raise APIException("First Name or Full Name is required")
        if not mobile_no:
            raise APIException("Mobile Number is required")

        # Check duplicate mobile number
        if Lead.objects.filter(mobile_no=mobile_no).exists():
            existing = Lead.objects.filter(mobile_no=mobile_no).first()
            raise APIException(f"Mobile number {mobile_no} already exists (Lead: {existing.full_name})")

        # Get default 'new lead' stage
        stage = PipelineStage.objects.filter(name__iexact="new lead").first()
        stage_id = stage.id if stage else 1

        creator = (getattr(user, "username", None) if user and hasattr(user, "username") else None) or "admin"

        lead = Lead.objects.create(
            full_name=full_name,
            mobile_no=mobile_no,
            email=email,
            campaign_id=campaign_id,
            lead_source_id=lead_source_id,
            pipeline_stage_id=stage_id,
            assigned_to_id=assigned_to_id,
            enquiry_date=enquiry_date or timezone.now(),
            created_by=creator
        )

        return {
            "message": f"Lead {lead.full_name} Created Successfully",
            "lead_id": lead.id,
            "full_name": lead.full_name,
            "mobile_no": lead.mobile_no
        }
    except Exception as e:
        raise APIException(str(e))