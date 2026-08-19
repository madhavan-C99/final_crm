from rest_framework.views import APIView
from rest_framework import serializers
from rest_framework.response import Response
from rest_framework import status
from adm.services.permission_services import (
    authorize_request,
    create_permission,
    assign_permission_to_role,
    fetch_perms_list,
    fetch_roles_list,
)


class AddPermAPIView(APIView):
    """
    Registers a new API permission into adm_perm and auto-assigns it to Developer role!
    """
    class InputSerializer(serializers.Serializer):
        name = serializers.CharField(required=True)
        display_value = serializers.CharField(required=True)
        code = serializers.CharField(required=True)
        perm_group = serializers.CharField(required=False, default="perm_apis")

    def post(self, request):
        authorize_request('api_add_perm', request.user)
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user_name = request.user.username if request.user and request.user.is_authenticated else 'system'
        perm_name = create_permission(user_name, **serializer.validated_data)

        return Response({
            "status": "success",
            "message": f"Permission '{perm_name}' registered successfully!",
            "data": serializer.validated_data
        }, status=status.HTTP_201_CREATED)


class FetchPermsListAPIView(APIView):
    """
    Returns all registered API permissions (perm_group = perm_apis).
    """
    def post(self, request):
        authorize_request('api_fetch_perms_list', request.user)
        perms_list = fetch_perms_list()
        return Response({
            "status": "success",
            "data": perms_list
        }, status=status.HTTP_200_OK)


class FetchRolesListAPIView(APIView):
    """
    Returns all 3 system roles (developer, admin, telecaller).
    """
    def post(self, request):
        authorize_request('api_fetch_roles_list', request.user)
        roles_list = fetch_roles_list()
        return Response({
            "status": "success",
            "data": roles_list
        }, status=status.HTTP_200_OK)


class AssignRolePermAPIView(APIView):
    """
    Assigns an existing permission code to a role in adm_role_perms.
    """
    class InputSerializer(serializers.Serializer):
        role_id = serializers.IntegerField(required=True)
        perm_id = serializers.IntegerField(required=True)

    def post(self, request):
        authorize_request('api_assign_role_perm', request.user)
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user_name = request.user.username if request.user and request.user.is_authenticated else 'system'
        result_msg = assign_permission_to_role(user_name=user_name, **serializer.validated_data)

        return Response({
            "status": "success",
            "message": result_msg
        }, status=status.HTTP_200_OK)
