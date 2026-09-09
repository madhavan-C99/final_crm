from rest_framework.views import APIView
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.decorators import authentication_classes, permission_classes
from adm.services.team_services import (
    fetch_all_teams_admin_service, create_team_admin_service,
    edit_team_admin_service, delete_team_admin_service,
    fetch_team_dropdowns_admin_service
)
from adm.services.permission_services import authorize_request

@authentication_classes([])
@permission_classes([])
class FetchAllTeamsAdminApi(APIView):
    def get(self, request):
        res = fetch_all_teams_admin_service()
        return Response(res, status=status.HTTP_200_OK)


@authentication_classes([])
@permission_classes([])
class CreateTeamAdminApi(APIView):
    class InputSerializer(serializers.Serializer):
        name = serializers.CharField(required=True)
        color = serializers.CharField(required=False, allow_blank=True, allow_null=True, default="#6366F1")
        lead_id = serializers.IntegerField(required=False, allow_null=True)
        member_ids = serializers.ListField(
            child=serializers.IntegerField(), required=False, default=[]
        )

    def post(self, request):
        if request.user and request.user.is_authenticated:
            authorize_request('api_create_team_admin', request.user)
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        res = create_team_admin_service(
            admin_user=request.user if request.user and request.user.is_authenticated else None,
            data=serializer.validated_data
        )
        status_code = status.HTTP_201_CREATED if res.get("status") else status.HTTP_400_BAD_REQUEST
        return Response(res, status=status_code)


@authentication_classes([])
@permission_classes([])
class EditTeamAdminApi(APIView):
    class InputSerializer(serializers.Serializer):
        id = serializers.IntegerField(required=False, allow_null=True)
        team_id = serializers.IntegerField(required=False, allow_null=True)
        name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
        color = serializers.CharField(required=False, allow_blank=True, allow_null=True)
        branch_id = serializers.IntegerField(required=False, allow_null=True)
        lead_id = serializers.IntegerField(required=False, allow_null=True)
        member_ids = serializers.ListField(
            child=serializers.IntegerField(), required=False, allow_null=True
        )

    def post(self, request, pk=None):
        if request.user and request.user.is_authenticated:
            authorize_request('api_edit_team_admin', request.user)
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        res = edit_team_admin_service(
            admin_user=request.user if request.user and request.user.is_authenticated else None,
            data=serializer.validated_data,
            team_id=pk
        )
        status_code = status.HTTP_200_OK if res.get("status") else status.HTTP_400_BAD_REQUEST
        return Response(res, status=status_code)

    def put(self, request, pk=None):
        return self.post(request, pk)

    def patch(self, request, pk=None):
        return self.post(request, pk)


@authentication_classes([])
@permission_classes([])
class DeleteTeamAdminApi(APIView):
    class InputSerializer(serializers.Serializer):
        id = serializers.IntegerField(required=False, allow_null=True)
        team_id = serializers.IntegerField(required=False, allow_null=True)

    def post(self, request, pk=None):
        if request.user and request.user.is_authenticated:
            authorize_request('api_delete_team_admin', request.user)
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        res = delete_team_admin_service(
            admin_user=request.user if request.user and request.user.is_authenticated else None,
            data=serializer.validated_data,
            team_id=pk
        )
        status_code = status.HTTP_200_OK if res.get("status") else status.HTTP_400_BAD_REQUEST
        return Response(res, status=status_code)

    def delete(self, request, pk=None):
        return self.post(request, pk)


@authentication_classes([])
@permission_classes([])
class FetchTeamDropdownsAdminApi(APIView):
    class InputSerializer(serializers.Serializer):
        team_id = serializers.IntegerField(required=False, allow_null=True)

    def post(self, request):
        if request.user and request.user.is_authenticated:
            authorize_request('api_fetch_team_dropdowns_admin', request.user)
        serializer = self.InputSerializer(data=request.data or {})
        serializer.is_valid(raise_exception=True)
        res = fetch_team_dropdowns_admin_service(team_id=serializer.validated_data.get('team_id'))
        return Response(res, status=status.HTTP_200_OK)


