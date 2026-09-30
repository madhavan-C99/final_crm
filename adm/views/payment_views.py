from adm.services.permission_services import authorize_request
from rest_framework.views import APIView
from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework import serializers, status
from rest_framework.response import Response

from ..services.payment_services import (
    fetch_all_pending_payments_admin, export_pending_payments_admin,
    get_pending_payment_filter_dropdowns_admin
)
from telecalling.tasks.api_log_task import api_history_log


# @authentication_classes([])
# @permission_classes([])
class GetPendingPaymentFilterDropdownsAdmin(APIView):
    """
    Pending Payments Page -> Filter Modal Dropdowns API (No inputs required).
    """
    def get(self, request):
        authorize_request('api_get_pending_payment_filter_dropdowns_admin', request.user)
        result = get_pending_payment_filter_dropdowns_admin()
        return Response({"data": result}, status=status.HTTP_200_OK)


# @authentication_classes([])
# @permission_classes([])
class FetchAllPendingPaymentsAdmin(APIView):
    
    class InputSerializer(serializers.Serializer):
        search = serializers.CharField(required=False, allow_blank=True, allow_null=True)
        date_filter = serializers.CharField(required=False, allow_blank=True, allow_null=True)
        date_filter_type = serializers.CharField(required=False, allow_blank=True, allow_null=True)
        from_date = serializers.CharField(required=False, allow_blank=True, allow_null=True)
        to_date = serializers.CharField(required=False, allow_blank=True, allow_null=True)
        sort_by = serializers.CharField(required=False, allow_blank=True, allow_null=True)
        pipeline_id = serializers.IntegerField(required=False, allow_null=True)
        course_name_id = serializers.IntegerField(required=False, allow_null=True)
        course_plan_id = serializers.IntegerField(required=False, allow_null=True)
        course_timing_id = serializers.IntegerField(required=False, allow_null=True)
        payment_stage_id = serializers.IntegerField(required=False, allow_null=True)
        pending_amount_range = serializers.CharField(required=False, allow_blank=True, allow_null=True)
        page = serializers.IntegerField(required=False, default=1)
        limit = serializers.IntegerField(required=False, default=1000)

    def post(self, request):
        authorize_request('api_fetch_all_pending_payments_admin', request.user)
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        result = fetch_all_pending_payments_admin(user=request.user, **serializer.validated_data)

        log_data = {
            'user_id': request.user.id if request.user.id else None,
            'api_name': request.path,
            'method': request.method,
            'request_payload': serializer.validated_data,
            'response_payload': {"status": result.get("status"), "total_count": result.get("total_count")},
            'status_code': 200
        }
        api_history_log(log_data)

        return Response({"data": result}, status=status.HTTP_200_OK)


# @authentication_classes([])
# @permission_classes([])
class ExportPendingPaymentsAdmin(APIView):
  
    class InputSerializer(serializers.Serializer):
        search = serializers.CharField(required=False, allow_blank=True, allow_null=True)
        date_filter = serializers.CharField(required=False, allow_blank=True, allow_null=True)
        date_filter_type = serializers.CharField(required=False, allow_blank=True, allow_null=True)
        from_date = serializers.CharField(required=False, allow_blank=True, allow_null=True)
        to_date = serializers.CharField(required=False, allow_blank=True, allow_null=True)
        sort_by = serializers.CharField(required=False, allow_blank=True, allow_null=True)
        pipeline_id = serializers.IntegerField(required=False, allow_null=True)
        course_name_id = serializers.IntegerField(required=False, allow_null=True)
        course_plan_id = serializers.IntegerField(required=False, allow_null=True)
        course_timing_id = serializers.IntegerField(required=False, allow_null=True)
        payment_stage_id = serializers.IntegerField(required=False, allow_null=True)
        pending_amount_range = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    def post(self, request):
        authorize_request('api_export_pending_payments_admin', request.user)
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        return export_pending_payments_admin(user=request.user, **serializer.validated_data)
