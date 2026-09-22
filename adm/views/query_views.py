from rest_framework.views import APIView
from rest_framework import serializers, status
from rest_framework.response import Response
from adm.services.permission_services import authorize_request
from adm.services.query_services import exec_raw_sql


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
        opt_filter = qry_data.get('opt_filter') or {}
        
        # 🔒 SECURITY FIX: Auto-inject Organization & User ID for Multi-Tenancy Protection
        if getattr(request.user, 'organization_id', None):
            opt_filter.setdefault('organization_id', request.user.organization_id)
            opt_filter.setdefault('user_id', request.user.id)
            
        res_options = exec_raw_sql(target_field, opt_filter)
        return Response({'data': res_options or []}, status=status.HTTP_200_OK)
