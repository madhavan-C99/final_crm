from rest_framework.views import APIView
from rest_framework import serializers, status
from rest_framework.response import Response
from adm.services.permission_services import authorize_request
from adm.services.lead_services import fetch_leads_service, action_lead_management_service, export_all_leads_admin


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
        entity = serializers.ChoiceField(
            choices=['leads', 'pending_payments', 'loss_approval_requests', 'performance'],
            default='leads'
        )
        export_format = serializers.ChoiceField(choices=['excel', 'csv', 'json'], default='excel')
        filters = serializers.JSONField(required=False, default=dict)

    def post(self, request):
        authorize_request('api_export_all_leads_admin', request.user)
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        entity = data.get('entity')
        filters = data.get('filters', {})

        if entity == 'leads':
            res = export_all_leads_admin(user=request.user, **filters)
        else:
            res = export_all_leads_admin(user=request.user, **filters)

        return Response(res, status=status.HTTP_200_OK)


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
