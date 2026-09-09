from rest_framework.exceptions import APIException
from adm.models.user import User
from telecalling.models.leads import CampaignName
from adm.models.pipeline_category import PipelineCategory
from adm.models.CampaignAssignedAgent import CampaignAssignedAgent

def fetch_pipeline_categories(user, **data):
    try:
        categories = PipelineCategory.objects.filter(is_active=True).values(
            "id", "category_name", "display_name"
        ).order_by("id")
        return list(categories)
    except Exception as e:
        raise APIException(str(e))


from django.db.models import Q

def fetch_campaign_managers(user, **data):
    try:
        managers_qs = User.objects.filter(is_active=True).filter(
            Q(user_roles__role__name__iexact="admin") | 
            Q(user_roles__role__name__iexact="team leader") | 
            Q(user_type__icontains="admin") |
            Q(user_type__icontains="team leader") |
            Q(is_superuser=True)
        ).distinct()
        if not managers_qs.exists():
            managers_qs = User.objects.filter(is_active=True)

        managers = managers_qs.values("id", "username", "first_name", "last_name", "email").order_by("id")
        
        result = []
        for m in managers:
            name = f"{m['first_name'] or ''} {m['last_name'] or ''}".strip() or m['username']
            result.append({
                "id": m["id"],
                "name": name,
                "username": m["username"],
                "email": m["email"]
            })
        return result
    except Exception as e:
        raise APIException(str(e))


def fetch_campaign_agents(user, **data):
    try:
        agents_qs = User.objects.filter(is_active=True).filter(
            Q(user_roles__role__name__iexact="telecaller") | Q(user_type__icontains="telecaller")
        ).distinct()
        if not agents_qs.exists():
            agents_qs = User.objects.filter(is_active=True)

        agents = agents_qs.values("id", "username", "first_name", "last_name", "email").order_by("id")
        
        result = []
        for a in agents:
            name = f"{a['first_name'] or ''} {a['last_name'] or ''}".strip() or a['username']
            result.append({
                "id": a["id"],
                "name": name,
                "username": a["username"],
                "email": a["email"]
            })
        return result
    except Exception as e:
        raise APIException(str(e))


def create_campaign(user, **data):
    try:
        name = data.get("name")
        pipeline_category_id = data.get("pipeline_category_id")
        manager_id = data.get("manager_id")
        agent_ids = data.get("agent_ids", [])
        distribution_type = data.get("distribution_type", "on_demand")

        if not name:
            raise APIException("Campaign Name is required")

        creator_name = (getattr(user, "username", None) if user and hasattr(user, "username") else None) or "admin"

        # 1. Create CampaignName Record
        campaign = CampaignName.objects.create(
            name=name,
            pipeline_category_id=pipeline_category_id,
            manager_id=manager_id,
            lead_distribution_type=distribution_type,
            created_by=creator_name
        )

        # 2. Assign Agents
        if agent_ids and isinstance(agent_ids, list):
            for agent_id in agent_ids:
                if agent_id:
                    CampaignAssignedAgent.objects.create(
                        campaign=campaign,
                        agent_user_id=agent_id
                    )

        return {
            "message": "Campaign Created Successfully",
            "campaign_id": campaign.id,
            "campaign_name": campaign.name
        }
    except Exception as e:
        raise APIException(str(e))


def toggle_campaign_status(user, **data):
    try:
        campaign_id = data.get("campaign_id")
        is_active = data.get("is_active")
        
        campaign = CampaignName.objects.filter(id=campaign_id).first()
        if not campaign:
            raise APIException("Campaign Not Found")
            
        campaign.is_active = is_active
        campaign.save()
        
        status_text = "Resumed" if is_active else "Paused"
        return {
            "message": f"Campaign '{campaign.name}' {status_text} Successfully",
            "campaign_id": campaign.id,
            "is_active": campaign.is_active
        }
    except Exception as e:
        raise APIException(str(e))


def fetch_campaign_detail(user, **data):
    try:
        campaign_id = data.get("campaign_id")
        campaign_name = data.get("campaign_name")

        campaign = None
        if campaign_id:
            campaign = CampaignName.objects.filter(id=campaign_id).first()
        elif campaign_name:
            campaign = CampaignName.objects.filter(name__iexact=campaign_name).first()

        if not campaign:
            raise APIException("Campaign Not Found")

        # Manager details
        manager_name = ""
        if campaign.manager_id:
            mgr = User.objects.filter(id=campaign.manager_id).first()
            if mgr:
                manager_name = f"{mgr.first_name or ''} {mgr.last_name or ''}".strip() or mgr.username

        # Category details
        pipeline_category_name = ""
        if campaign.pipeline_category_id:
            cat = PipelineCategory.objects.filter(id=campaign.pipeline_category_id).first()
            if cat:
                pipeline_category_name = cat.display_name or cat.category_name

        # All Telecallers with their assignment status & is_active toggle for this campaign
        telecallers = User.objects.filter(role__name__iexact='telecaller').distinct()
        assigned_map = {
            ca.agent_user_id: ca.is_active
            for ca in CampaignAssignedAgent.objects.filter(campaign=campaign)
        }

        agents_list = []
        for index, agent in enumerate(telecallers, 1):
            is_assigned = agent.id in assigned_map
            is_active = assigned_map.get(agent.id, True) if is_assigned else False
            agent_name = f"{agent.first_name or ''} {agent.last_name or ''}".strip() or agent.username
            agents_list.append({
                "s_no": index,
                "agent_id": agent.id,
                "user_name": agent_name,
                "email": agent.email or "",
                "is_assigned": is_assigned,
                "is_active": is_active,
            })

        return {
            "campaign_id": campaign.id,
            "name": campaign.name,
            "pipeline_category_id": campaign.pipeline_category_id,
            "pipeline_category_name": pipeline_category_name or "EDUCATION",
            "manager_id": campaign.manager_id,
            "manager_name": manager_name or "Gunalraj k",
            "lead_distribution_type": campaign.lead_distribution_type or "on_demand",
            "is_active": campaign.is_active,
            "agents": agents_list,
        }
    except Exception as e:
        raise APIException(str(e))


def update_campaign_detail(user, **data):
    try:
        campaign_id = data.get("campaign_id")
        campaign_name = data.get("campaign_name")

        campaign = None
        if campaign_id:
            campaign = CampaignName.objects.filter(id=campaign_id).first()
        elif campaign_name:
            campaign = CampaignName.objects.filter(name__iexact=campaign_name.strip()).first()

        if not campaign:
            raise APIException("Campaign Not Found")

        if "is_active" in data and data["is_active"] is not None:
            campaign.is_active = data["is_active"]
        if "lead_distribution_type" in data and data["lead_distribution_type"]:
            campaign.lead_distribution_type = data["lead_distribution_type"]
        campaign.save()

        # Update Agent active toggles
        agent_toggles = data.get("agent_toggles", [])
        for item in agent_toggles:
            agent_id = item.get("agent_id")
            is_act = item.get("is_active")
            if agent_id is not None and is_act is not None:
                ca, created = CampaignAssignedAgent.objects.get_or_create(
                    campaign=campaign,
                    agent_user_id=agent_id
                )
                ca.is_active = is_act
                ca.save()

        return {"message": "Campaign Details Updated Successfully"}
    except Exception as e:
        raise APIException(str(e))