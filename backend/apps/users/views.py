from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken as SimpleJWTRefreshToken
from rest_framework_simplejwt.views import TokenRefreshView as CoreTokenRefreshView

from .serializers import RegisterSerializer, LoginSerializer, UserSerializer, UpdateProfileSerializer, ChangePasswordSerializer

class RegisterView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        refresh = SimpleJWTRefreshToken.for_user(user)
        
        data = {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        }
        return Response({
            'data': data,
            'message': 'success',
            'errors': None
        }, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        
        user.last_login_at = timezone.now()
        user.save(update_fields=['last_login_at'])
        
        refresh = SimpleJWTRefreshToken.for_user(user)
        
        data = {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        }
        return Response({
            'data': data,
            'message': 'success',
            'errors': None
        }, status=status.HTTP_200_OK)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            if not refresh_token:
                return Response({'data': None, 'message': 'error', 'errors': {'refresh_token': ['This field is required.']}}, status=status.HTTP_400_BAD_REQUEST)
            
            token = SimpleJWTRefreshToken(refresh_token)
            token.blacklist()
            return Response({'data': None, 'message': 'logged out', 'errors': None}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'data': None, 'message': 'error', 'errors': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class TokenRefreshView(CoreTokenRefreshView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            return Response({
                'data': response.data,
                'message': 'success',
                'errors': None
            }, status=status.HTTP_200_OK)
        return response

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            'data': UserSerializer(request.user).data,
            'message': 'success',
            'errors': None
        })
        
    def patch(self, request):
        serializer = UpdateProfileSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            'data': UserSerializer(user).data,
            'message': 'success',
            'errors': None
        })

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({
                'data': None,
                'message': 'error',
                'errors': {'old_password': ['Wrong password.']}
            }, status=status.HTTP_400_BAD_REQUEST)
            
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({
            'data': None,
            'message': 'success',
            'errors': None
        })

