from adm.services.permission_services import authorize_request
from rest_framework.views import APIView
from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework import serializers, status

from adm.services.performance_services import (
    fetch_performance_overview_admin,
    assign_users_to_team_admin,
    update_telecaller_target_admin,
    get_performance_filter_dropdowns_admin,
    export_performance_overview_admin,
    fetch_monthly_target_admin_service,
    fetch_target_dropdowns_admin_service,
    set_monthly_target_admin_service
)

# @authentication_classes([])
# @permission_classes([])
class FetchPerformanceOverviewAdmin(APIView):
    def post(self, request):
        authorize_request('api_fetch_performance_overview_admin', request.user)
        result = fetch_performance_overview_admin(request.data, user=request.user)
        return Response(result, status=status.HTTP_200_OK)


# @authentication_classes([])
# @permission_classes([])
class AssignUsersToTeamAdmin(APIView):
    def post(self, request):
        authorize_request('api_assign_users_to_team_admin', request.user)
        admin_user = request.user if getattr(request.user, 'is_authenticated', False) else None
        result = assign_users_to_team_admin(request.data, admin_user=admin_user)
        return Response(result, status=status.HTTP_200_OK)


# @authentication_classes([])
# @permission_classes([])
class UpdateTelecallerTargetAdmin(APIView):
    def post(self, request):
        authorize_request('api_update_telecaller_target_admin', request.user)
        admin_user = request.user if getattr(request.user, 'is_authenticated', False) else None
        result = update_telecaller_target_admin(request.data, admin_user=admin_user)
        return Response(result, status=status.HTTP_200_OK)


# @authentication_classes([])
# @permission_classes([])
class GetPerformanceFilterDropdownsAdmin(APIView):
    def get(self, request):
        authorize_request('api_get_performance_filter_dropdowns_admin', request.user)
        result = get_performance_filter_dropdowns_admin(user=request.user)
        return Response(result, status=status.HTTP_200_OK)


# @authentication_classes([])
# @permission_classes([])
class ExportPerformanceOverviewAdmin(APIView):
    def post(self, request):
        authorize_request('api_export_performance_overview_admin', request.user)
        return export_performance_overview_admin(request.data, user=request.user)


class FetchMonthlyTargetAdmin(APIView):
    class InputSerializer(serializers.Serializer):
        month = serializers.CharField(required=False, allow_blank=True, allow_null=True)
        from_date = serializers.CharField(required=False, allow_blank=True, allow_null=True)
        to_date = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    def post(self, request):
        authorize_request('api_fetch_monthly_target_admin', request.user)
        serializer = self.InputSerializer(data=request.data or {})
        serializer.is_valid(raise_exception=True)
        result = fetch_monthly_target_admin_service(serializer.validated_data, user=request.user)
        return Response(result, status=status.HTTP_200_OK)


class FetchTargetDropdownsAdmin(APIView):
    def get(self, request):
        authorize_request('api_fetch_target_dropdowns_admin', request.user)
        result = fetch_target_dropdowns_admin_service(user=request.user)
        return Response(result, status=status.HTTP_200_OK)


class SetMonthlyTargetAdmin(APIView):
    class InputSerializer(serializers.Serializer):
        month = serializers.CharField(required=False, allow_blank=True, allow_null=True)
        from_date = serializers.CharField(required=False, allow_blank=True, allow_null=True)
        to_date = serializers.CharField(required=False, allow_blank=True, allow_null=True)
        target_for = serializers.CharField(required=False, allow_blank=True, allow_null=True, default="Team")
        team_id = serializers.IntegerField(required=False, allow_null=True)
        team_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
        employee_id = serializers.IntegerField(required=False, allow_null=True)
        lead_target = serializers.IntegerField(required=False, allow_null=True, default=0)
        amount_target = serializers.FloatField(required=False, allow_null=True, default=0.0)
        target_calls = serializers.IntegerField(required=False, allow_null=True, default=0)
        individual_allocations = serializers.ListField(child=serializers.DictField(), required=False, allow_empty=True)

    def post(self, request):
        authorize_request('api_set_monthly_target_admin', request.user)
        serializer = self.InputSerializer(data=request.data or {})
        serializer.is_valid(raise_exception=True)
        result = set_monthly_target_admin_service(serializer.validated_data, admin_user=request.user)
        status_code = status.HTTP_201_CREATED if result.get("status") else status.HTTP_400_BAD_REQUEST
        return Response(result, status=status_code)
