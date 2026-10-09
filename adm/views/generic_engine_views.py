from rest_framework.views import APIView
from rest_framework import serializers, status
from rest_framework.response import Response
from adm.services.permission_services import authorize_request
from adm.services.lead_services import fetch_leads_service, action_lead_management_service
from adm.services.add_new_lead_services import create_new_lead
from adm.services.generic_export_services import export_data_service


EXPORT_PERMISSION_BY_ENTITY = {
    "leads": "api_export_all_leads_admin",
    "pending_payments": "api_export_pending_payments_admin",
    "loss_approvals": "api_export_loss_lead_approval_requests_admin",
    "performance": "api_export_performance_overview_admin",
}


class FetchLeadsApi(APIView):
    class InputSerializer(serializers.Serializer):
        action = serializers.ChoiceField(
            choices=['FETCH_ALL', 'PIPELINE', 'FETCH_ONE', 'WON_LIST', 'LOST_LIST', 'FETCH_HISTORY'],
            default='FETCH_ALL'
        )
        lead_id = serializers.IntegerField(required=False, allow_null=True)
        filters = serializers.JSONField(required=False, default=dict)

    def post(self, request):
        authorize_request('api_fetch_all_leads', request.user)
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        result = fetch_leads_service(
            user=request.user,
            action=data.get('action'),
            lead_id=data.get('lead_id'),
            filters=data.get('filters', {})
        )
        return Response({'data': result}, status=status.HTTP_200_OK)


class ExportDataApi(APIView):
   
    class InputSerializer(serializers.Serializer):
        entity = serializers.CharField(
            required=False,
            allow_null=True,
            allow_blank=True,
            default=None
        )
        export_format = serializers.ChoiceField(
            choices=['excel', 'csv', 'pdf'],
            default='excel'
        )
        selected_ids = serializers.ListField(
            child=serializers.IntegerField(),
            required=False,
            default=list
        )
        columns = serializers.ListField(
            child=serializers.CharField(),
            required=False,
            default=list
        )
        selected_columns = serializers.ListField(
            child=serializers.CharField(),
            required=False,
            default=list
        )
        filters = serializers.DictField(required=False, default=dict)

    def post(self, request):
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data

        # 1. Extract columns (supports both 'columns' and 'selected_columns')
        cols = data.get('columns') or data.get('selected_columns') or request.data.get('selected_columns') or request.data.get('columns') or []

        # 2. Extract & auto-detect entity if missing or defaulted
        entity = data.get('entity') or request.data.get('entity') or request.data.get('export_type') or request.data.get('table')

        if not entity or entity not in EXPORT_PERMISSION_BY_ENTITY:
            cols_set = {str(c).lower().strip().replace(' ', '_') for c in cols}
            loss_cols = {"loss_reason", "effort_summary", "lead_age", "inquiry_date", "total_calls", "approval_status", "last_conversation_outcome"}
            pending_cols = {"payment_id", "joining_date", "due_date", "batch_timing", "amount_paid"}
            perf_cols = {"telecaller_id", "telecaller_name", "special_badge", "conversion_rate", "rating_label"}

            if cols_set & loss_cols or 'loss_reason' in request.data:
                entity = 'loss_approvals'
            elif cols_set & pending_cols:
                entity = 'pending_payments'
            elif cols_set & perf_cols:
                entity = 'performance'
            else:
                entity = 'leads'

        authorize_request(EXPORT_PERMISSION_BY_ENTITY[entity], request.user)
        filters = dict(data.get('filters', {}))
        for key, value in request.data.items():
            if key not in {'entity', 'export_format', 'selected_ids', 'columns', 'selected_columns', 'filters'}:
                filters[key] = value

        result = export_data_service(
            user=request.user,
            entity=entity,
            export_format=data.get('export_format', 'excel'),
            selected_ids=data.get('selected_ids', []),
            columns=cols,
            filters=filters
        )
        return Response({"data": result, **result}, status=status.HTTP_200_OK)



class ActionLeadManagementApi(APIView):
    
    class InputSerializer(serializers.Serializer):
        action = serializers.ChoiceField(
            choices=['MARK_WON', 'MARK_LOST', 'REASSIGN', 'CHANGE_STATUS', 'MOVE_CAMPAIGN'],
            required=True
        )
        lead_id = serializers.IntegerField(required=True)
        payload = serializers.JSONField(required=False, default=dict)

    def post(self, request):
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        res = action_lead_management_service(
            user=request.user,
            action=data.get('action'),
            lead_id=data.get('lead_id'),
            payload=data.get('payload', {})
        )
        return Response({'message': res}, status=status.HTTP_200_OK)


class CreateLeadApi(APIView):
   
    class InputSerializer(serializers.Serializer):
        full_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
        first_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
        last_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
        mobile_no = serializers.CharField(required=True)
        email = serializers.EmailField(required=False, allow_blank=True, allow_null=True)
        pipeline_stage_id = serializers.IntegerField(required=False, allow_null=True, default=1)
        campaign_id = serializers.IntegerField(required=False, allow_null=True)
        lead_source_id = serializers.IntegerField(required=False, allow_null=True)
        assigned_to_id = serializers.IntegerField(required=False, allow_null=True)
        priority_id = serializers.IntegerField(required=False, allow_null=True)

    def post(self, request):
        
        authorize_request('api_add_new_lead_admin', request.user)
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        result = create_new_lead(user=request.user, **serializer.validated_data)
        return Response({
            "status": "success",
            "message": "Lead created successfully!",
            "data": result
        }, status=status.HTTP_201_CREATED)
