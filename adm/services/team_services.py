from rest_framework.exceptions import APIException
from adm.models import Team, User, Organization
from django.db.models import Prefetch
from django.utils import timezone

def fetch_all_teams_admin_service():
    try:
        teams_qs = Team.objects.select_related('leader', 'organization').prefetch_related(
            Prefetch('adm_members', queryset=User.objects.filter(is_active=True).order_by('id'))
        ).filter(is_active=True).order_by('id')

        if not teams_qs.exists():
            teams_qs = Team.objects.select_related('leader', 'organization').prefetch_related(
                Prefetch('adm_members', queryset=User.objects.all().order_by('id'))
            ).all().order_by('id')

        teams_data = []
        for team in teams_qs:
            lead_obj = None
            if team.leader:
                fname = (team.leader.first_name or "").strip()
                lname = (team.leader.last_name or "").strip()
                lead_name = f"{fname} {lname}".strip() or team.leader.username
                lead_obj = {
                    "id": team.leader.id,
                    "name": lead_name
                }

            members_list = []
            members_qs = team.adm_members.all()
            for m in members_qs:
                fname = (m.first_name or "").strip()
                lname = (m.last_name or "").strip()
                m_name = f"{fname} {lname}".strip() or m.username
                members_list.append({
                    "id": m.id,
                    "name": m_name
                })

            region_str = "North Region"
            if team.organization and hasattr(team.organization, 'state') and team.organization.state:
                region_str = team.organization.state

            teams_data.append({
                "id": team.id,
                "name": team.name,
                "region": region_str,
                "lead": lead_obj,
                "color": team.badge_color or "#6366F1",
                "membersCount": len(members_list),
                "members": members_list
            })

        return {
            "status": True,
            "message": "Teams fetched successfully",
            "data": teams_data
        }
    except Exception as e:
        raise APIException(str(e))


def create_team_admin_service(admin_user, data):
    try:
        name = str(data.get('name', '')).strip()
        if not name:
            return {
                "status": False,
                "message": "Team name is required"
            }

        if Team.objects.filter(name__iexact=name).exists():
            return {
                "status": False,
                "message": f"Team with name '{name}' already exists"
            }

        color = data.get('color') or "#6366F1"
        lead_id = data.get('lead_id')
        member_ids = data.get('member_ids') or []

        base_code = name.upper().replace(" ", "_")[:30]
        code = base_code
        counter = 1
        while Team.objects.filter(code=code).exists():
            code = f"{base_code}_{counter}"
            counter += 1

        lead_user = None
        if lead_id:
            lead_user = User.objects.filter(id=lead_id).first()

        new_team = Team.objects.create(
            name=name,
            code=code,
            leader=lead_user,
            badge_color=color,
            is_active=True,
            created_by=getattr(admin_user, 'username', 'admin') if admin_user else 'admin'
        )

        if lead_user:
            lead_user.team = new_team
            lead_user.save()

        assigned_members_count = 0
        if isinstance(member_ids, list) and member_ids:
            members_qs = User.objects.filter(id__in=member_ids)
            for m in members_qs:
                m.team = new_team
                m.save()
            assigned_members_count = members_qs.count()

        lead_name = None
        if lead_user:
            fname = (lead_user.first_name or "").strip()
            lname = (lead_user.last_name or "").strip()
            lead_name = f"{fname} {lname}".strip() or lead_user.username

        created_at_str = new_team.created_at.strftime("%Y-%m-%dT%H:%M:%SZ") if new_team.created_at else timezone.now().strftime("%Y-%m-%dT%H:%M:%SZ")

        region_str = "North Region"
        if new_team.organization and hasattr(new_team.organization, 'state') and new_team.organization.state:
            region_str = new_team.organization.state

        return {
            "status": True,
            "message": "Team created successfully",
            "data": {
                "id": new_team.id,
                "name": new_team.name,
                "region": region_str,
                "lead": lead_name,
                "membersCount": assigned_members_count,
                "created_at": created_at_str
            }
        }
    except Exception as e:
        raise APIException(str(e))


def edit_team_admin_service(admin_user, data, team_id=None):
    try:
        t_id = team_id or data.get('id') or data.get('team_id') or data.get('teamId')
        if not t_id:
            return {
                "status": False,
                "message": "Team ID is required"
            }

        team = Team.objects.filter(id=t_id).first()
        if not team:
            return {
                "status": False,
                "message": "Team not found"
            }

        name = data.get('name')
        if name and str(name).strip():
            name_str = str(name).strip()
            if Team.objects.filter(name__iexact=name_str).exclude(id=team.id).exists():
                return {
                    "status": False,
                    "message": f"Team with name '{name_str}' already exists"
                }
            team.name = name_str

        color = data.get('color')
        if color:
            team.badge_color = color

        if 'lead_id' in data:
            lead_id = data.get('lead_id')
            if lead_id:
                lead_user = User.objects.filter(id=lead_id).first()
                team.leader = lead_user
                if lead_user:
                    lead_user.team = team
                    lead_user.save()
            else:
                team.leader = None

        if 'member_ids' in data:
            member_ids = data.get('member_ids')
            if isinstance(member_ids, list):
                User.objects.filter(team=team).update(team=None)
                if member_ids:
                    User.objects.filter(id__in=member_ids).update(team=team)

        team.updated_by = getattr(admin_user, 'username', 'admin') if admin_user else 'admin'
        team.save()

        updated_at_str = team.updated_at.strftime("%Y-%m-%dT%H:%M:%SZ") if team.updated_at else timezone.now().strftime("%Y-%m-%dT%H:%M:%SZ")

        region_str = "North Region"
        if team.organization and hasattr(team.organization, 'state') and team.organization.state:
            region_str = team.organization.state

        return {
            "status": True,
            "message": "Team updated successfully",
            "data": {
                "id": team.id,
                "name": team.name,
                "region": region_str,
                "updated_at": updated_at_str
            }
        }
    except Exception as e:
        raise APIException(str(e))


def delete_team_admin_service(admin_user, data, team_id=None):
    try:
        t_id = team_id or data.get('id') or data.get('team_id') or data.get('teamId')
        if not t_id:
            return {
                "status": False,
                "message": "Team ID is required"
            }

        team = Team.objects.filter(id=t_id).first()
        if not team:
            return {
                "status": False,
                "message": "Team not found"
            }

        User.objects.filter(team=team).update(team=None)
        team.delete()

        return {
            "status": True,
            "message": "Team deleted successfully. Assigned members are now unassigned."
        }
    except Exception as e:
        raise APIException(str(e))


def fetch_team_dropdowns_admin_service(team_id=None):
    try:
        from django.db.models import Q
        base_filter = Q(is_active=True) & ~Q(
            Q(user_roles__role__name__in=['admin', 'developer', 'Admin', 'Developer']) |
            Q(user_roles__role__code__in=['ADM', 'DEV', 'ADMIN', 'DEVELOPER']) |
            Q(username='admin@gmail.com') |
            Q(username='developer@gmail.com')
        )

        other_teams = Team.objects.all()
        if team_id:
            try:
                team_id_int = int(team_id)
                other_teams = other_teams.exclude(id=team_id_int)
            except (ValueError, TypeError):
                pass

        other_leader_ids = list(other_teams.filter(leader__isnull=False).values_list('leader_id', flat=True))

        if team_id:
            try:
                t_id = int(team_id)
                team_filter = (Q(team__isnull=True) | Q(team_id=t_id)) & ~Q(id__in=other_leader_ids)
            except (ValueError, TypeError):
                team_filter = Q(team__isnull=True) & ~Q(id__in=other_leader_ids)
        else:
            team_filter = Q(team__isnull=True) & ~Q(id__in=other_leader_ids)

        users_qs = User.objects.filter(base_filter & team_filter).distinct().order_by("first_name")
        
        leads_list = []
        users_list = []
        for u in users_qs:
            fname = (u.first_name or "").strip()
            lname = (u.last_name or "").strip()
            u_name = f"{fname} {lname}".strip() or u.username
            item = {"id": u.id, "name": u_name}
            leads_list.append(item)
            users_list.append(item)

        branches_list = [
            {"id": 1, "name": "North Region"},
            {"id": 2, "name": "South Region"}
        ]
        orgs = Organization.objects.all()
        if orgs.exists():
            branches_list = [
                {"id": o.id, "name": o.state or o.organization_name or f"Region {o.id}"}
                for o in orgs
            ]

        return {
            "status": True,
            "data": {
                "leads": leads_list,
                "users": users_list,
                "branches": branches_list
            }
        }
    except Exception as e:
        raise APIException(str(e))
