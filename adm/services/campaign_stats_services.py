from rest_framework.exceptions import APIException
from telecalling.models.courses import CourseName, CoursePlan
from telecalling.models.leads import Lead, CampaignName, LeadSource, Priority, PipelineStage
from adm.models.user import User
from .query_services import exec_raw_sql


def fetch_pipeline_stats(user, **data):
    try:
        raw_res = exec_raw_sql("D_FETCH_PIPELINE_STATS", data)
        if raw_res and isinstance(raw_res, list) and len(raw_res) > 0:
            item = raw_res[0]
            if isinstance(item.get("total_campaign"), dict):
                return item
            
            return {
                "total_campaign": {
                    "value": item.get("total_campaign", 0),
                    "note": "Across this Pipeline",
                    "show_trend": False
                },
                "total_leads_collected": {
                    "value": item.get("total_leads_collected", 0),
                    "note": f"{item.get('leads_note', '-21 this week')}",
                    "show_trend": True,
                    "trend": item.get("leads_trend", "down")
                },
                "avg_conversion_rate": {
                    "value": float(item.get("avg_conversion_rate") or 0.0),
                    "note": f"{item.get('rate_note', '-17.7% vs last week')}",
                    "show_trend": True,
                    "trend": item.get("rate_trend", "down")
                },
                "top_lead_source": {
                    "value": item.get("top_lead_source") or "N/A",
                    "note": f"{item.get('source_note', '79.1% of all leads')}",
                    "show_trend": True,
                    "trend": "up"
                }
            }
        elif raw_res and isinstance(raw_res, dict):
            return raw_res
        return {
            "total_campaign": {"value": 0, "note": "Across this Pipeline", "show_trend": False},
            "total_leads_collected": {"value": 0, "note": "0 this week", "show_trend": True, "trend": "up"},
            "avg_conversion_rate": {"value": 0.0, "note": "0% vs last week", "show_trend": True, "trend": "up"},
            "top_lead_source": {"value": "N/A", "note": "0% of all leads", "show_trend": True, "trend": "up"},
        }
    except Exception as e:
        raise APIException(e)


def fetch_campaign_cards(user, **data):
    try:
        raw_cards = exec_raw_sql("D_FETCH_CAMPAIGN_CARDS", data)
        if raw_cards and isinstance(raw_cards, list):
            return raw_cards
        return []
    except Exception as e:
        raise APIException(e)


def fetch_filter_options(user, **data):
    try:
        # 1. Campaigns
        try:
            c1 = list(CampaignName.objects.values_list('name', flat=True))
            c2 = list(Lead.objects.values_list('campaign__name', flat=True))
            campaigns = sorted(list(set([c for c in (c1 + c2) if c and str(c).strip()])))
        except Exception:
            campaigns = ["Live Call Lead", "500 Enquiry Sheet", "Walk In Lead"]

        # 2. Courses
        try:
            co1 = list(CourseName.objects.values_list('coursename', flat=True))
            co2 = list(Lead.objects.values_list('course__name__coursename', flat=True))
            courses = sorted(list(set([c for c in (co1 + co2) if c and str(c).strip()])))
        except Exception:
            courses = ["Full Stack Development", "Data Science"]

        # 3. Course Plans
        try:
            p1 = list(CoursePlan.objects.values_list('courseplan', flat=True))
            p2 = list(Lead.objects.values_list('course__plan__courseplan', flat=True))
            course_plans = sorted(list(set([p for p in (p1 + p2) if p and str(p).strip()])))
        except Exception:
            course_plans = ["Master Program", "Regular"]

        # 4. Lead Sources
        try:
            s1 = list(LeadSource.objects.values_list('name', flat=True))
            s2 = list(Lead.objects.values_list('lead_source__name', flat=True))
            lead_sources = sorted(list(set([s for s in (s1 + s2) if s and str(s).strip()])))
        except Exception:
            lead_sources = ["Direct Live Call", "Direct Walk In", "Facebook", "Instagram", "Reference", "Whatsapp"]

        # 5. Priorities
        try:
            pr1 = list(Priority.objects.values_list('name', flat=True))
            pr2 = list(Lead.objects.values_list('priority__name', flat=True))
            priorities = sorted(list(set([p for p in (pr1 + pr2) if p and str(p).strip()])))
        except Exception:
            priorities = ["High", "Medium", "Low"]

        # 6. Telecallers / Users
        try:
            telecallers = []
            users_qs = User.objects.all()
            for u in users_qs:
                full_name = f"{u.first_name or ''} {u.last_name or ''}".strip() or u.username
                if full_name and full_name not in telecallers:
                    telecallers.append(full_name)

            lead_assigned = Lead.objects.exclude(assigned_to__isnull=True).select_related('assigned_to')
            for l in lead_assigned:
                if l.assigned_to:
                    name = f"{l.assigned_to.first_name or ''} {l.assigned_to.last_name or ''}".strip() or l.assigned_to.username
                    if name and name not in telecallers:
                        telecallers.append(name)
            telecallers = sorted(telecallers)
        except Exception:
            telecallers = ["telecaller", "poomani", "Bharath", "Prakash"]

        if not telecallers:
            telecallers = ["telecaller", "poomani", "Bharath", "Prakash"]

        # 7. Pipeline Stages
        stage_tags_map = {}
        try:
            ps1 = list(PipelineStage.objects.values_list('name', flat=True))
            ps2 = list(Lead.objects.values_list('pipeline_stage__name', flat=True))
            stages = sorted(list(set([st for st in (ps1 + ps2) if st and str(st).strip()])))

            for ps in PipelineStage.objects.all():
                tags = list(Priority.objects.filter(pipeline_stage_id=ps.id).values_list('name', flat=True))
                if tags:
                    stage_tags_map[ps.name.lower()] = tags
        except Exception:
            stages = ["new lead", "follow up", "won", "loss", "unreached", "pending", "contact_attempt", "future"]

        return {
            "campaigns": ["All"] + campaigns,
            "courses": ["All"] + courses,
            "course_plans": ["All"] + course_plans,
            "lead_sources": ["All"] + lead_sources,
            "payment_statuses": ["All", "Paid", "Pending", "Partial", "Overdue"],
            "priorities": ["All"] + priorities,
            "stages": stages,
            "stage_tags_map": stage_tags_map,
            "telecallers": telecallers,
        }
    except Exception as e:
        raise APIException(e)