from adm.services.permission_services import authorize_request
from rest_framework.views import APIView
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.validators import UniqueValidator
from adm.models import User, Role
from ..services.user_services import create_user, create_role, create_token, fetch_user_permissions_service


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
