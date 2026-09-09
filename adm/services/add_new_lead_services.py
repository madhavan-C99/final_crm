from django.db.models import Q
from rest_framework.exceptions import APIException
from django.utils import timezone
from adm.models.pipeline_category import PipelineCategory
from adm.models.user import User
from telecalling.models.leads import Lead, CampaignName, LeadSource, PipelineStage
from ..models import CampaignAssignedAgent, PipelineCategory


def fetch_add_lead_dropdowns(user, **data):
    try:
        campaign_id = data.get("campaign_id")
        campaign_name = data.get("campaign_name")
        campaigns = CampaignName.objects.filter(is_active=True).values("id", "name").order_by("id")
        categories = PipelineCategory.objects.filter(is_active=True).values("id", "category_name", "display_name").order_by("id")
        sources = LeadSource.objects.filter(is_active=True).values("id", "name").order_by("id")
        
        telecallers_qs = User.objects.filter(is_active=True).filter(
            Q(user_roles__role__name__iexact="telecaller") | 
            Q(user_roles__role__code__iexact="TEL") | 
            Q(user_type__icontains="telecaller")
        ).distinct()

        telecallers = telecallers_qs.values(
            "id", "username", "first_name", "last_name"
        ).order_by("id")

        campaign = None
        if campaign_id:
            campaign = CampaignName.objects.filter(id=campaign_id).first()
        elif campaign_name:
            campaign = CampaignName.objects.filter(name__iexact=campaign_name.strip()).first()

        assigned_map = {}
        if campaign:
            assigned_map = {
                ca.agent_user_id: ca.is_active
                for ca in CampaignAssignedAgent.objects.filter(campaign=campaign)
            }

        users_list = []
        for t in telecallers:
            name = f"{t['first_name'] or ''} {t['last_name'] or ''}".strip() or t["username"]
            is_active_for_campaign = assigned_map.get(t["id"], True) if campaign else True
            users_list.append({
                "id": t["id"],
                "name": name,
                "username": t["username"],
                "is_active_for_campaign": is_active_for_campaign,
            })

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
        enquiry_date_raw = data.get("enquiry_date")

        if not full_name:
            raise APIException("First Name or Full Name is required")
        if not mobile_no:
            raise APIException("Mobile Number is required")

        # Check duplicate mobile number
        if Lead.objects.filter(mobile_no=mobile_no).exists():
            existing = Lead.objects.filter(mobile_no=mobile_no).first()
            raise APIException(f"Mobile number {mobile_no} already exists (Lead: {existing.full_name})")

        # Check if selected agent has lead assignment disabled or is paused for campaign
        if assigned_to_id:
            assigned_user = User.objects.filter(id=assigned_to_id).first()
            if assigned_user and assigned_user.disable_lead_assignment:
                raise APIException("Selected telecaller has lead assignment disabled!")

        if assigned_to_id and campaign_id:
            ca = CampaignAssignedAgent.objects.filter(campaign_id=campaign_id, agent_user_id=assigned_to_id).first()
            if ca and not ca.is_active:
                raise APIException("Selected telecaller is currently paused/disabled for this campaign!")

        # Parse date safely
        parsed_date = None
        if enquiry_date_raw:
            try:
                if isinstance(enquiry_date_raw, str) and enquiry_date_raw.strip():
                    raw_str = enquiry_date_raw.strip()
                    if "-" in raw_str:
                        parts = raw_str.split("-")
                        if len(parts) == 3 and len(parts[0]) == 4:
                            parsed_date = datetime.strptime(raw_str, "%Y-%m-%d")
                        elif len(parts) == 3 and len(parts[2]) == 4:
                            parsed_date = datetime.strptime(raw_str, "%d-%m-%Y")
                elif isinstance(enquiry_date_raw, (date, datetime)):
                    parsed_date = enquiry_date_raw
            except Exception:
                parsed_date = timezone.now()

        if not parsed_date:
            parsed_date = timezone.now()

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
            enquiry_date=parsed_date,
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