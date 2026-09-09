from adm.services.permission_services import authorize_request
from rest_framework.views import APIView
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.validators import UniqueValidator
from adm.models import User, Role

from ..services.user_services import (
    create_user, create_role, create_token, fetch_user_permissions_service,
    fetch_all_users_admin_service, create_user_admin_service, edit_user_admin_service,
    toggle_user_status_admin_service, change_user_password_admin_service,
    enable_disable_lead_assignment_admin_service, transfer_leads_admin_service,
    delete_user_admin_service, fetch_user_dropdowns_admin_service,
    fetch_user_campaigns_admin_service, fetch_user_transfer_campaigns_admin_service
)


class EnableDisableLeadAssignmentAdminApi(APIView):
    class InputSerializer(serializers.Serializer):
        id = serializers.IntegerField(required=False, allow_null=True)
        emp_id = serializers.CharField(required=False, allow_blank=True, allow_null=True)
        disable_lead_assignment = serializers.BooleanField(required=False, allow_null=True)
        is_lead_enabled = serializers.BooleanField(required=False, allow_null=True)

    def post(self, request):
        authorize_request('api_enable_disable_lead_assignment_admin', request.user)
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        res = enable_disable_lead_assignment_admin_service(
            admin_user=request.user,
            data=serializer.validated_data
        )
        status_code = status.HTTP_200_OK if res.get('status') else status.HTTP_400_BAD_REQUEST
        return Response(res, status=status_code)


class FetchAllUsersAdminApi(APIView):
    class InputSerializer(serializers.Serializer):
        page = serializers.IntegerField(required=False, default=1)
        page_size = serializers.CharField(required=False, default="50")
        search = serializers.CharField(required=False, allow_blank=True, allow_null=True, default=None)
        sort_by = serializers.CharField(required=False, allow_blank=True, allow_null=True, default=None)

    def post(self, request):
        authorize_request('api_fetch_all_users_admin', request.user)
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = fetch_all_users_admin_service(
            user=request.user,
            **serializer.validated_data
        )
        return Response(data, status=status.HTTP_200_OK)

class CreateUserAdminApi(APIView):
    class InputSerializer(serializers.Serializer):
        full_name = serializers.CharField(required=True)
        contact_no = serializers.CharField(required=False, allow_blank=True, allow_null=True)
        email = serializers.EmailField(required=True)
        location = serializers.CharField(required=False, allow_blank=True, allow_null=True)
        role = serializers.CharField(required=False, allow_blank=True, allow_null=True)
        reporting_to = serializers.CharField(required=False, allow_blank=True, allow_null=True)
        status = serializers.CharField(required=False, default="Active")
        joined_date = serializers.CharField(required=False, allow_blank=True, allow_null=True)
        emp_id = serializers.CharField(required=False, allow_blank=True, allow_null=True)
        team = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    def post(self, request):
        authorize_request('api_create_user_admin', request.user)
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        res = create_user_admin_service(
            admin_user=request.user,
            data=serializer.validated_data
        )
        status_code = status.HTTP_201_CREATED if res.get('status') else status.HTTP_400_BAD_REQUEST
        return Response(res, status=status_code)

class EditUserAdminApi(APIView):
    class InputSerializer(serializers.Serializer):
        id = serializers.IntegerField(required=False, allow_null=True)
        emp_id = serializers.CharField(required=False, allow_blank=True, allow_null=True)
        full_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
        contact_no = serializers.CharField(required=False, allow_blank=True, allow_null=True)
        email = serializers.EmailField(required=False, allow_blank=True, allow_null=True)
        location = serializers.CharField(required=False, allow_blank=True, allow_null=True)
        role = serializers.CharField(required=False, allow_blank=True, allow_null=True)
        reporting_to = serializers.CharField(required=False, allow_blank=True, allow_null=True)
        status = serializers.CharField(required=False, allow_blank=True, allow_null=True)
        joined_date = serializers.CharField(required=False, allow_blank=True, allow_null=True)
        team = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    def post(self, request):
        authorize_request('api_edit_user_admin', request.user)
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        res = edit_user_admin_service(
            admin_user=request.user,
            data=serializer.validated_data
        )
        status_code = status.HTTP_200_OK if res.get('status') else status.HTTP_404_NOT_FOUND
        return Response(res, status=status_code)


class ToggleUserStatusAdminApi(APIView):
    class InputSerializer(serializers.Serializer):
        id = serializers.IntegerField(required=False, allow_null=True)
        emp_id = serializers.CharField(required=False, allow_blank=True, allow_null=True)
        status = serializers.CharField(required=True)

    def post(self, request):
        authorize_request('api_toggle_user_status_admin', request.user)
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        res = toggle_user_status_admin_service(
            admin_user=request.user,
            data=serializer.validated_data
        )
        status_code = status.HTTP_200_OK if res.get('status') else status.HTTP_400_BAD_REQUEST
        return Response(res, status=status_code)



class ChangeUserPasswordAdminApi(APIView):
    class InputSerializer(serializers.Serializer):
        id = serializers.IntegerField(required=False, allow_null=True)
        emp_id = serializers.CharField(required=False, allow_blank=True, allow_null=True)
        newPassword = serializers.CharField(required=True)
        confirmPassword = serializers.CharField(required=True)

    def post(self, request):
        authorize_request('api_change_user_password_admin', request.user)
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        res = change_user_password_admin_service(
            admin_user=request.user,
            data=serializer.validated_data
        )
        status_code = status.HTTP_200_OK if res.get('status') else status.HTTP_400_BAD_REQUEST
        return Response(res, status=status_code)



class TransferLeadsAdminApi(APIView):
    class InputSerializer(serializers.Serializer):
        from_user_id = serializers.IntegerField(required=True)
        to_user_id = serializers.IntegerField(required=True)
        lead_ids = serializers.ListField(child=serializers.IntegerField(), required=False, default=[])
        stage_id = serializers.IntegerField(required=False, allow_null=True)

    def post(self, request):
        authorize_request('api_transfer_leads_admin', request.user)
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        res = transfer_leads_admin_service(
            admin_user=request.user,
            data=serializer.validated_data
        )
        status_code = status.HTTP_200_OK if res.get('status') else status.HTTP_400_BAD_REQUEST
        return Response(res, status=status_code)


class DeleteUserAdminApi(APIView):
    class InputSerializer(serializers.Serializer):
        id = serializers.IntegerField(required=False, allow_null=True)
        emp_id = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    def post(self, request):
        authorize_request('api_delete_user_admin', request.user)
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        res = delete_user_admin_service(
            admin_user=request.user,
            data=serializer.validated_data
        )
        status_code = status.HTTP_200_OK if res.get('status') else status.HTTP_400_BAD_REQUEST
        return Response(res, status=status_code)



@authentication_classes([])
@permission_classes([])
class CreateToken(APIView):
    class InputSerializer(serializers.Serializer):
        username = serializers.CharField()
        password = serializers.CharField(write_only=True)

    def post(self, request):
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token, user_details = create_token(**serializer.validated_data)
        return Response({"data": {"token": token, "user": user_details}}, status=status.HTTP_200_OK)


@authentication_classes([])
@permission_classes([])
class RefreshTokenView(APIView):
    class InputSerializer(serializers.Serializer):
        refresh = serializers.CharField()

    def post(self, request):
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            refresh = RefreshToken(serializer.validated_data['refresh'])
            new_access = str(refresh.access_token)
            new_refresh = str(refresh)
            return Response({"data": {"access": new_access, "refresh": new_refresh}}, status=status.HTTP_200_OK)
        except Exception:
            raise AuthenticationFailed(detail='Invalid or expired refresh token.')


class FetchUserPermissionsView(APIView):
    def get(self, request):
        user = request.user
        if not user or not user.is_authenticated:
            return Response({
                "status": "error",
                "message": "Authentication credentials were not provided."
            }, status=status.HTTP_401_UNAUTHORIZED)

        perms = user.get_perms() if hasattr(user, 'get_perms') else []
        return Response({
            "status": "success",
            "message": "Permissions fetched successfully",
            "data": {
                "permissions": perms
            }
        }, status=status.HTTP_200_OK)

    def post(self, request):
        return self.get(request)


class CreateUserView(APIView):
    class InputSerializer(serializers.Serializer):
        username = serializers.CharField(required=True, validators=[UniqueValidator(queryset=User.objects.all())])
        email = serializers.EmailField(required=True, validators=[UniqueValidator(queryset=User.objects.all())])
        first_name = serializers.CharField(required=True)
        mobile_number = serializers.CharField(required=False, allow_null=True)
        role_id = serializers.IntegerField(required=True)
        password = serializers.CharField(required=True)
        confirm_password = serializers.CharField(required=True)

    def post(self, request):
        authorize_request('api_create_user', request.user)
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        usr = create_user(request.user.username, **serializer.validated_data)
        return Response({'data': {'user': usr}}, status=status.HTTP_201_CREATED)


class CreateRoleView(APIView):
    class InputSerializer(serializers.Serializer):
        name = serializers.CharField(required=True, validators=[UniqueValidator(queryset=Role.objects.all())])
        display_value = serializers.CharField(required=True)
        code = serializers.CharField(required=True, validators=[UniqueValidator(queryset=Role.objects.all())])
        description = serializers.CharField(required=True)

    def post(self, request):
        authorize_request('api_create_role', request.user)
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        role_code = create_role(**serializer.validated_data)
        return Response({'data': {'role_code': role_code}}, status=status.HTTP_201_CREATED)


class FetchUserDropdownsAdminApi(APIView):
    def get(self, request):
        authorize_request('api_fetch_user_dropdowns_admin', request.user)
        res = fetch_user_dropdowns_admin_service()
        return Response(res, status=status.HTTP_200_OK)


class FetchUserCampaignsAdminApi(APIView):
    """
    User Management -> View Campaign Modal API.
    POST method with InputSerializer.
    """
    class InputSerializer(serializers.Serializer):
        id = serializers.IntegerField(required=False, allow_null=True)
        user_id = serializers.IntegerField(required=False, allow_null=True)
        emp_id = serializers.CharField(required=False, allow_blank=True, allow_null=True)
        employee_id = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    def post(self, request):
        authorize_request('api_fetch_user_campaigns_admin', request.user)
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        res = fetch_user_campaigns_admin_service(**serializer.validated_data)
        status_code = status.HTTP_200_OK if res.get('status') == 'success' else status.HTTP_400_BAD_REQUEST
        return Response(res, status=status_code)


class FetchUserTransferCampaignsAdminApi(APIView):
    
    class InputSerializer(serializers.Serializer):
        from_user_id = serializers.IntegerField(required=False, allow_null=True)
        emp_id = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    def post(self, request):
        authorize_request('api_fetch_user_transfer_campaigns_admin', request.user)
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        res = fetch_user_transfer_campaigns_admin_service(**serializer.validated_data)
        status_code = status.HTTP_200_OK if res.get('status') == 'success' else status.HTTP_400_BAD_REQUEST
        return Response(res, status=status_code)







