from adm.services.permission_services import authorize_request
from rest_framework.views import APIView
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.decorators import authentication_classes, permission_classes
from ..services.enquiry_sheet_services import (
    fetch_campaign_enquiry_sheet,
    fetch_lead_summary_report,
    update_lead_summary,
    delete_lead_summary,
    bulk_delete_leads,
    move_lead_campaign,
    assign_lead_telecaller,
    change_lead_status,
    fetch_call_log_report,
)

class CampaignEnquirySheetView(APIView):
    class InputSerializers(serializers.Serializer):
        campaign_id = serializers.CharField(required=False, allow_null=True, allow_blank=True)
        campaign_name = serializers.CharField(required=False, allow_null=True, allow_blank=True)

    def post(self, request):
        authorize_request('api_campaign_enquiry_sheet_admin', request.user)
        serializer = self.InputSerializers(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = fetch_campaign_enquiry_sheet(
            user=request.user, 
            **serializer.validated_data
        )
        return Response({"data": data}, status=status.HTTP_200_OK)

# @authentication_classes([])
# @permission_classes([])
class LeadSummaryReportView(APIView):
    class QueryInputSerializers(serializers.Serializer):
        campaign_id = serializers.CharField(required=False, allow_null=True, allow_blank=True)
        campaign_name = serializers.CharField(required=False, allow_null=True, allow_blank=True)
        search = serializers.CharField(required=False, allow_blank=True, default="")
        date_range = serializers.CharField(required=False, allow_null=True, allow_blank=True)
        assigned_to = serializers.CharField(required=False, allow_null=True, allow_blank=True)
        stages = serializers.CharField(required=False, allow_null=True, allow_blank=True)
        filter_campaign = serializers.CharField(required=False, allow_null=True, allow_blank=True)
        course_name = serializers.CharField(required=False, allow_null=True, allow_blank=True)
        course_plan = serializers.CharField(required=False, allow_null=True, allow_blank=True)
        lead_source = serializers.CharField(required=False, allow_null=True, allow_blank=True)
        payment_status = serializers.CharField(required=False, allow_null=True, allow_blank=True)
        priority = serializers.CharField(required=False, allow_null=True, allow_blank=True)

    def post(self, request):
        authorize_request('api_lead_summary_report_admin', request.user)
        serializer = self.QueryInputSerializers(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = fetch_lead_summary_report(
            user=request.user,
            **serializer.validated_data
        )
        return Response({"data": data}, status=status.HTTP_200_OK)

# @authentication_classes([])
# @permission_classes([])
class UpdateLeadSummaryView(APIView):
    class PostInputSerializers(serializers.Serializer):
        lead_id = serializers.IntegerField(required=False, allow_null=True)
        id = serializers.IntegerField(required=False, allow_null=True)

    def post(self, request):
        authorize_request('api_update_lead_summary_admin', request.user)
        serializer = self.PostInputSerializers(data=request.data)
        serializer.is_valid(raise_exception=True)
        lead_id = serializer.validated_data.get('lead_id') or serializer.validated_data.get('id')
        data = update_lead_summary(lead_id=lead_id, payload=request.data)
        return Response({"data": data}, status=status.HTTP_200_OK)

# @authentication_classes([])
# @permission_classes([])
class DeleteLeadSummaryView(APIView):
    def post(self, request):
        authorize_request('api_delete_lead_summary_admin', request.user)
        raw_data = request.data or {}
        lead_ids = raw_data.get('lead_ids')
        lead_id = raw_data.get('lead_id') or raw_data.get('id')
        user_val = raw_data.get('user_id') or raw_data.get('user') or raw_data.get('username') or request.user

        target_ids = []
        if isinstance(lead_ids, list):
            target_ids.extend([int(x) for x in lead_ids if str(x).isdigit()])
        elif isinstance(lead_id, list):
            target_ids.extend([int(x) for x in lead_id if str(x).isdigit()])
        elif lead_id is not None and str(lead_id).isdigit():
            target_ids.append(int(lead_id))

        if target_ids:
            data = bulk_delete_leads(lead_ids=target_ids, user=user_val)
        else:
            data = {"status": "error", "message": "No valid lead IDs provided"}

        return Response({"data": data}, status=status.HTTP_200_OK)

# @authentication_classes([])
# @permission_classes([])
class MoveLeadCampaignView(APIView):
    class InputSerializer(serializers.Serializer):
        lead_ids = serializers.ListField(child=serializers.IntegerField(), required=True)
        target_campaign = serializers.CharField(required=True)
        note = serializers.CharField(required=False, allow_blank=True, default="")

    def post(self, request):
        authorize_request('api_move_lead_campaign_admin', request.user)
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = move_lead_campaign(
            lead_ids=serializer.validated_data.get('lead_ids'),
            target_campaign=serializer.validated_data.get('target_campaign'),
            note=serializer.validated_data.get('note')
        )
        return Response({"data": data}, status=status.HTTP_200_OK)

# @authentication_classes([])
# @permission_classes([])
class AssignLeadTelecallerView(APIView):
    class InputSerializer(serializers.Serializer):
        lead_ids = serializers.ListField(child=serializers.IntegerField(), required=True)
        telecaller = serializers.CharField(required=True)
        note = serializers.CharField(required=False, allow_blank=True, default="")

    def post(self, request):
        authorize_request('api_assign_lead_telecaller_admin', request.user)
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = assign_lead_telecaller(
            lead_ids=serializer.validated_data.get('lead_ids'),
            telecaller=serializer.validated_data.get('telecaller'),
            note=serializer.validated_data.get('note')
        )
        return Response({"data": data}, status=status.HTTP_200_OK)

# @authentication_classes([])
# @permission_classes([])
class ChangeLeadStatusView(APIView):
    class InputSerializer(serializers.Serializer):
        lead_ids = serializers.ListField(child=serializers.IntegerField(), required=True)
        status_name = serializers.CharField(required=True)
        note = serializers.CharField(required=False, allow_blank=True, default="")

    def post(self, request):
        authorize_request('api_change_lead_status_admin', request.user)
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = change_lead_status(
            lead_ids=serializer.validated_data.get('lead_ids'),
            status_name=serializer.validated_data.get('status_name'),
            note=serializer.validated_data.get('note')
        )
        return Response({"data": data}, status=status.HTTP_200_OK)

# @authentication_classes([])
# @permission_classes([])
class CallLogReportView(APIView):
    class InputSerializers(serializers.Serializer):
        campaign_id = serializers.CharField(required=False, allow_null=True, allow_blank=True)
        campaign_name = serializers.CharField(required=False, allow_null=True, allow_blank=True)
        filter_campaign = serializers.CharField(required=False, allow_null=True, allow_blank=True)
        search = serializers.CharField(required=False, allow_null=True, allow_blank=True)
        date_range = serializers.CharField(required=False, allow_null=True, allow_blank=True)
        assigned_to = serializers.CharField(required=False, allow_null=True, allow_blank=True)
        call_status = serializers.CharField(required=False, allow_null=True, allow_blank=True)
        call_direction = serializers.CharField(required=False, allow_null=True, allow_blank=True)
        course_name = serializers.CharField(required=False, allow_null=True, allow_blank=True)
        course_plan = serializers.CharField(required=False, allow_null=True, allow_blank=True)
        lead_source = serializers.CharField(required=False, allow_null=True, allow_blank=True)
        priority = serializers.CharField(required=False, allow_null=True, allow_blank=True)

    def post(self, request):
        authorize_request('api_call_log_report_admin', request.user)
        serializer = self.InputSerializers(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = fetch_call_log_report(
            request.user,
            **serializer.validated_data
        )
        return Response({"data": data}, status=status.HTTP_200_OK)


# @authentication_classes([])
# @permission_classes([])
class DispositionLogView(APIView):
    class InputSerializers(serializers.Serializer):
        campaign_id = serializers.CharField(required=False, allow_null=True, allow_blank=True)
        campaign_name = serializers.CharField(required=False, allow_null=True, allow_blank=True)
        filter_campaign = serializers.CharField(required=False, allow_null=True, allow_blank=True)
        search = serializers.CharField(required=False, allow_null=True, allow_blank=True)
        date_range = serializers.CharField(required=False, allow_null=True, allow_blank=True)
        assigned_to = serializers.CharField(required=False, allow_null=True, allow_blank=True)
        stages = serializers.CharField(required=False, allow_null=True, allow_blank=True)

    # def post(self, request):
    #     serializer = self.InputSerializers(data=request.data)
    #     serializer.is_valid(raise_exception=True)
    #     data = fetch_disposition_log(
    #         request.user,
    #         **serializer.validated_data
    #     )
    #     return Response({"data": data}, status=status.HTTP_200_OK)