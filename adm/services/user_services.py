import datetime
import uuid
import logging
from rest_framework.exceptions import APIException, AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db.models import Q
from adm.models import User, Role, UserRole

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
