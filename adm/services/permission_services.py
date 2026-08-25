from rest_framework.exceptions import PermissionDenied, APIException
from adm.models import Perm, Role, UserRole
import logging

logger = logging.getLogger('django')


def authorize_request(perm_name: str, user):
    """
    TL's Exact MoneyShift Authorization Helper:
    1. Superuser / Developer role gets 100% Super-Access instantly.
    2. Checks if perm_name exists in user's assigned permissions.
    3. Raises PermissionDenied if unauthorized.
    """
    try:
        if not user or not user.is_authenticated:
            raise PermissionDenied("Authentication required. Please login.")

        # 💻 Developer Super-Access Check (0.0001 seconds speed!)
        user_role_obj = user.user_roles.select_related('role').first() if hasattr(user, 'user_roles') else None
        role_obj = user_role_obj.role if user_role_obj else None
        if role_obj:
            if role_obj.code == 'DEV' or role_obj.name == 'developer' or getattr(user, 'is_superuser', False):
                return True
        elif getattr(user, 'is_superuser', False):
            return True

        # 📞 User Permissions Check by Name
        user_perms = user.get_perms() if hasattr(user, 'get_perms') else []
        if perm_name in user_perms:
            return True
        else:
            raise PermissionDenied(f"Not Authorized to use this API: '{perm_name}'")

    except PermissionDenied as pd:
        raise pd
    except Exception as e:
        raise APIException(str(e))


def create_permission(user_name, **data):
    """
    TL's Exact create_permission Helper:
    Creates a new permission in adm_perm and automatically links it to the Developer role!
    """
    try:
        new_perm = Perm.objects.create(
            name=data.get('name'),
            display_value=data.get('display_value'),
            code=data.get('code'),
            perm_group=data.get('perm_group', 'perm_apis'),
            created_by=user_name
        )

        # Auto-assign newly created permission to Developer (DEV) role
        dev_role = Role.objects.filter(code="DEV").first()
        if dev_role is not None:
            dev_role.perms.add(new_perm)

        return new_perm.name

    except Exception as e:
        raise APIException(str(e))


def assign_permission_to_role(**data):
    """
    Assigns an existing permission to a role in adm_role_perms.
    """
    try:
        role_id = data.get('role_id')
        perm_id = data.get('perm_id')
        user_name = data.get('user_name', 'system')

        role_obj = Role.objects.get(id=role_id)
        perm_obj = Perm.objects.get(id=perm_id)

        role_obj.perms.add(perm_obj)
        return f"Assigned {perm_obj.code} to {role_obj.name}"

    except Exception as e:
        raise APIException(str(e))


def fetch_perms_list():
    """
    Returns all permissions grouped under perm_apis.
    """
    try:
        perms = Perm.objects.filter(perm_group="perm_apis").values('id', 'name', 'display_value', 'code', 'perm_group', 'created_at')
        return list(perms)
    except Exception as e:
        raise APIException(str(e))


def fetch_roles_list():
    """
    Returns all 3 system roles (developer, admin, telecaller).
    """
    try:
        roles = Role.objects.all().values('id', 'name', 'display_value', 'code', 'description', 'created_at')
        return list(roles)
    except Exception as e:
        raise APIException(str(e))
