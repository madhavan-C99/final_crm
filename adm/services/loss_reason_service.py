from adm.services.query_services import exec_raw_sql
from telecalling.models import LossReason
from rest_framework.exceptions import APIException
from django.db.models import Q


def fetch_loss_reasons_admin_service(user=None, data=None):
    try:
        data = data or {}
        opt_filter = {}

        if user and getattr(user, 'organization_id', None):
            opt_filter['organization_id'] = user.organization_id

        res_options = exec_raw_sql('L_LOSS_REASONS', opt_filter)

        return {
            "status": True,
            "message": "Loss reasons fetched successfully",
            "data": res_options or []
        }
    except Exception as e:
        raise APIException(str(e))


def create_loss_reason_admin_service(admin_user, data):
    try:
        name = data.get('name', '').strip()
        org = getattr(admin_user, 'organization', None) if admin_user else None
        created_by_str = (admin_user.get_full_name() or admin_user.username) if admin_user else "Admin"

        existing_qs = LossReason.objects.filter(name__iexact=name)
        if org:
            existing_qs = existing_qs.filter(Q(organization__isnull=True) | Q(organization=org))
        if existing_qs.exists():
            obj = existing_qs.first()
            if not obj.is_active:
                obj.is_active = True
                obj.updated_by = created_by_str
                obj.save()
                return {"status": True, "message": "Loss reason reactivated successfully", "id": obj.id}
            raise APIException(f"Loss reason '{name}' already exists")

        obj = LossReason.objects.create(
            name=name,
            is_active=True,
            organization=org,
            created_by=created_by_str,
            updated_by=created_by_str
        )
        return {
            "status": True,
            "message": "Loss reason created successfully",
            "data": {
                "id": obj.id,
                "name": obj.name,
                "is_active": obj.is_active
            }
        }
    except Exception as e:
        raise APIException(str(e))


def update_loss_reason_admin_service(admin_user, data):
    try:
        reason_id = data.get('id') or data.get('loss_reason_id')
        if not reason_id:
            raise APIException("loss_reason_id or id is required")

        obj = LossReason.objects.filter(id=reason_id).first()
        if not obj:
            raise APIException("Loss reason not found")

        updated_by_str = (admin_user.get_full_name() or admin_user.username) if admin_user else "Admin"

        if data.get('name') and str(data['name']).strip():
            obj.name = str(data['name']).strip()

        if 'is_active' in data and data['is_active'] is not None:
            obj.is_active = bool(data['is_active'])

        obj.updated_by = updated_by_str
        obj.save()

        return {
            "status": True,
            "message": "Loss reason updated successfully",
            "data": {
                "id": obj.id,
                "name": obj.name,
                "is_active": obj.is_active
            }
        }
    except Exception as e:
        raise APIException(str(e))
