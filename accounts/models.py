from django.db import models
from django.contrib.auth.models import User
from django.utils.translation import gettext_lazy as _
from django.db.models.signals import post_save
from django.dispatch import receiver

class UserProfile(models.Model):
    """Profil utilisateur étendu"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone_number = models.CharField(_('Numéro de téléphone'), max_length=20, blank=True, null=True)
    whatsapp_number = models.CharField(_('Numéro WhatsApp'), max_length=20, blank=True, null=True)
    email_address = models.EmailField(_('Adresse email'), blank=True, null=True)
    profile_picture = models.ImageField(_('Photo de profil'), upload_to='profile_pics/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Profil de {self.user.username}"
    
    class Meta:
        verbose_name = _('Profil utilisateur')
        verbose_name_plural = _('Profils utilisateurs')

class EmailAccount(models.Model):
    """Comptes email configurés par l'utilisateur"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='email_accounts')
    email = models.EmailField(_('Adresse email'))
    smtp_server = models.CharField(_('Serveur SMTP'), max_length=255)
    smtp_port = models.IntegerField(_('Port SMTP'), default=587)
    imap_server = models.CharField(_('Serveur IMAP'), max_length=255)
    imap_port = models.IntegerField(_('Port IMAP'), default=993)
    username = models.CharField(_('Nom d\'utilisateur'), max_length=255)
    password = models.CharField(_('Mot de passe'), max_length=255)  # À sécuriser davantage en production
    is_active = models.BooleanField(_('Actif'), default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.email
    
    class Meta:
        verbose_name = _('Compte email')
        verbose_name_plural = _('Comptes email')

class WhatsAppAccount(models.Model):
    """Comptes WhatsApp configurés par l'utilisateur"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='whatsapp_accounts')
    phone_number = models.CharField(_('Numéro de téléphone'), max_length=20)
    api_key = models.CharField(_('Clé API'), max_length=255, blank=True, null=True)
    api_secret = models.CharField(_('Secret API'), max_length=255, blank=True, null=True)
    is_active = models.BooleanField(_('Actif'), default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.phone_number
    
    class Meta:
        verbose_name = _('Compte WhatsApp')
        verbose_name_plural = _('Comptes WhatsApp')

class UserActivity(models.Model):
    """Journal d'activité des utilisateurs"""
    ACTIVITY_TYPES = (
        ('login', _('Connexion')),
        ('logout', _('Déconnexion')),
        ('config_change', _('Modification de configuration')),
        ('template_change', _('Modification de modèle')),
        ('account_change', _('Modification de compte')),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(_('Type d\'activité'), max_length=20, choices=ACTIVITY_TYPES)
    description = models.TextField(_('Description'), blank=True, null=True)
    ip_address = models.GenericIPAddressField(_('Adresse IP'), blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.get_activity_type_display()} - {self.timestamp}"
    
    class Meta:
        verbose_name = _('Activité utilisateur')
        verbose_name_plural = _('Activités utilisateurs')
        ordering = ['-timestamp']

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Créer automatiquement un profil utilisateur lors de la création d'un utilisateur"""
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """Sauvegarder le profil utilisateur lors de la sauvegarde d'un utilisateur"""
    instance.profile.save()
