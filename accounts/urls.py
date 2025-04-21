from django.urls import path, include
from .views import (
    UserRegistrationView, UserLoginView, UserLogoutView,
    UserProfileView, ChangePasswordView, EmailAccountViewSet, WhatsAppAccountViewSet, UserActivityViewSet,
    AccountsRootView, AccountsSummaryView
)
from rest_framework.routers import DefaultRouter

# Configuration du routeur pour les viewsets
router = DefaultRouter()
router.register(r'email-accounts', EmailAccountViewSet, basename='email-account')
router.register(r'whatsapp-accounts', WhatsAppAccountViewSet, basename='whatsapp-account')
router.register(r'user-activities', UserActivityViewSet, basename='user-activity')

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='register'),
    path('login/', UserLoginView.as_view(), name='login'),
    path('logout/', UserLogoutView.as_view(), name='logout'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('accounts-summary/', AccountsSummaryView.as_view(), name='accounts-summary'),
    
    # Pour permettre la navigation dans l'API
    path('', AccountsRootView.as_view(), name='accounts-root'),
]

# Ajouter les URLs du routeur
urlpatterns += router.urls
