"""
URL configuration for smartbot project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from rest_framework import routers
from rest_framework.authtoken import views as token_views
from api.views import (
    BotConfigurationViewSet, ResponseTemplateViewSet, MessageViewSet, 
    MessageResponseViewSet, IntentCategoryViewSet, IntentViewSet,
    EmailWebhookView, WhatsAppWebhookView, DashboardStatsView
)
from accounts.views import (
    EmailAccountViewSet, WhatsAppAccountViewSet, UserActivityViewSet
)

# Configuration du routeur pour l'API REST
router = routers.DefaultRouter()
router.register(r'bot-configurations', BotConfigurationViewSet, basename='bot-configuration')
router.register(r'response-templates', ResponseTemplateViewSet, basename='response-template')
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'message-responses', MessageResponseViewSet, basename='message-response')
router.register(r'intent-categories', IntentCategoryViewSet, basename='intent-category')
router.register(r'intents', IntentViewSet, basename='intent')
router.register(r'email-accounts', EmailAccountViewSet, basename='email-account')
router.register(r'whatsapp-accounts', WhatsAppAccountViewSet, basename='whatsapp-account')
router.register(r'user-activities', UserActivityViewSet, basename='user-activity')

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/', include(router.urls)),
    path('api/auth/', include('rest_framework.urls')),
    path('api/token-auth/', token_views.obtain_auth_token),
    
    # Accounts endpoints
    path('api/accounts/', include('accounts.urls')),
    
    # Webhooks
    path('api/webhooks/email/', EmailWebhookView.as_view(), name='email-webhook'),
    path('api/webhooks/whatsapp/', WhatsAppWebhookView.as_view(), name='whatsapp-webhook'),
    
    # Statistiques du tableau de bord
    path('api/dashboard-stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    
    # Pour servir l'application React en production
    re_path(r'^(?!api/)(?!admin/)(?!static/)(?!media/).*$', TemplateView.as_view(template_name='index.html')),
]

# Ajouter les URLs pour servir les fichiers statiques et médias en développement
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
