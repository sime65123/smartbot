from django.shortcuts import render
from rest_framework import viewsets, permissions, status, filters, authentication
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Q, Count

from .models import (
    BotConfiguration, ResponseTemplate, Message, 
    MessageResponse, IntentCategory, Intent, MessageIntent
)
from .serializers import (
    BotConfigurationSerializer, ResponseTemplateSerializer, MessageSerializer,
    MessageResponseSerializer, IntentCategorySerializer, IntentSerializer, MessageIntentSerializer
)
from accounts.models import EmailAccount, WhatsAppAccount, UserActivity

class BotConfigurationViewSet(viewsets.ModelViewSet):
    """
    API endpoint pour gérer les configurations du bot.
    """
    serializer_class = BotConfigurationSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [authentication.TokenAuthentication, authentication.SessionAuthentication]
    
    def list(self, request, *args, **kwargs):
        # Débogage des en-têtes d'authentification
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        print(f"En-tête d'authentification reçu (BotConfigurationViewSet): {auth_header}")
        print(f"Utilisateur authentifié (BotConfigurationViewSet): {request.user.username if request.user.is_authenticated else 'Non authentifié'}")
        return super().list(request, *args, **kwargs)
    
    def get_queryset(self):
        return BotConfiguration.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ResponseTemplateViewSet(viewsets.ModelViewSet):
    """
    API endpoint pour gérer les modèles de réponse.
    """
    serializer_class = ResponseTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [authentication.TokenAuthentication, authentication.SessionAuthentication]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'content']
    ordering_fields = ['name', 'created_at', 'updated_at']
    
    def list(self, request, *args, **kwargs):
        # Débogage des en-têtes d'authentification
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        print(f"En-tête d'authentification reçu (ResponseTemplateViewSet): {auth_header}")
        print(f"Utilisateur authentifié (ResponseTemplateViewSet): {request.user.username if request.user.is_authenticated else 'Non authentifié'}")
        return super().list(request, *args, **kwargs)
    
    def get_queryset(self):
        return ResponseTemplate.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """Récupérer les modèles par type (email, whatsapp, both)"""
        template_type = request.query_params.get('type', None)
        if template_type is None:
            return Response({"error": "Le paramètre 'type' est requis."}, status=status.HTTP_400_BAD_REQUEST)
        
        templates = self.get_queryset().filter(Q(template_type=template_type) | Q(template_type='both'))
        serializer = self.get_serializer(templates, many=True)
        return Response(serializer.data)

class MessageViewSet(viewsets.ModelViewSet):
    """
    API endpoint pour gérer les messages.
    """
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [authentication.TokenAuthentication, authentication.SessionAuthentication]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['sender', 'recipient', 'subject', 'content']
    ordering_fields = ['received_at', 'status']
    
    def list(self, request, *args, **kwargs):
        # Débogage des en-têtes d'authentification
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        print(f"En-tête d'authentification reçu (MessageViewSet): {auth_header}")
        print(f"Utilisateur authentifié (MessageViewSet): {request.user.username if request.user.is_authenticated else 'Non authentifié'}")
        return super().list(request, *args, **kwargs)
    
    def get_queryset(self):
        return Message.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def process(self, request, pk=None):
        """Traiter un message (analyser les intentions, etc.)"""
        message = self.get_object()
        
        # Ici, vous pourriez implémenter la logique d'analyse NLP
        # Pour l'instant, nous allons simplement marquer le message comme traité
        
        message.status = 'processed'
        message.processed_at = timezone.now()
        message.save()
        
        return Response({"status": "Message traité avec succès"})
    
    @action(detail=True, methods=['post'])
    def reply(self, request, pk=None):
        """Répondre à un message"""
        message = self.get_object()
        
        # Vérifier si le contenu de la réponse est fourni
        content = request.data.get('content', None)
        template_id = request.data.get('template_id', None)
        
        if not content and not template_id:
            return Response(
                {"error": "Le contenu de la réponse ou l'ID du modèle est requis."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Si un modèle est spécifié, utiliser son contenu
        template = None
        if template_id:
            try:
                template = ResponseTemplate.objects.get(id=template_id, user=request.user)
                content = template.content
            except ResponseTemplate.DoesNotExist:
                return Response(
                    {"error": "Le modèle spécifié n'existe pas."}, 
                    status=status.HTTP_404_NOT_FOUND
                )
        
        # Créer la réponse
        response = MessageResponse.objects.create(
            original_message=message,
            content=content,
            template_used=template
        )
        
        # Mettre à jour le statut du message
        message.status = 'replied'
        message.save()
        
        serializer = MessageResponseSerializer(response)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """Récupérer les messages par type (email, whatsapp)"""
        message_type = request.query_params.get('type', None)
        if message_type is None:
            return Response({"error": "Le paramètre 'type' est requis."}, status=status.HTTP_400_BAD_REQUEST)
        
        messages = self.get_queryset().filter(message_type=message_type)
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_status(self, request):
        """Récupérer les messages par statut"""
        status_param = request.query_params.get('status', None)
        if status_param is None:
            return Response({"error": "Le paramètre 'status' est requis."}, status=status.HTTP_400_BAD_REQUEST)
        
        messages = self.get_queryset().filter(status=status_param)
        serializer = self.get_serializer(messages, many=True)
        return Response(serializer.data)

class MessageResponseViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint pour consulter les réponses aux messages.
    """
    serializer_class = MessageResponseSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return MessageResponse.objects.filter(original_message__user=self.request.user)

class IntentCategoryViewSet(viewsets.ModelViewSet):
    """
    API endpoint pour gérer les catégories d'intentions.
    """
    queryset = IntentCategory.objects.all()
    serializer_class = IntentCategorySerializer
    permission_classes = [permissions.IsAuthenticated]

class IntentViewSet(viewsets.ModelViewSet):
    """
    API endpoint pour gérer les intentions.
    """
    queryset = Intent.objects.all()
    serializer_class = IntentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description', 'keywords']
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Récupérer les intentions par catégorie"""
        category_id = request.query_params.get('category_id', None)
        if category_id is None:
            return Response({"error": "Le paramètre 'category_id' est requis."}, status=status.HTTP_400_BAD_REQUEST)
        
        intents = self.get_queryset().filter(category_id=category_id)
        serializer = self.get_serializer(intents, many=True)
        return Response(serializer.data)

# API pour recevoir des messages depuis des sources externes (webhooks)
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import User

class EmailWebhookView(APIView):
    """
    Webhook pour recevoir des emails depuis un service externe.
    """
    permission_classes = [AllowAny]  # Permettre les requêtes non authentifiées
    
    def post(self, request):
        # Extraire les données de l'email
        sender = request.data.get('sender')
        recipient = request.data.get('recipient')
        subject = request.data.get('subject')
        content = request.data.get('content')
        
        # Trouver l'utilisateur associé à l'adresse email destinataire
        try:
            user = User.objects.get(email=recipient)
        except User.DoesNotExist:
            return Response({"error": "Destinataire inconnu."}, status=status.HTTP_404_NOT_FOUND)
        
        # Créer le message
        message = Message.objects.create(
            user=user,
            message_type='email',
            sender=sender,
            recipient=recipient,
            subject=subject,
            content=content
        )
        
        # Ici, vous pourriez implémenter la logique pour traiter automatiquement le message
        
        return Response({"status": "Email reçu avec succès", "message_id": message.id})

class WhatsAppWebhookView(APIView):
    """
    Webhook pour recevoir des messages WhatsApp depuis un service externe.
    """
    permission_classes = [AllowAny]  # Permettre les requêtes non authentifiées
    
    def post(self, request):
        # Extraire les données du message WhatsApp
        sender = request.data.get('sender')
        recipient = request.data.get('recipient')
        content = request.data.get('content')
        
        # Trouver l'utilisateur associé au numéro WhatsApp destinataire
        from accounts.models import WhatsAppAccount
        try:
            whatsapp_account = WhatsAppAccount.objects.get(phone_number=recipient)
            user = whatsapp_account.user
        except WhatsAppAccount.DoesNotExist:
            return Response({"error": "Destinataire inconnu."}, status=status.HTTP_404_NOT_FOUND)
        
        # Créer le message
        message = Message.objects.create(
            user=user,
            message_type='whatsapp',
            sender=sender,
            recipient=recipient,
            content=content
        )
        
        # Ici, vous pourriez implémenter la logique pour traiter automatiquement le message
        
        return Response({"status": "Message WhatsApp reçu avec succès", "message_id": message.id})

class DashboardStatsView(APIView):
    """
    API endpoint pour récupérer les statistiques du tableau de bord.
    """
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [authentication.TokenAuthentication, authentication.SessionAuthentication, authentication.BasicAuthentication]
    
    def get(self, request):
        # Débogage des en-têtes d'authentification
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        print(f"En-tête d'authentification reçu (DashboardStatsView): {auth_header}")
        print(f"Utilisateur authentifié (DashboardStatsView): {request.user.username if request.user.is_authenticated else 'Non authentifié'}")
        print(f"Toutes les en-têtes reçues: {request.META}")
        
        user = request.user
        stats = {}
        
        # Récupérer les statistiques
        try:
            # Initialiser les valeurs par défaut
            stats = {
                'total_messages': 0,
                'messages_by_status': {},
                'email_accounts': 0,
                'whatsapp_accounts': 0,
                'response_templates': 0,
                'bot_configurations': 0,
                'recent_activities': 0,
                'last_updated': timezone.now().isoformat()
            }
            
            # Nombre total de messages
            try:
                total_messages = Message.objects.filter(user=user).count()
                stats['total_messages'] = total_messages
                print(f"Total messages: {total_messages}")
            except Exception as e:
                print(f"Erreur lors du comptage des messages: {str(e)}")
            
            # Nombre de messages par statut
            try:
                messages_by_status = Message.objects.filter(user=user).values('status').annotate(count=Count('id'))
                status_counts = {item['status']: item['count'] for item in messages_by_status}
                stats['messages_by_status'] = status_counts
                
                # Ajouter des propriétés spécifiques pour le frontend
                stats['pending_messages'] = status_counts.get('received', 0)
                stats['processed_messages'] = status_counts.get('processed', 0)
                stats['replied_messages'] = status_counts.get('replied', 0)
                stats['failed_messages'] = status_counts.get('failed', 0)
                
                print(f"Messages par statut: {status_counts}")
            except Exception as e:
                print(f"Erreur lors de l'agrégation des messages par statut: {str(e)}")
            
            # Nombre de comptes email et WhatsApp
            try:
                from accounts.models import EmailAccount, WhatsAppAccount, UserActivity
                email_accounts = EmailAccount.objects.filter(user=user).count()
                stats['email_accounts'] = email_accounts
                print(f"Comptes email: {email_accounts}")
            except Exception as e:
                print(f"Erreur lors du comptage des comptes email: {str(e)}")
                
            try:
                whatsapp_accounts = WhatsAppAccount.objects.filter(user=user).count()
                stats['whatsapp_accounts'] = whatsapp_accounts
                print(f"Comptes WhatsApp: {whatsapp_accounts}")
            except Exception as e:
                print(f"Erreur lors du comptage des comptes WhatsApp: {str(e)}")
            
            # Nombre de modèles de réponse
            try:
                response_templates = ResponseTemplate.objects.filter(user=user).count()
                stats['response_templates'] = response_templates
                print(f"Modèles de réponse: {response_templates}")
            except Exception as e:
                print(f"Erreur lors du comptage des modèles de réponse: {str(e)}")
            
            # Nombre de configurations de bot
            try:
                bot_configs = BotConfiguration.objects.filter(user=user).count()
                stats['bot_configurations'] = bot_configs
                print(f"Configurations de bot: {bot_configs}")
            except Exception as e:
                print(f"Erreur lors du comptage des configurations de bot: {str(e)}")
            
            # Nombre d'activités récentes
            try:
                recent_activities = UserActivity.objects.filter(user=user).count()
                stats['recent_activities'] = recent_activities
                print(f"Activités récentes: {recent_activities}")
            except Exception as e:
                print(f"Erreur lors du comptage des activités récentes: {str(e)}")
            
            return Response(stats)
        except Exception as e:
            print(f"Erreur générale lors de la récupération des statistiques: {str(e)}")
            return Response(
                {"error": "Une erreur s'est produite lors de la récupération des statistiques."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
