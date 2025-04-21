from django.shortcuts import render
from rest_framework import viewsets, generics, permissions, status, authentication
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from rest_framework.authtoken.models import Token
from django.utils import timezone
from django.db.models import Count

from .models import UserProfile, EmailAccount, WhatsAppAccount, UserActivity
from .serializers import (
    UserRegistrationSerializer, UserProfileDetailSerializer, ChangePasswordSerializer,
    EmailAccountSerializer, WhatsAppAccountSerializer, UserActivitySerializer
)

# Vue simple pour la racine de l'API accounts
class AccountsRootView(APIView):
    """
    API endpoint pour la page d'accueil de l'API accounts.
    """
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        return Response({
            "register": "/api/accounts/register/",
            "login": "/api/accounts/login/",
            "logout": "/api/accounts/logout/",
            "profile": "/api/accounts/profile/",
            "change-password": "/api/accounts/change-password/",
            "email-accounts": "/api/accounts/email-accounts/",
            "whatsapp-accounts": "/api/accounts/whatsapp-accounts/",
            "user-activities": "/api/accounts/user-activities/"
        })

class UserRegistrationView(generics.CreateAPIView):
    """
    API endpoint pour l'inscription des utilisateurs.
    """
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegistrationSerializer
    
    def perform_create(self, serializer):
        print("Début de perform_create")
        try:
            user = serializer.save()
            print(f"Utilisateur créé avec succès: {user.username}")
            
            # Créer un profil utilisateur vide
            try:
                UserProfile.objects.create(user=user)
                print(f"Profil utilisateur créé pour: {user.username}")
            except Exception as e:
                print(f"Erreur lors de la création du profil: {str(e)}")
                # Ne pas lever l'exception pour permettre l'inscription même si la création du profil échoue
            
            # Enregistrer l'activité d'inscription
            try:
                UserActivity.objects.create(
                    user=user,
                    activity_type='registration',
                    description='Inscription réussie',
                    ip_address=self.get_client_ip(self.request)
                )
                print(f"Activité d'inscription enregistrée pour: {user.username}")
            except Exception as e:
                print(f"Erreur lors de l'enregistrement de l'activité: {str(e)}")
                # Ne pas lever l'exception pour permettre l'inscription même si l'enregistrement de l'activité échoue
                
            return user
        except Exception as e:
            print(f"Erreur générale dans perform_create: {str(e)}")
            raise
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
        
    def create(self, request, *args, **kwargs):
        """
        Surcharge de la méthode create pour ajouter des logs de débogage
        """
        print("Données reçues pour l'inscription:", request.data)
        try:
            serializer = self.get_serializer(data=request.data)
            if serializer.is_valid():
                print("Données valides, création de l'utilisateur...")
                self.perform_create(serializer)
                headers = self.get_success_headers(serializer.data)
                return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
            else:
                print("Erreurs de validation:", serializer.errors)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print("Exception lors de l'inscription:", str(e))
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class UserLoginView(APIView):
    """
    API endpoint pour la connexion des utilisateurs.
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        user = authenticate(username=username, password=password)
        
        if user:
            login(request, user)
            
            # Générer ou récupérer un token d'authentification
            token, created = Token.objects.get_or_create(user=user)
            
            # Enregistrer l'activité de connexion
            UserActivity.objects.create(
                user=user,
                activity_type='login',
                description='Connexion réussie',
                ip_address=self.get_client_ip(request)
            )
            
            # Mettre à jour la date de dernière connexion
            user.last_login = timezone.now()
            user.save(update_fields=['last_login'])
            
            return Response({
                "message": "Connexion réussie",
                "user_id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "token": token.key,
                "date_joined": user.date_joined,
                "last_login": user.last_login
            })
        else:
            return Response({
                "error": "Identifiants invalides"
            }, status=status.HTTP_401_UNAUTHORIZED)
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

class UserLogoutView(APIView):
    """
    API endpoint pour la déconnexion des utilisateurs.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        # Enregistrer l'activité de déconnexion
        UserActivity.objects.create(
            user=request.user,
            activity_type='logout',
            description='Déconnexion',
            ip_address=self.get_client_ip(request)
        )
        
        logout(request)
        return Response({"message": "Déconnexion réussie"})
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    API endpoint pour consulter et modifier le profil utilisateur.
    """
    serializer_class = UserProfileDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [authentication.TokenAuthentication, authentication.SessionAuthentication]
    
    def get_object(self):
        # Vérifier si l'utilisateur a un profil, sinon en créer un
        try:
            profile = self.request.user.profile
        except UserProfile.DoesNotExist:
            profile = UserProfile.objects.create(user=self.request.user)
        return profile
    
    def retrieve(self, request, *args, **kwargs):
        # Débogage des en-têtes d'authentification
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        print(f"En-tête d'authentification reçu: {auth_header}")
        print(f"Utilisateur authentifié: {request.user.username if request.user.is_authenticated else 'Non authentifié'}")
        
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        
        # Ajouter les informations complètes de l'utilisateur
        user = request.user
        data['username'] = user.username
        data['email'] = user.email
        data['first_name'] = user.first_name
        data['last_name'] = user.last_name
        data['date_joined'] = user.date_joined
        data['last_login'] = user.last_login
        
        print(f"Données du profil renvoyées: {data}")
        
        return Response(data)

class ChangePasswordView(APIView):
    """
    API endpoint pour changer le mot de passe.
    """
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [authentication.TokenAuthentication, authentication.SessionAuthentication]
    
    def post(self, request):
        # Débogage des en-têtes d'authentification
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        print(f"En-tête d'authentification reçu (ChangePasswordView): {auth_header}")
        print(f"Utilisateur authentifié (ChangePasswordView): {request.user.username if request.user.is_authenticated else 'Non authentifié'}")
        print(f"Données reçues pour le changement de mot de passe: {request.data}")
        
        serializer = ChangePasswordSerializer(data=request.data)
        
        if serializer.is_valid():
            print(f"Données validées: {serializer.validated_data}")
            user = request.user
            
            # Vérifier l'ancien mot de passe
            if not user.check_password(serializer.validated_data['old_password']):
                print(f"Mot de passe incorrect pour l'utilisateur {user.username}")
                return Response({"old_password": ["Mot de passe incorrect."]}, status=status.HTTP_400_BAD_REQUEST)
            
            # Définir le nouveau mot de passe
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            print(f"Mot de passe changé avec succès pour l'utilisateur {user.username}")
            
            # Enregistrer l'activité
            UserActivity.objects.create(
                user=user,
                activity_type='account_change',
                description='Changement de mot de passe',
                ip_address=self.get_client_ip(request)
            )
            
            return Response({"message": "Mot de passe modifié avec succès"})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

class EmailAccountViewSet(viewsets.ModelViewSet):
    """
    API endpoint pour gérer les comptes email.
    """
    serializer_class = EmailAccountSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [authentication.TokenAuthentication, authentication.SessionAuthentication]
    
    def list(self, request, *args, **kwargs):
        # Débogage des en-têtes d'authentification
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        print(f"En-tête d'authentification reçu (EmailAccountViewSet): {auth_header}")
        print(f"Utilisateur authentifié (EmailAccountViewSet): {request.user.username if request.user.is_authenticated else 'Non authentifié'}")
        return super().list(request, *args, **kwargs)
    
    def get_queryset(self):
        return EmailAccount.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        
        # Enregistrer l'activité
        UserActivity.objects.create(
            user=self.request.user,
            activity_type='account_change',
            description='Ajout d\'un compte email',
            ip_address=self.get_client_ip(self.request)
        )
    
    def perform_update(self, serializer):
        serializer.save()
        
        # Enregistrer l'activité
        UserActivity.objects.create(
            user=self.request.user,
            activity_type='account_change',
            description='Modification d\'un compte email',
            ip_address=self.get_client_ip(self.request)
        )
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

class WhatsAppAccountViewSet(viewsets.ModelViewSet):
    """
    API endpoint pour gérer les comptes WhatsApp.
    """
    serializer_class = WhatsAppAccountSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [authentication.TokenAuthentication, authentication.SessionAuthentication]
    
    def list(self, request, *args, **kwargs):
        # Débogage des en-têtes d'authentification
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        print(f"En-tête d'authentification reçu (WhatsAppAccountViewSet): {auth_header}")
        print(f"Utilisateur authentifié (WhatsAppAccountViewSet): {request.user.username if request.user.is_authenticated else 'Non authentifié'}")
        return super().list(request, *args, **kwargs)
    
    def get_queryset(self):
        return WhatsAppAccount.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        
        # Enregistrer l'activité
        UserActivity.objects.create(
            user=self.request.user,
            activity_type='account_change',
            description='Ajout d\'un compte WhatsApp',
            ip_address=self.get_client_ip(self.request)
        )
    
    def perform_update(self, serializer):
        serializer.save()
        
        # Enregistrer l'activité
        UserActivity.objects.create(
            user=self.request.user,
            activity_type='account_change',
            description='Modification d\'un compte WhatsApp',
            ip_address=self.get_client_ip(self.request)
        )
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

class UserActivityViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint pour consulter les activités utilisateur.
    """
    serializer_class = UserActivitySerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [authentication.TokenAuthentication, authentication.SessionAuthentication]
    
    def get_queryset(self):
        return UserActivity.objects.filter(user=self.request.user)

class AccountsSummaryView(APIView):
    """
    API endpoint pour récupérer un résumé des comptes pour le tableau de bord.
    """
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [authentication.TokenAuthentication, authentication.SessionAuthentication, authentication.BasicAuthentication]
    
    def get(self, request):
        # Débogage des en-têtes d'authentification
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        print(f"En-tête d'authentification reçu (AccountsSummaryView): {auth_header}")
        print(f"Utilisateur authentifié (AccountsSummaryView): {request.user.username if request.user.is_authenticated else 'Non authentifié'}")
        
        user = request.user
        summary = {}
        
        try:
            # Comptes email
            email_accounts = EmailAccount.objects.filter(user=user)
            email_summary = {
                'total': email_accounts.count(),
                'active': email_accounts.filter(is_active=True).count(),
                'inactive': email_accounts.filter(is_active=False).count(),
            }
            
            # Comptes WhatsApp
            whatsapp_accounts = WhatsAppAccount.objects.filter(user=user)
            whatsapp_summary = {
                'total': whatsapp_accounts.count(),
                'active': whatsapp_accounts.filter(is_active=True).count(),
                'inactive': whatsapp_accounts.filter(is_active=False).count(),
            }
            
            # Activités récentes
            recent_activities = UserActivity.objects.filter(user=user).order_by('-timestamp')[:10]
            activities_by_type = UserActivity.objects.filter(user=user).values('activity_type').annotate(count=Count('id'))
            activities_summary = {item['activity_type']: item['count'] for item in activities_by_type}
            
            # Construire la réponse
            summary = {
                'email_accounts': email_summary,
                'whatsapp_accounts': whatsapp_summary,
                'activities': activities_summary,
                'last_updated': timezone.now().isoformat()
            }
            
            return Response(summary)
        except Exception as e:
            print(f"Erreur lors de la récupération du résumé des comptes: {str(e)}")
            return Response(
                {"error": "Une erreur s'est produite lors de la récupération du résumé des comptes."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
