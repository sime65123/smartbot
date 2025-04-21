from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import UserProfile, EmailAccount, WhatsAppAccount, UserActivity

# Register your models here.

class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profil'

class UserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)

# Réenregistrer l'UserAdmin
admin.site.unregister(User)
admin.site.register(User, UserAdmin)

@admin.register(EmailAccount)
class EmailAccountAdmin(admin.ModelAdmin):
    list_display = ('email', 'user', 'smtp_server', 'is_active', 'created_at')
    list_filter = ('is_active', 'smtp_server')
    search_fields = ('email', 'user__username', 'smtp_server')

@admin.register(WhatsAppAccount)
class WhatsAppAccountAdmin(admin.ModelAdmin):
    list_display = ('phone_number', 'user', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('phone_number', 'user__username')

@admin.register(UserActivity)
class UserActivityAdmin(admin.ModelAdmin):
    list_display = ('user', 'activity_type', 'description', 'ip_address', 'timestamp')
    list_filter = ('activity_type', 'timestamp')
    search_fields = ('user__username', 'description', 'ip_address')
    date_hierarchy = 'timestamp'
