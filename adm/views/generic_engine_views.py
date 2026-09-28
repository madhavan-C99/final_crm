from rest_framework.views import APIView
from rest_framework import serializers, status
from rest_framework.response import Response
from adm.services.permission_services import authorize_request
from adm.services.lead_services import fetch_leads_service, action_lead_management_service, export_all_leads_admin
from adm.services.add_new_lead_services import create_new_lead
from adm.services.generic_export_services import export_data_service



class FetchLeadsApi(APIView):
    print()
    
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
            choices=['leads', 'pending_payments', 'loss_approvals', 'performance'],
            default='leads'
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
        filters = serializers.JSONField(required=False, default=dict)

    def post(self, request):
        authorize_request('api_export_all_leads_admin', request.user)
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        result = export_data_service(
            user=request.user,
            entity=data.get('entity'),
            export_format=data.get('export_format'),
            selected_ids=data.get('selected_ids', []),
            columns=data.get('columns', []),
            filters=data.get('filters', {})
        )
        return Response(result, status=status.HTTP_200_OK)



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

