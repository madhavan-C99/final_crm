from adm.services.permission_services import authorize_request
from rest_framework.views import APIView
from rest_framework import serializers, status
from rest_framework.response import Response
from ..services.user_services import collection_query_service, get_select_options, drop_cate
from ..tasks.api_log_task import api_history_log


class CollectionQueryApi(APIView):
    class InputSerializer(serializers.Serializer):
        key = serializers.CharField(required=False, allow_null=True, allow_blank=True, default="")
        query = serializers.CharField(required=False, allow_null=True, allow_blank=True, default="")

    def post(self, request):
        authorize_request('api_collection_query', request.user)
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = collection_query_service(**serializer.validated_data)
        return Response({"data": data}, status=status.HTTP_201_CREATED)


class GetSelectOption(APIView):
    class InputSerializer(serializers.Serializer):
        fields = serializers.CharField(required=True)

    def get(self, request):
        authorize_request('api_get_select_option', request.user)
        serializer = self.InputSerializer(data=request.GET)
        serializer.is_valid(raise_exception=True)
        data = get_select_options(**serializer.validated_data)
        return Response({"data": data}, status=status.HTTP_200_OK)


class CreateDropdownCate(APIView):
    class InputSerializer(serializers.Serializer):
        category = serializers.CharField(required=True)

    def post(self, request):
        authorize_request('api_dropdown_cate_create', request.user)
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = drop_cate(request.user.first_name, **serializer.validated_data)
        return Response({"data": data}, status=status.HTTP_201_CREATED)


class CreateDropdownSub(APIView):
    class InputSerializer(serializers.Serializer):
        category_id = serializers.IntegerField(required=True)
        sub_category = serializers.CharField(required=True)

    def post(self, request):
        authorize_request('api_create_dropdown_sub', request.user)
        serializer = self.InputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response({"data": "Sub category created"}, status=status.HTTP_201_CREATED)
