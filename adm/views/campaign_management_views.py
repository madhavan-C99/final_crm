from adm.services.permission_services import authorize_request
from rest_framework.views import APIView
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.decorators import authentication_classes, permission_classes

from ..services.campaign_management_services import (
    fetch_pipeline_categories,
    fetch_campaign_managers,
    fetch_campaign_agents,
    create_campaign,
    toggle_campaign_status,
    fetch_campaign_detail,
    update_campaign_detail,
)


# @authentication_classes([])
# @permission_classes([])
class PipelineCategoriesView(APIView):
    class InputSerializers(serializers.Serializer):
        pass

    def post(self, request):
        authorize_request('api_pipeline_categories_admin', request.user)
        serializer = self.InputSerializers(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = fetch_pipeline_categories(user=request.user, **serializer.validated_data)
        return Response({"data": data}, status=status.HTTP_200_OK)


# @authentication_classes([])
# @permission_classes([])
class CampaignManagersView(APIView):
    class InputSerializers(serializers.Serializer):
        pass

    def post(self, request):
        authorize_request('api_campaign_managers_admin', request.user)
        serializer = self.InputSerializers(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = fetch_campaign_managers(user=request.user, **serializer.validated_data)
        return Response({"data": data}, status=status.HTTP_200_OK)


# @authentication_classes([])
# @permission_classes([])
class CampaignAgentsView(APIView):
    class InputSerializers(serializers.Serializer):
        pass

    def post(self, request):
        authorize_request('api_campaign_agents_admin', request.user)
        serializer = self.InputSerializers(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = fetch_campaign_agents(user=request.user, **serializer.validated_data)
        return Response({"data": data}, status=status.HTTP_200_OK)


# @authentication_classes([])
# @permission_classes([])
class CreateCampaignView(APIView):
    class InputSerializers(serializers.Serializer):
        name = serializers.CharField(required=True)
        pipeline_category_id = serializers.IntegerField(required=False, allow_null=True)
        manager_id = serializers.IntegerField(required=False, allow_null=True)
        agent_ids = serializers.ListField(child=serializers.IntegerField(), required=False, default=[])
        distribution_type = serializers.CharField(required=False, default="on_demand")

    def post(self, request):
        authorize_request('api_create_campaign_admin', request.user)
        serializer = self.InputSerializers(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = create_campaign(user=request.user, **serializer.validated_data)
        return Response({"data": result}, status=status.HTTP_201_CREATED)


# @authentication_classes([])
# @permission_classes([])
class ToggleCampaignStatusView(APIView):
    class InputSerializers(serializers.Serializer):
        campaign_id = serializers.IntegerField(required=True)
        is_active = serializers.BooleanField(required=True)

    def post(self, request):
        authorize_request('api_toggle_campaign_status_admin', request.user)
        serializer = self.InputSerializers(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = toggle_campaign_status(user=request.user, **serializer.validated_data)
        return Response({"data": result}, status=status.HTTP_200_OK)


# @authentication_classes([])
# @permission_classes([])
class FetchCampaignDetailView(APIView):
    class InputSerializers(serializers.Serializer):
        campaign_id = serializers.IntegerField(required=False, allow_null=True)
        campaign_name = serializers.CharField(required=False, allow_null=True, allow_blank=True)

    def post(self, request):
        authorize_request('api_fetch_campaign_detail_admin', request.user)
        serializer = self.InputSerializers(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = fetch_campaign_detail(user=request.user, **serializer.validated_data)
        return Response({"data": data}, status=status.HTTP_200_OK)


# @authentication_classes([])
# @permission_classes([])
class UpdateCampaignDetailView(APIView):
    class InputSerializers(serializers.Serializer):
        campaign_id = serializers.IntegerField(required=False, allow_null=True)
        campaign_name = serializers.CharField(required=False, allow_null=True, allow_blank=True)
        is_active = serializers.BooleanField(required=False, allow_null=True)
        lead_distribution_type = serializers.CharField(required=False, allow_null=True, allow_blank=True)
        agent_toggles = serializers.ListField(child=serializers.DictField(), required=False, default=[])

    def post(self, request):
        authorize_request('api_update_campaign_detail_admin', request.user)
        serializer = self.InputSerializers(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = update_campaign_detail(user=request.user, **serializer.validated_data)
        return Response({"data": result}, status=status.HTTP_200_OK)