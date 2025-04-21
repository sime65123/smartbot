from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    BotConfiguration, ResponseTemplate, Message, 
    MessageResponse, IntentCategory, Intent, MessageIntent
)
from accounts.models import UserProfile, EmailAccount, WhatsAppAccount

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_active']
        read_only_fields = ['id', 'is_active']

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'phone_number', 'whatsapp_number', 'email_address', 'profile_picture', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class EmailAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailAccount
        fields = ['id', 'email', 'smtp_server', 'smtp_port', 'imap_server', 'imap_port', 'username', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'password': {'write_only': True}
        }

class WhatsAppAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = WhatsAppAccount
        fields = ['id', 'phone_number', 'api_key', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'api_secret': {'write_only': True}
        }

class BotConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = BotConfiguration
        fields = ['id', 'name', 'is_active', 'auto_reply_emails', 'auto_reply_whatsapp', 
                 'working_hours_start', 'working_hours_end', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class ResponseTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResponseTemplate
        fields = ['id', 'name', 'content', 'template_type', 'is_default', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class IntentCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = IntentCategory
        fields = ['id', 'name', 'description']
        read_only_fields = ['id']

class IntentSerializer(serializers.ModelSerializer):
    category = IntentCategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=IntentCategory.objects.all(),
        source='category',
        write_only=True
    )
    
    class Meta:
        model = Intent
        fields = ['id', 'name', 'description', 'keywords', 'category', 'category_id']
        read_only_fields = ['id']

class MessageIntentSerializer(serializers.ModelSerializer):
    intent = IntentSerializer(read_only=True)
    
    class Meta:
        model = MessageIntent
        fields = ['id', 'intent', 'confidence']
        read_only_fields = ['id']

class MessageSerializer(serializers.ModelSerializer):
    detected_intents = MessageIntentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Message
        fields = ['id', 'message_type', 'sender', 'recipient', 'subject', 'content', 
                 'status', 'received_at', 'processed_at', 'detected_intents']
        read_only_fields = ['id', 'received_at', 'processed_at']

class MessageResponseSerializer(serializers.ModelSerializer):
    original_message = MessageSerializer(read_only=True)
    template_used = ResponseTemplateSerializer(read_only=True)
    
    class Meta:
        model = MessageResponse
        fields = ['id', 'original_message', 'content', 'template_used', 'sent_at']
        read_only_fields = ['id', 'sent_at']
