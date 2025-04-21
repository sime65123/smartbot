from django.contrib import admin
from .models import (
    BotConfiguration, ResponseTemplate, Message, 
    MessageResponse, IntentCategory, Intent, MessageIntent
)

# Register your models here.

@admin.register(BotConfiguration)
class BotConfigurationAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'is_active', 'auto_reply_emails', 'auto_reply_whatsapp', 'created_at')
    list_filter = ('is_active', 'auto_reply_emails', 'auto_reply_whatsapp')
    search_fields = ('name', 'user__username')

@admin.register(ResponseTemplate)
class ResponseTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'template_type', 'is_default', 'created_at')
    list_filter = ('template_type', 'is_default')
    search_fields = ('name', 'content', 'user__username')

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'recipient', 'subject', 'message_type', 'status', 'received_at')
    list_filter = ('message_type', 'status')
    search_fields = ('sender', 'recipient', 'subject', 'content')
    date_hierarchy = 'received_at'

@admin.register(MessageResponse)
class MessageResponseAdmin(admin.ModelAdmin):
    list_display = ('original_message', 'template_used', 'sent_at')
    list_filter = ('sent_at',)
    search_fields = ('content', 'original_message__subject')
    date_hierarchy = 'sent_at'

@admin.register(IntentCategory)
class IntentCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name', 'description')

@admin.register(Intent)
class IntentAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'description')
    list_filter = ('category',)
    search_fields = ('name', 'description', 'keywords')

@admin.register(MessageIntent)
class MessageIntentAdmin(admin.ModelAdmin):
    list_display = ('message', 'intent', 'confidence')
    list_filter = ('intent', 'confidence')
    search_fields = ('message__subject', 'intent__name')
