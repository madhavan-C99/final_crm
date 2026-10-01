from adm.services.permission_services import authorize_request
from rest_framework.views import APIView
from rest_framework import serializers, status
from rest_framework.response import Response

from ..services.campaign_management_services import *


class PipelineCategoriesView(APIView):
    def post(self, request):
        authorize_request('api_pipeline_categories_admin', request.user)
        data = fetch_pipeline_categories(user=request.user)
        return Response({"status": True, "message": "Pipeline categories fetched successfully", "data": data}, status=status.HTTP_200_OK)


class CampaignManagersView(APIView):
    def post(self, request):
        authorize_request('api_campaign_managers_admin', request.user)
        data = fetch_campaign_managers(user=request.user)
        return Response({"status": True, "message": "Campaign managers fetched successfully", "data": data}, status=status.HTTP_200_OK)


class CampaignAgentsView(APIView):
    def post(self, request):
        authorize_request('api_campaign_agents_admin', request.user)
        data = fetch_campaign_agents(user=request.user)
        return Response({"status": True, "message": "Campaign agents fetched successfully", "data": data}, status=status.HTTP_200_OK)


class CreateCampaignView(APIView):
    class InputSerializer(serializers.Serializer):
        name = serializers.CharField(required=True)
        pipeline_category_id = serializers.IntegerField(required=False, allow_null=True)
        manager_id = serializers.IntegerField(required=False, allow_null=True)
        agent_ids = serializers.ListField(child=serializers.IntegerField(), required=False, default=[])
        distribution_type = serializers.CharField(required=False, default="on_demand")

    def post(self, request):
        authorize_request('api_create_campaign_admin', request.user)
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = create_campaign(user=request.user, **serializer.validated_data)
        return Response(result, status=status.HTTP_201_CREATED)


class ToggleCampaignStatusView(APIView):
    class InputSerializer(serializers.Serializer):
        campaign_id = serializers.IntegerField(required=True)
        is_active = serializers.BooleanField(required=True)

    def post(self, request):
        authorize_request('api_toggle_campaign_status_admin', request.user)
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = toggle_campaign_status(user=request.user, **serializer.validated_data)
        return Response(result, status=status.HTTP_200_OK)


class FetchCampaignDetailView(APIView):
    class InputSerializer(serializers.Serializer):
        campaign_id = serializers.IntegerField(required=False, allow_null=True)
        campaign_name = serializers.CharField(required=False, allow_null=True, allow_blank=True)

    def post(self, request):
        authorize_request('api_fetch_campaign_detail_admin', request.user)
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = fetch_campaign_detail(user=request.user, **serializer.validated_data)
        return Response(result, status=status.HTTP_200_OK)


class UpdateCampaignDetailView(APIView):
    class InputSerializer(serializers.Serializer):
        campaign_id = serializers.IntegerField(required=False, allow_null=True)
        campaign_name = serializers.CharField(required=False, allow_null=True, allow_blank=True)
        is_active = serializers.BooleanField(required=False, allow_null=True)
        lead_distribution_type = serializers.CharField(required=False, allow_null=True, allow_blank=True)
        agent_toggles = serializers.ListField(child=serializers.DictField(), required=False, default=[])

    def post(self, request):
        authorize_request('api_update_campaign_detail_admin', request.user)
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = update_campaign_detail(user=request.user, **serializer.validated_data)
        return Response(result, status=status.HTTP_200_OK)