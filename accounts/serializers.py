from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import UserProfile, EmailAccount, WhatsAppAccount, UserActivity

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password', 'password2']
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
            'email': {'required': True}
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Les mots de passe ne correspondent pas."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user

class UserProfileDetailSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    
    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone_number', 
                 'whatsapp_number', 'email_address', 'profile_picture', 'created_at', 'updated_at']
        read_only_fields = ['id', 'username', 'email', 'created_at', 'updated_at']
    
    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        
        # Mettre à jour les champs de l'utilisateur
        if 'first_name' in user_data:
            instance.user.first_name = user_data['first_name']
        if 'last_name' in user_data:
            instance.user.last_name = user_data['last_name']
        
        instance.user.save()
        
        # Mettre à jour les champs du profil
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password2 = serializers.CharField(required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError({"new_password": "Les nouveaux mots de passe ne correspondent pas."})
        return attrs

class EmailAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailAccount
        fields = ['id', 'email', 'smtp_server', 'smtp_port', 'imap_server', 'imap_port', 
                 'username', 'password', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'password': {'write_only': True}
        }

class WhatsAppAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = WhatsAppAccount
        fields = ['id', 'phone_number', 'api_key', 'api_secret', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'api_secret': {'write_only': True}
        }

class UserActivitySerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = UserActivity
        fields = ['id', 'username', 'activity_type', 'description', 'ip_address', 'timestamp']
        read_only_fields = ['id', 'username', 'timestamp']
