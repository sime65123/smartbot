from django.db import models
from django.contrib.auth.models import User
from django.utils.translation import gettext_lazy as _

class BotConfiguration(models.Model):
    """Configuration générale du bot"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bot_configurations')
    name = models.CharField(_('Nom du bot'), max_length=100)
    is_active = models.BooleanField(_('Actif'), default=True)
    auto_reply_emails = models.BooleanField(_('Répondre aux emails'), default=True)
    auto_reply_whatsapp = models.BooleanField(_('Répondre aux messages WhatsApp'), default=True)
    working_hours_start = models.TimeField(_('Début des heures de travail'), null=True, blank=True)
    working_hours_end = models.TimeField(_('Fin des heures de travail'), null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.user.username}"

    class Meta:
        verbose_name = _('Configuration du bot')
        verbose_name_plural = _('Configurations du bot')

class ResponseTemplate(models.Model):
    """Modèles de réponses prédéfinis"""
    TEMPLATE_TYPES = (
        ('email', _('Email')),
        ('whatsapp', _('WhatsApp')),
        ('both', _('Les deux')),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='response_templates')
    name = models.CharField(_('Nom du modèle'), max_length=100)
    content = models.TextField(_('Contenu'))
    template_type = models.CharField(_('Type de modèle'), max_length=10, choices=TEMPLATE_TYPES, default='both')
    is_default = models.BooleanField(_('Modèle par défaut'), default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = _('Modèle de réponse')
        verbose_name_plural = _('Modèles de réponse')

class Message(models.Model):
    """Messages reçus et envoyés"""
    MESSAGE_TYPES = (
        ('email', _('Email')),
        ('whatsapp', _('WhatsApp')),
    )
    
    MESSAGE_STATUS = (
        ('received', _('Reçu')),
        ('processed', _('Traité')),
        ('replied', _('Répondu')),
        ('failed', _('Échec')),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='messages')
    message_type = models.CharField(_('Type de message'), max_length=10, choices=MESSAGE_TYPES)
    sender = models.CharField(_('Expéditeur'), max_length=255)
    recipient = models.CharField(_('Destinataire'), max_length=255)
    subject = models.CharField(_('Sujet'), max_length=255, blank=True, null=True)
    content = models.TextField(_('Contenu'))
    status = models.CharField(_('Statut'), max_length=10, choices=MESSAGE_STATUS, default='received')
    received_at = models.DateTimeField(_('Reçu le'), auto_now_add=True)
    processed_at = models.DateTimeField(_('Traité le'), null=True, blank=True)
    
    def __str__(self):
        return f"{self.sender} - {self.subject if self.subject else 'Sans sujet'}"
    
    class Meta:
        verbose_name = _('Message')
        verbose_name_plural = _('Messages')
        ordering = ['-received_at']

class MessageResponse(models.Model):
    """Réponses aux messages"""
    original_message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='responses')
    content = models.TextField(_('Contenu de la réponse'))
    template_used = models.ForeignKey(ResponseTemplate, on_delete=models.SET_NULL, null=True, blank=True)
    sent_at = models.DateTimeField(_('Envoyé le'), auto_now_add=True)
    
    def __str__(self):
        return f"Réponse à {self.original_message}"
    
    class Meta:
        verbose_name = _('Réponse')
        verbose_name_plural = _('Réponses')

class IntentCategory(models.Model):
    """Catégories d'intentions pour le NLP"""
    name = models.CharField(_('Nom'), max_length=100)
    description = models.TextField(_('Description'), blank=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = _('Catégorie d\'intention')
        verbose_name_plural = _('Catégories d\'intentions')

class Intent(models.Model):
    """Intentions spécifiques pour le NLP"""
    category = models.ForeignKey(IntentCategory, on_delete=models.CASCADE, related_name='intents')
    name = models.CharField(_('Nom'), max_length=100)
    description = models.TextField(_('Description'), blank=True)
    keywords = models.TextField(_('Mots-clés'), help_text=_('Séparés par des virgules'))
    
    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name = _('Intention')
        verbose_name_plural = _('Intentions')

class MessageIntent(models.Model):
    """Lien entre un message et les intentions détectées"""
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='detected_intents')
    intent = models.ForeignKey(Intent, on_delete=models.CASCADE)
    confidence = models.FloatField(_('Niveau de confiance'), default=0.0)
    
    def __str__(self):
        return f"{self.message} - {self.intent.name} ({self.confidence})"
    
    class Meta:
        verbose_name = _('Intention détectée')
        verbose_name_plural = _('Intentions détectées')
