from rest_framework.views import APIView
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from adm.services.permission_services import authorize_request
from adm.services.query_services import exec_raw_sql, exec_paginated_raw_sql


def _is_platform_super_admin(user):
    if getattr(user, 'is_superuser', False):
        return True

    user_roles = getattr(user, 'user_roles', None)
    role_assignment = user_roles.select_related('role').first() if user_roles else None
    role = getattr(role_assignment, 'role', None)
    role_code = str(getattr(role, 'code', '') or '').upper()
    role_name = str(getattr(role, 'name', '') or '').lower()
    return role_code in {'DEV', 'SUPERADMIN'} or role_name in {
        'developer', 'superadmin', 'super admin'
    }


def _scope_query_filters(user, opt_filter):
    filters = dict(opt_filter)
    if _is_platform_super_admin(user):
        if filters.get('organization_id') in (None, '', 0, '0'):
            filters.pop('organization_id', None)
        return filters

    organization_id = getattr(user, 'organization_id', None)
    if not organization_id:
        raise PermissionDenied("Your user account is not assigned to an organization.")

    filters['organization_id'] = organization_id
    filters['user_id'] = user.id
    return filters


class GetSelectOptions(APIView):
   
    class InputSerializer(serializers.Serializer):
        field = serializers.CharField(required=False, allow_blank=True, allow_null=True)
        option_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
        key = serializers.CharField(required=False, allow_blank=True, allow_null=True)
        opt_filter = serializers.JSONField(required=False, default=dict)

    def post(self, request):
        authorize_request('api_get_select_option', request.user)
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        qry_data = serializer.validated_data
        target_field = qry_data.get('field') or qry_data.get('option_name') or qry_data.get('key') or 'L_LEAD_SOURCES'
        opt_filter = _scope_query_filters(request.user, qry_data.get('opt_filter') or {})
            
        res_options = exec_raw_sql(target_field, opt_filter)
        return Response({'data': res_options or []}, status=status.HTTP_200_OK)


class GetGenericList(APIView):
    
    class InputSerializer(serializers.Serializer):
        key = serializers.CharField(required=True)
        opt_filter = serializers.JSONField(required=False, default=dict)
        page = serializers.IntegerField(required=False, default=1)
        page_size = serializers.IntegerField(required=False, default=50)

    def post(self, request):
        authorize_request('api_get_generic_list', request.user)
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        qry_data = serializer.validated_data
        key = qry_data.get('key')
        opt_filter = qry_data.get('opt_filter') or {}
        page = qry_data.get('page', 1)
        page_size = qry_data.get('page_size', 50)

        opt_filter = _scope_query_filters(request.user, opt_filter)

        result = exec_paginated_raw_sql(key, opt_filter, page=page, page_size=page_size)
        return Response({'data': result}, status=status.HTTP_200_OK)
