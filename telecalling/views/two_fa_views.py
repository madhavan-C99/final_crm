from adm.services.permission_services import authorize_request
from rest_framework.views import APIView
from rest_framework.response import Response
from ..services.two_fa_service import *

class Enable2FAView(APIView):
    def post(self, request):
        authorize_request('api_enable2_f_a_view', request.user)
        data = generate_2fa_secret(request.user)
        return Response(data)


class Verify2FAView(APIView):
    def post(self, request):
        authorize_request('api_verify2_f_a_view', request.user)
        otp = request.data.get("otp")
        success, message = verify_2fa_otp(request.user, otp)

        if success:
            return Response({"message": message})
        return Response({"error": message}, status=400)


class Disable2FAView(APIView):
    def post(self, request):
        authorize_request('api_disable2_f_a_view', request.user)
        success, message = disable_2fa(request.user)

        if success:
            return Response({"message": message})
        return Response({"error": message}, status=404)


class Login2FAVerifyView(APIView):
    def post(self, request):
        authorize_request('api_login2_f_a_verify_view', request.user)
        otp = request.data.get("otp")
        success, message = verify_login_otp(request.user, otp)

        if success:
            return Response({"message": message})
        return Response({"error": message}, status=400)