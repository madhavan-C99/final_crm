import datetime
import uuid
import logging
from rest_framework.exceptions import APIException, AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db.models import Q
from adm.models import User, Role, UserRole, Team, CampaignAssignedAgent
from telecalling.models import Lead, CampaignName, CallDetails, FollowUp
import math


logger = logging.getLogger('django')


def create_user(user_name, **data):
    try:
        user = User.objects.filter(email=data.get('email')).first()
        if user is not None:
            raise APIException("Email id Already exists")

        number = None
        if data.get('mobile_number'):
            number = User.objects.filter(mobile=data.get('mobile_number')).first()
        if number is not None:
            raise APIException("Mobile is Already exists")

        user = User.objects.create_user(data.get('username'), data.get('email'), data.get('password'))
        if data.get('role_id'):
            role_obj = Role.objects.filter(id=data.get('role_id')).first()
            if role_obj:
                UserRole.objects.get_or_create(user=user, role=role_obj)

        user.first_name = data.get('first_name')
        user.last_name = data.get('last_name')
        user.is_active = True
        user.mobile = data.get('mobile_number')
        user.gender = data.get('gender')
        user.ending_date = data.get('ending_date')
        user.address = data.get('address')
        user.validate_token = User.objects.make_random_password(10) + uuid.uuid4().hex[:6].upper()

        user.save()
        data["user_id"] = user.id

        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
        }
    except Exception as e:
        raise APIException(str(e))


def create_role(**data):
    try:
        role = Role(
            name=data.get('name'),
            display_value=data.get('display_value'),
            code=data.get('code'),
            description=data.get('description'),
        )
        role.save()
        return role.code
    except Exception as e:
        raise APIException(str(e))


def create_token(**data):
    username = data.get('username').lower()
    password = data.get('password')

    expired = User.objects.filter(
        Q(email=username) | Q(mobile=username),
        is_active=False
    )

    if expired.exists():
        raise AuthenticationFailed(detail='Your plan has expired. Please renew your plan.')

    user_obj = User.objects.filter(
        Q(mobile=username) | Q(username=username) | Q(email=username)
    ).first()

    if user_obj is None:
        raise AuthenticationFailed(detail='User does not exist')

    user = authenticate(username=user_obj.username, password=password)

    if user is None:
        raise AuthenticationFailed(detail='Invalid Username or Password')

    if user.ending_date is None or user.ending_date >= datetime.datetime.now().date():
        user.last_login = datetime.datetime.now()
        user.save()

        refresh_tkn = RefreshToken.for_user(user)
        access_tkn = refresh_tkn.access_token
    else:
        raise AuthenticationFailed(detail='Your plan has expired. Please renew your plan.')

    token_data = {
        "access": str(access_tkn),
        "refresh": str(refresh_tkn)
    }

    user_role_obj = user.user_roles.select_related('role').first() if hasattr(user, 'user_roles') else None
    role_obj = user_role_obj.role if user_role_obj else None

    user_data = {
        "user_email": user.email,
        "user_id": user.id,
        "user_mobile": user.mobile,
        "user_name": user.first_name,
        "role": {
            "id": role_obj.id if role_obj else None,
            "code": role_obj.code if role_obj else None,
            "name": role_obj.name if role_obj else None
        }
    }

    return token_data, user_data


def fetch_user_permissions_service(user):
    try:
        if not user or not user.is_authenticated:
            raise APIException("Authentication required")
        perms = user.get_perms() if hasattr(user, 'get_perms') else []
        user_role_obj = user.user_roles.select_related('role').first() if hasattr(user, 'user_roles') else None
        role_code = user_role_obj.role.code if user_role_obj and user_role_obj.role else None
        return {
            "user_id": user.id,
            "role_code": role_code,
            "permissions": perms
        }
    except Exception as e:
        raise APIException(str(e))


# ----------------------------- fetch_all_users_admin_service -----------------------------

def fetch_all_users_admin_service(user, page=1, page_size=50, search=None, sort_by=None):
    try:
        page = int(page or 1)
        page_size_val = str(page_size or "50").lower()

        # Database Query with Relations Optimization (Excludes Admin & Developer accounts)
        qs = User.objects.filter(is_active=True).exclude(
            Q(user_roles__role__name__in=['admin', 'developer', 'Admin', 'Developer']) |
            Q(user_roles__role__code__in=['ADM', 'DEV', 'ADMIN', 'DEVELOPER']) |
            Q(username='admin@gmail.com') |
            Q(username='developer@gmail.com')
        ).distinct().select_related('team', 'reporting_to').prefetch_related('user_roles__role').order_by('-created_at')

        # 1. Search Filter (by name, phone, email, employee_id)
        if search:
            search_str = str(search).strip()
            qs = qs.filter(
                Q(first_name__icontains=search_str) |
                Q(last_name__icontains=search_str) |
                Q(email__icontains=search_str) |
                Q(mobile__icontains=search_str) |
                Q(employee_id__icontains=search_str)
            )

        # 2. Sorting
        sort_key = str(sort_by or "").lower().strip()
        if sort_key in ['oldest', 'oldest_first', 'oldest first', 'created_at_asc', 'asc']:
            qs = qs.order_by('created_at', 'id')
        elif sort_key in ['newest', 'newest_first', 'newest first', 'created_at_desc', 'desc']:
            qs = qs.order_by('-created_at', '-id')
        elif sort_key in ['name_asc', 'name_a_z', 'a_z']:
            qs = qs.order_by('first_name', 'last_name')
        elif sort_key in ['name_desc', 'name_z_a', 'z_a']:
            qs = qs.order_by('-first_name', '-last_name')
        else:
            qs = qs.order_by('-created_at', '-id')

        total_records = qs.count()

        # 3. Pagination Logic
        if page_size_val in ['0', 'all', 'none']:
            actual_page_size = total_records or 1
            users_list = list(qs)
            total_pages = 1
            page = 1
        else:
            actual_page_size = int(page_size_val)
            total_pages = math.ceil(total_records / actual_page_size) if actual_page_size > 0 else 1
            start = (page - 1) * actual_page_size
            end = start + actual_page_size
            users_list = list(qs[start:end])

        users_data = []
        for idx, u in enumerate(users_list, start=1 + (page - 1) * actual_page_size if page_size_val not in ['0', 'all', 'none'] else 1):
            roles = []
            if hasattr(u, 'user_roles'):
                for ur in u.user_roles.all():
                    if ur.role:
                        roles.append({"id": ur.role.id, "name": ur.role.display_value or ur.role.name, "code": ur.role.code})

            reporting_to_name = None
            if u.reporting_to:
                reporting_to_name = u.reporting_to.get_full_name()
            elif u.team and u.team.leader:
                reporting_to_name = u.team.leader.get_full_name()

            emp_id = u.employee_id or f"EMP-{u.id:04d}"

            users_data.append({
                "id": u.id,
                "s_no": idx,
                "emp_id": emp_id,
                "name": u.get_full_name(),
                "first_name": u.first_name,
                "last_name": u.last_name,
                "mobile_no": u.mobile or "",
                "location": u.address or "",
                "email": u.email,
                "role": roles[0]["name"] if roles else (u.user_type or "Executive"),
                "roles": roles,
                "reporting_to": reporting_to_name or "Gunal Raj",
                "reporting_to_id": u.reporting_to_id,
                "status": "Active" if u.is_active else "Deactive",
                "is_active": u.is_active,
                "is_lead_enabled": not u.disable_lead_assignment,
                "disable_lead_assignment": u.disable_lead_assignment,
                "team_id": u.team_id,
                "team_name": u.team.name if u.team else None,
                "created_at": u.created_at.isoformat() if u.created_at else None
            })

        return {
            "status": True,
            "message": "Users fetched successfully",
            "data": {
                "users": users_data,
                "pagination": {
                    "totalRecords": total_records,
                    "currentPage": page,
                    "totalPages": total_pages,
                    "limit": actual_page_size
                }
            }
        }
    except Exception as e:
        raise APIException(str(e))


# ----------------------------- create_user_admin_service -----------------------------

def create_user_admin_service(admin_user, data):
    try:
        email = str(data.get('email') or '').strip().lower()
        emp_id = str(data.get('emp_id') or '').strip()
        contact_no = str(data.get('contact_no') or '').strip()
        full_name = str(data.get('full_name') or '').strip()

        # Check unique constraints for email and emp_id
        if email and User.objects.filter(email=email).exists():
            return {
                "status": False,
                "message": "User with this Employee ID or Email already exists",
                "errors": {
                    "email": "Email already exists"
                }
            }

        if emp_id and User.objects.filter(employee_id=emp_id).exists():
            return {
                "status": False,
                "message": "User with this Employee ID or Email already exists",
                "errors": {
                    "emp_id": "Employee ID already exists"
                }
            }

        # Handle name splitting
        name_parts = full_name.split(" ", 1)
        first_name = name_parts[0]
        last_name = name_parts[1] if len(name_parts) > 1 else ""

        # Auto-generate username from email if not provided
        username = email.split('@')[0] if email else f"user_{get_random_string(6)}"
        if User.objects.filter(username=username).exists():
            from django.utils.crypto import get_random_string
            username = f"{username}_{get_random_string(4)}"

        # Default password for admin created user if not passed
        raw_password = data.get('password') or "Password@123"

        user = User.objects.create_user(username, email, raw_password)
        user.first_name = first_name
        user.last_name = last_name
        user.mobile = contact_no
        user.address = data.get('location')
        user.employee_id = emp_id if emp_id else f"EMP-{user.id:04d}"

        status_val = str(data.get('status') or 'Active').lower()
        user.is_active = (status_val in ['active', 'true', '1'])

        # Joined date / starting date
        joined_date = data.get('joined_date')
        if joined_date:
            try:
                from datetime import datetime
                user.starting_date = datetime.strptime(str(joined_date), '%Y-%m-%d').date()
            except Exception:
                pass

        # Handle Reporting To Manager (by Name or ID)
        reporting_to_val = data.get('reporting_to')
        if reporting_to_val:
            mgr = None
            if isinstance(reporting_to_val, int) or str(reporting_to_val).isdigit():
                mgr = User.objects.filter(id=int(reporting_to_val)).first()
            else:
                mgr = User.objects.filter(Q(first_name__icontains=reporting_to_val) | Q(username__icontains=reporting_to_val)).first()
            if mgr:
                user.reporting_to = mgr

        # Handle Team (by Name or ID)
        team_val = data.get('team')
        if team_val:
            team_obj = None
            if isinstance(team_val, int) or str(team_val).isdigit():
                team_obj = Team.objects.filter(id=int(team_val)).first()
            else:
                team_obj = Team.objects.filter(name__icontains=team_val).first()
                if not team_obj:
                    team_obj = Team.objects.create(name=team_val, code=team_val[:10].upper())
            if team_obj:
                user.team = team_obj

        # Handle Role (by Name or ID or Role IDs array)
        role_val = data.get('role') or data.get('role_ids')
        role_obj = None
        if role_val:
            if isinstance(role_val, list):
                for r_id in role_val:
                    r = Role.objects.filter(id=r_id).first()
                    if r:
                        UserRole.objects.get_or_create(user=user, role=r)
                        if not role_obj:
                            role_obj = r
            else:
                if isinstance(role_val, int) or str(role_val).isdigit():
                    role_obj = Role.objects.filter(id=int(role_val)).first()
                else:
                    role_obj = Role.objects.filter(Q(name__icontains=role_val) | Q(display_value__icontains=role_val)).first()
                    if not role_obj:
                        role_obj = Role.objects.create(name=role_val.lower(), display_value=role_val, code=role_val[:3].upper())
                if role_obj:
                    UserRole.objects.get_or_create(user=user, role=role_obj)

        user.save()

        reporting_to_display = user.reporting_to.get_full_name() if user.reporting_to else (user.team.leader.get_full_name() if (user.team and user.team.leader) else "Gunal Raj")
        role_display = role_obj.display_value if role_obj else (user.user_type or "Executive")
        team_display = user.team.name if user.team else (str(data.get('team') or 'Gamma'))

        return {
            "status": True,
            "message": "User created successfully",
            "data": {
                "id": user.id,
                "emp_id": user.employee_id,
                "full_name": user.get_full_name(),
                "email": user.email,
                "contact_no": user.mobile or "",
                "location": user.address or "",
                "role": role_display,
                "reporting_to": reporting_to_display,
                "status": "Active" if user.is_active else "Deactive",
                "joined_date": str(user.starting_date) if user.starting_date else "2026-04-08",
                "team": team_display,
                "is_lead_enabled": not user.disable_lead_assignment,
                "created_at": user.created_at.isoformat() if user.created_at else None
            }
        }
    except Exception as e:
        raise APIException(str(e))


# ----------------------------- edit_user_admin_service -----------------------------

def edit_user_admin_service(admin_user, data):
    try:
        user_id = data.get('id') or data.get('user_id')
        emp_id_input = data.get('emp_id')

        user = None
        if user_id:
            user = User.objects.filter(id=user_id).first()
        elif emp_id_input:
            user = User.objects.filter(employee_id=emp_id_input).first()

        if not user:
            return {
                "status": False,
                "message": "User not found"
            }

        # Handle Full Name update
        full_name = data.get('full_name')
        if full_name:
            name_parts = str(full_name).strip().split(" ", 1)
            user.first_name = name_parts[0]
            user.last_name = name_parts[1] if len(name_parts) > 1 else ""

        # Handle Email & Mobile
        if 'email' in data:
            user.email = str(data['email']).strip().lower()
        if 'contact_no' in data:
            user.mobile = str(data['contact_no']).strip()
        elif 'mobile' in data:
            user.mobile = str(data['mobile']).strip()

        if 'location' in data:
            user.address = data['location']
        if 'emp_id' in data and data['emp_id']:
            user.employee_id = data['emp_id']

        if 'status' in data:
            status_val = str(data['status']).lower()
            user.is_active = (status_val in ['active', 'true', '1'])

        # Joined date / starting date
        joined_date = data.get('joined_date')
        if joined_date:
            try:
                from datetime import datetime
                user.starting_date = datetime.strptime(str(joined_date), '%Y-%m-%d').date()
            except Exception:
                pass

        # Handle Reporting To Manager
        reporting_to_val = data.get('reporting_to')
        if reporting_to_val:
            mgr = None
            if isinstance(reporting_to_val, int) or str(reporting_to_val).isdigit():
                mgr = User.objects.filter(id=int(reporting_to_val)).first()
            else:
                mgr = User.objects.filter(Q(first_name__icontains=reporting_to_val) | Q(username__icontains=reporting_to_val)).first()
            if mgr:
                user.reporting_to = mgr

        # Handle Team
        team_val = data.get('team')
        if team_val:
            team_obj = None
            if isinstance(team_val, int) or str(team_val).isdigit():
                team_obj = Team.objects.filter(id=int(team_val)).first()
            else:
                team_obj = Team.objects.filter(name__icontains=team_val).first()
                if not team_obj:
                    team_obj = Team.objects.create(name=team_val, code=team_val[:10].upper())
            if team_obj:
                user.team = team_obj

        # Handle Role update
        role_val = data.get('role') or data.get('role_ids')
        role_obj = None
        if role_val:
            UserRole.objects.filter(user=user).delete()
            if isinstance(role_val, list):
                for r_id in role_val:
                    r = Role.objects.filter(id=r_id).first()
                    if r:
                        UserRole.objects.get_or_create(user=user, role=r)
                        if not role_obj:
                            role_obj = r
            else:
                if isinstance(role_val, int) or str(role_val).isdigit():
                    role_obj = Role.objects.filter(id=int(role_val)).first()
                else:
                    role_obj = Role.objects.filter(Q(name__icontains=role_val) | Q(display_value__icontains=role_val)).first()
                    if not role_obj:
                        role_obj = Role.objects.create(name=role_val.lower(), display_value=role_val, code=role_val[:3].upper())
                if role_obj:
                    UserRole.objects.get_or_create(user=user, role=role_obj)

        user.save()

        reporting_to_display = user.reporting_to.get_full_name() if user.reporting_to else (user.team.leader.get_full_name() if (user.team and user.team.leader) else "Gunal Raj")
        user_role_item = user.user_roles.select_related('role').first()
        role_display = user_role_item.role.display_value if (user_role_item and user_role_item.role) else (user.user_type or "Executive")
        team_display = user.team.name if user.team else (str(data.get('team') or 'Gamma'))

        return {
            "status": True,
            "message": "User details updated successfully",
            "data": {
                "id": user.id,
                "emp_id": user.employee_id or f"EMP-{user.id:04d}",
                "full_name": user.get_full_name(),
                "email": user.email,
                "contact_no": user.mobile or "",
                "location": user.address or "",
                "role": role_display,
                "reporting_to": reporting_to_display,
                "status": "Active" if user.is_active else "Deactive",
                "joined_date": str(user.starting_date) if user.starting_date else "2026-04-08",
                "team": team_display,
                "updated_at": user.updated_at.isoformat() if user.updated_at else None
            }
        }
    except Exception as e:
        raise APIException(str(e))


# ----------------------------- toggle_user_status_admin_service -----------------------------

def toggle_user_status_admin_service(admin_user, data):
    try:
        user_id = data.get('id') or data.get('user_id')
        emp_id_input = data.get('emp_id')
        status_input = data.get('status')

        if status_input is None and 'is_active' in data:
            status_input = data.get('is_active')

        user = None
        if user_id:
            user = User.objects.filter(id=user_id).first()
        elif emp_id_input:
            user = User.objects.filter(employee_id=emp_id_input).first()

        if not user or status_input is None:
            return {
                "status": False,
                "message": "User not found or invalid status"
            }

        status_str = str(status_input).strip().lower()
        if status_str in ['active', 'true', '1']:
            user.is_active = True
            new_status_str = "Active"
        elif status_str in ['deactive', 'inactive', 'false', '0']:
            user.is_active = False
            new_status_str = "Deactive"
        else:
            return {
                "status": False,
                "message": "User not found or invalid status"
            }

        user.save()

        emp_id_display = user.employee_id or f"EMP-{user.id:04d}"
        name_display = user.first_name or user.get_full_name() or user.username

        return {
            "status": True,
            "message": f"User status updated to {new_status_str} successfully",
            "data": {
                "id": user.id,
                "emp_id": emp_id_display,
                "name": name_display,
                "status": new_status_str,
                "updated_at": user.updated_at.isoformat() if user.updated_at else None
            }
        }
    except Exception as e:
        raise APIException(str(e))


# ----------------------------- change_user_password_admin_service -----------------------------

def change_user_password_admin_service(admin_user, data):
    try:
        import re
        user_id = data.get('id') or data.get('user_id')
        emp_id_input = data.get('emp_id')

        new_password = data.get('newPassword') or data.get('new_password')
        confirm_password = data.get('confirmPassword') or data.get('confirm_password')

        user = None
        if user_id:
            user = User.objects.filter(id=user_id).first()
        elif emp_id_input:
            user = User.objects.filter(employee_id=emp_id_input).first()

        if not user:
            return {
                "status": False,
                "message": "User not found"
            }

        if not new_password or not confirm_password:
            return {
                "status": False,
                "message": "Password must be at least 8 characters long and contain numbers/symbols"
            }

        if new_password != confirm_password:
            return {
                "status": False,
                "message": "Passwords do not match"
            }

        # Check length (>= 8), contains digits, and contains symbols
        if len(new_password) < 8 or not re.search(r'\d', new_password) or not re.search(r'[^a-zA-Z0-9]', new_password):
            return {
                "status": False,
                "message": "Password must be at least 8 characters long and contain numbers/symbols"
            }

        user.set_password(new_password)
        if hasattr(user, 'last_pwd_changed_at'):
            from django.utils import timezone
            user.last_pwd_changed_at = timezone.now()
        user.save()

        return {
            "status": True,
            "message": "User password updated successfully"
        }
    except Exception as e:
        raise APIException(str(e))


# ----------------------------- enable_disable_lead_assignment_admin_service -----------------------------

def enable_disable_lead_assignment_admin_service(admin_user, data):
    try:
        user_id = data.get('id') or data.get('user_id')
        emp_id_input = data.get('emp_id')

        user = None
        if user_id:
            user = User.objects.filter(id=user_id).first()
        elif emp_id_input:
            user = User.objects.filter(employee_id=emp_id_input).first()

        if not user:
            return {
                "status": False,
                "message": "User not found"
            }

        if 'disable_lead_assignment' in data:
            val = data['disable_lead_assignment']
            user.disable_lead_assignment = bool(val)
        elif 'is_lead_enabled' in data:
            val = data['is_lead_enabled']
            user.disable_lead_assignment = not bool(val)
        else:
            user.disable_lead_assignment = not user.disable_lead_assignment

        user.save()

        return {
            "status": True,
            "message": "Lead assignment status updated successfully",
            "data": {
                "id": user.id,
                "emp_id": user.employee_id or f"EMP-{user.id:04d}",
                "name": user.get_full_name() or user.username,
                "is_lead_enabled": not user.disable_lead_assignment,
                "disable_lead_assignment": user.disable_lead_assignment
            }
        }
    except Exception as e:
        raise APIException(str(e))


# ----------------------------- transfer_leads_admin_service -----------------------------

def transfer_leads_admin_service(admin_user, data):
    try:
        from adm.services.lead_services import bulk_transfer_leads_admin
        from_user_id = data.get('from_user_id') or data.get('from_id') or data.get('from_telecaller_id')
        to_user_id = data.get('to_user_id') or data.get('to_id') or data.get('to_telecaller_id')
        campaign_id = data.get('campaign_id')
        reason = data.get('reason')

        result = bulk_transfer_leads_admin(
            user=admin_user,
            from_telecaller_id=from_user_id,
            to_telecaller_id=to_user_id,
            campaign_id=campaign_id,
            reason=reason
        )
        return result
    except APIException as ae:
        return {
            "status": False,
            "message": str(ae)
        }
    except Exception as e:
        raise APIException(str(e))


# ----------------------------- delete_user_admin_service -----------------------------

def delete_user_admin_service(admin_user, data):
    try:
        user_id = data.get('id') or data.get('user_id')
        emp_id_input = data.get('emp_id')

        user = None
        if user_id:
            user = User.objects.filter(id=user_id).first()
        elif emp_id_input:
            user = User.objects.filter(employee_id=emp_id_input).first()

        if not user:
            return {
                "status": False,
                "message": "User not found"
            }

        # Prevent admin from deleting themselves
        if user == admin_user:
            return {
                "status": False,
                "message": "Cannot delete currently logged in admin user"
            }

        user_id_val = user.id
        emp_id_val = user.employee_id
        user.delete()

        return {
            "status": True,
            "message": "User deleted successfully",
            "data": {
                "id": user_id_val,
                "emp_id": emp_id_val
            }
        }
    except Exception as e:
        raise APIException(str(e))


def fetch_user_dropdowns_admin_service():
   
    try:
        roles_qs = Role.objects.exclude(
            Q(name__iexact='developer') | Q(code__iexact='DEV')
        ).order_by("id")
        roles = [
            {
                "id": r.id,
                "name": r.display_value or r.name,
                "code": r.code
            }
            for r in roles_qs
        ]

        # 2. Fetch Managers / Users for Reporting To dropdown (STRICTLY Telecallers)
        users_qs = User.objects.filter(is_active=True).filter(
            Q(user_roles__role__name__iexact='telecaller') |
            Q(user_roles__role__code__iexact='TEL') |
            Q(user_type__iexact='telecaller')
        ).distinct().order_by("id")
        managers = []
        for u in users_qs:
            fname = (u.first_name or "").strip()
            lname = (u.last_name or "").strip()
            full_name = f"{fname} {lname}".strip() or u.username
            managers.append({
                "id": u.id,
                "name": full_name,
                "emp_id": u.employee_id or f"EMP-{u.id:04d}"
            })

        # 3. Fetch Active Teams
        teams_qs = Team.objects.filter(is_active=True).order_by("id")
        teams = [
            {
                "id": t.id,
                "name": t.name,
                "code": t.code
            }
            for t in teams_qs
        ]

        return {
            "status": True,
            "message": "Dropdown options fetched successfully",
            "data": {
                "roles": roles,
                "managers": managers,
                "teams": teams
            }
        }
    except Exception as e:
        raise APIException(str(e))


def fetch_user_campaigns_admin_service(user_id=None, id=None, emp_id=None, employee_id=None):
    """
    User Management -> View Campaign Modal API.
    Fetches assigned campaigns and lead statistics for a user.
    """
    try:
        uid = user_id or id
        eid = emp_id or employee_id

        # 1. Locate Target User
        target_user = None
        if uid:
            target_user = User.objects.filter(id=uid).first()
        elif eid:
            target_user = User.objects.filter(employee_id=eid).first()

        if not target_user:
            return {
                "status": "error",
                "message": "User not found"
            }

        # 2. Query Assigned Campaigns
        ca_qs = CampaignAssignedAgent.objects.select_related('campaign').filter(agent_user=target_user).order_by('-assigned_at')
        
        fname = (target_user.first_name or "").strip()
        lname = (target_user.last_name or "").strip()
        user_name = f"{fname} {lname}".strip() or target_user.username
        user_emp_id = target_user.employee_id or f"EMP{target_user.id:03d}"

        campaigns_list = []
        idx = 1
        if ca_qs.exists():
            for ca in ca_qs:
                camp = ca.campaign
                
                assigned_cnt = Lead.objects.filter(assigned_to=target_user, campaign=camp).count()
                unassigned_cnt = Lead.objects.filter(assigned_to__isnull=True, campaign=camp).count()
                called_cnt = CallDetails.objects.filter(telecaller=target_user, lead__campaign=camp).values('lead_id').distinct().count()
                rescheduled_cnt = FollowUp.objects.filter(telecaller=target_user, lead__campaign=camp, is_attended=False).values('lead_id').distinct().count()
                closed_cnt = Lead.objects.filter(
                    assigned_to=target_user,
                    campaign=camp
                ).filter(
                    Q(pipeline_stage__name__icontains="closed") |
                    Q(pipeline_stage__name__icontains="won") |
                    Q(pipeline_stage__name__icontains="complete") |
                    Q(pipeline_stage__name__icontains="converted")
                ).count()

                active_cnt = max(0, assigned_cnt - closed_cnt)
                assigned_date_str = ca.assigned_at.strftime("%Y-%m-%d") if ca.assigned_at else ""

                campaigns_list.append({
                    "s_no": idx,
                    "campaign_id": camp.id,
                    "campaign_name": camp.name,
                    "name": camp.name,
                    "assigned_leads_count": assigned_cnt,
                    "assigned_leads": assigned_cnt,
                    "unassigned_leads_count": unassigned_cnt,
                    "unassigned_leads": unassigned_cnt,
                    "called_leads_count": called_cnt,
                    "called_leads": called_cnt,
                    "rescheduled_leads_count": rescheduled_cnt,
                    "rescheduled_leads": rescheduled_cnt,
                    "closed_leads_count": closed_cnt,
                    "closed_leads": closed_cnt,
                    "active_leads_count": active_cnt,
                    "completed_leads_count": closed_cnt,
                    "status": "Active" if ca.is_active else "Paused",
                    "assigned_date": assigned_date_str
                })
                idx += 1

        return {
            "status": "success",
            "message": "User campaigns fetched successfully",
            "data": {
                "user_id": target_user.id,
                "user_name": user_name,
                "emp_id": user_emp_id,
                "total_campaigns": len(campaigns_list),
                "campaigns": campaigns_list
            }
        }
    except Exception as e:
        raise APIException(str(e))


def fetch_user_transfer_campaigns_admin_service(from_user_id=None, emp_id=None):
    """
    User Management -> Action Column -> Transfer Button Modal API.
    Fetches campaign list and lead counts for a source user.
    """
    try:
        from_user = None
        if from_user_id:
            from_user = User.objects.filter(id=from_user_id).first()
        elif emp_id:
            from_user = User.objects.filter(employee_id=emp_id).first()

        if not from_user:
            return {
                "status": "error",
                "message": "Source user not found"
            }

        ca_qs = CampaignAssignedAgent.objects.select_related('campaign', 'campaign__pipeline_category').filter(agent_user=from_user).order_by('campaign_id')
        
        seen_campaigns = set()
        data_list = []
        idx = 1

        for ca in ca_qs:
            camp = ca.campaign
            if camp.id in seen_campaigns:
                continue
            seen_campaigns.add(camp.id)

            leads_cnt = Lead.objects.filter(assigned_to=from_user, campaign=camp).count()
            pipeline_name = camp.pipeline_category.display_name or camp.pipeline_category.category_name if camp.pipeline_category else "Education"

            data_list.append({
                "s_no": idx,
                "campaign_id": camp.id,
                "campaign_name": camp.name,
                "pipeline_name": pipeline_name,
                "total_leads": leads_cnt
            })
            idx += 1

        leads_campaign_ids = Lead.objects.filter(assigned_to=from_user, campaign__isnull=False).values_list('campaign_id', flat=True).distinct()
        for c_id in leads_campaign_ids:
            if c_id not in seen_campaigns:
                seen_campaigns.add(c_id)
                camp = CampaignName.objects.filter(id=c_id).first()
                if camp:
                    leads_cnt = Lead.objects.filter(assigned_to=from_user, campaign=camp).count()
                    pipeline_name = camp.pipeline_category.display_name or camp.pipeline_category.category_name if camp.pipeline_category else "Education"
                    data_list.append({
                        "s_no": idx,
                        "campaign_id": camp.id,
                        "campaign_name": camp.name,
                        "pipeline_name": pipeline_name,
                        "total_leads": leads_cnt
                    })
                    idx += 1

        return {
            "status": "success",
            "data": data_list
        }
    except Exception as e:
        raise APIException(str(e))









