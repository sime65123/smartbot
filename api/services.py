import logging
import smtplib
import imaplib
import email
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import requests
import json
from django.utils import timezone
from django.conf import settings
from django.db.models import Q

from .models import Message, MessageResponse, BotConfiguration, ResponseTemplate
from accounts.models import EmailAccount, WhatsAppAccount

logger = logging.getLogger(__name__)

class MessageProcessingService:
    """
    Service pour traiter automatiquement les messages reçus et envoyer des réponses.
    """
    
    @staticmethod
    def process_pending_messages():
        """
        Traite tous les messages en attente et envoie des réponses automatiques si nécessaire.
        """
        # Récupérer tous les messages reçus et non traités
        pending_messages = Message.objects.filter(status='received')
        logger.info(f"Traitement de {pending_messages.count()} messages en attente")
        
        for message in pending_messages:
            try:
                # Vérifier si le bot est configuré pour répondre à ce type de message
                bot_config = BotConfiguration.objects.filter(
                    user=message.user,
                    is_active=True
                ).first()
                
                if not bot_config:
                    logger.info(f"Aucune configuration de bot active trouvée pour l'utilisateur {message.user.username}")
                    continue
                
                # Vérifier si le bot doit répondre à ce type de message
                if message.message_type == 'email' and not bot_config.auto_reply_emails:
                    logger.info(f"Réponse automatique aux emails désactivée pour l'utilisateur {message.user.username}")
                    continue
                
                if message.message_type == 'whatsapp' and not bot_config.auto_reply_whatsapp:
                    logger.info(f"Réponse automatique aux messages WhatsApp désactivée pour l'utilisateur {message.user.username}")
                    continue
                
                # Vérifier si nous sommes dans les heures de travail
                current_time = timezone.localtime().time()
                if bot_config.working_hours_start and bot_config.working_hours_end:
                    if not (bot_config.working_hours_start <= current_time <= bot_config.working_hours_end):
                        logger.info(f"En dehors des heures de travail pour l'utilisateur {message.user.username}")
                        continue
                
                # Marquer le message comme étant en cours de traitement
                message.status = 'processed'
                message.processed_at = timezone.now()
                message.save()
                
                # Sélectionner un modèle de réponse approprié
                template = MessageProcessingService.select_response_template(message)
                
                if not template:
                    logger.warning(f"Aucun modèle de réponse trouvé pour le message {message.id}")
                    continue
                
                # Envoyer la réponse
                success = MessageProcessingService.send_response(message, template)
                
                if success:
                    # Créer une entrée de réponse dans la base de données
                    MessageResponse.objects.create(
                        original_message=message,
                        content=template.content,
                        template_used=template
                    )
                    
                    # Mettre à jour le statut du message
                    message.status = 'replied'
                    message.save()
                    
                    logger.info(f"Réponse envoyée avec succès pour le message {message.id}")
                else:
                    # Marquer le message comme échoué
                    message.status = 'failed'
                    message.save()
                    
                    logger.error(f"Échec de l'envoi de la réponse pour le message {message.id}")
            
            except Exception as e:
                logger.exception(f"Erreur lors du traitement du message {message.id}: {str(e)}")
                # Marquer le message comme échoué
                message.status = 'failed'
                message.save()
    
    @staticmethod
    def select_response_template(message):
        """
        Sélectionne un modèle de réponse approprié pour le message.
        """
        # Rechercher d'abord un modèle par défaut pour le type de message
        template = ResponseTemplate.objects.filter(
            user=message.user,
            template_type__in=[message.message_type, 'both'],
            is_default=True
        ).first()
        
        if template:
            return template
        
        # Si aucun modèle par défaut n'est trouvé, prendre le premier modèle disponible
        return ResponseTemplate.objects.filter(
            user=message.user,
            template_type__in=[message.message_type, 'both']
        ).first()
    
    @staticmethod
    def send_response(message, template):
        """
        Envoie une réponse au message en utilisant le modèle fourni.
        """
        if message.message_type == 'email':
            return MessageProcessingService.send_email_response(message, template)
        elif message.message_type == 'whatsapp':
            return MessageProcessingService.send_whatsapp_response(message, template)
        
        return False
    
    @staticmethod
    def send_email_response(message, template):
        """
        Envoie une réponse par email.
        """
        try:
            # Récupérer le compte email associé au destinataire
            email_account = EmailAccount.objects.filter(
                user=message.user,
                email=message.recipient,
                is_active=True
            ).first()
            
            if not email_account:
                logger.error(f"Aucun compte email actif trouvé pour {message.recipient}")
                return False
            
            # Créer le message email
            msg = MIMEMultipart()
            msg['From'] = email_account.email
            msg['To'] = message.sender
            msg['Subject'] = f"Re: {message.subject}" if message.subject else "Réponse automatique"
            
            # Ajouter le contenu du modèle
            msg.attach(MIMEText(template.content, 'plain'))
            
            # Connexion au serveur SMTP
            with smtplib.SMTP(email_account.smtp_server, email_account.smtp_port) as server:
                server.starttls()
                server.login(email_account.username, email_account.password)
                server.send_message(msg)
            
            logger.info(f"Email envoyé à {message.sender} depuis {email_account.email}")
            return True
            
        except Exception as e:
            logger.exception(f"Erreur lors de l'envoi de l'email: {str(e)}")
            return False
    
    @staticmethod
    def send_whatsapp_response(message, template):
        """
        Envoie une réponse par WhatsApp.
        """
        try:
            # Récupérer le compte WhatsApp associé au destinataire
            whatsapp_account = WhatsAppAccount.objects.filter(
                user=message.user,
                phone_number=message.recipient,
                is_active=True
            ).first()
            
            if not whatsapp_account:
                logger.error(f"Aucun compte WhatsApp actif trouvé pour {message.recipient}")
                return False
            
            # Ici, vous devriez implémenter l'intégration avec l'API WhatsApp
            # Ceci est un exemple simplifié
            if not whatsapp_account.api_key or not whatsapp_account.api_secret:
                logger.error(f"Clés API manquantes pour le compte WhatsApp {whatsapp_account.phone_number}")
                return False
            
            # Exemple d'appel à l'API WhatsApp (à adapter selon l'API utilisée)
            # headers = {
            #     'Authorization': f'Bearer {whatsapp_account.api_key}',
            #     'Content-Type': 'application/json'
            # }
            # 
            # data = {
            #     'to': message.sender,
            #     'from': whatsapp_account.phone_number,
            #     'message': template.content
            # }
            # 
            # response = requests.post(
            #     'https://api.whatsapp.com/send',
            #     headers=headers,
            #     data=json.dumps(data)
            # )
            # 
            # if response.status_code == 200:
            #     logger.info(f"Message WhatsApp envoyé à {message.sender} depuis {whatsapp_account.phone_number}")
            #     return True
            # else:
            #     logger.error(f"Échec de l'envoi du message WhatsApp: {response.text}")
            #     return False
            
            # Pour l'instant, simulons un succès
            logger.info(f"Simulation: Message WhatsApp envoyé à {message.sender} depuis {whatsapp_account.phone_number}")
            return True
            
        except Exception as e:
            logger.exception(f"Erreur lors de l'envoi du message WhatsApp: {str(e)}")
            return False
    
    @staticmethod
    def check_for_new_emails():
        """
        Vérifie les nouveaux emails pour tous les comptes email actifs.
        """
        # Récupérer tous les comptes email actifs
        email_accounts = EmailAccount.objects.filter(is_active=True)
        
        for account in email_accounts:
            try:
                # Connexion au serveur IMAP
                with imaplib.IMAP4_SSL(account.imap_server, account.imap_port) as mail:
                    mail.login(account.username, account.password)
                    mail.select('INBOX')
                    
                    # Rechercher les emails non lus
                    status, messages = mail.search(None, 'UNSEEN')
                    
                    if status != 'OK':
                        logger.error(f"Erreur lors de la recherche d'emails pour {account.email}")
                        continue
                    
                    for num in messages[0].split():
                        # Récupérer le contenu de l'email
                        status, data = mail.fetch(num, '(RFC822)')
                        
                        if status != 'OK':
                            logger.error(f"Erreur lors de la récupération de l'email {num} pour {account.email}")
                            continue
                        
                        raw_email = data[0][1]
                        email_message = email.message_from_bytes(raw_email)
                        
                        # Extraire les informations de l'email
                        sender = email_message['From']
                        subject = email_message['Subject']
                        
                        # Extraire le corps de l'email
                        content = ""
                        if email_message.is_multipart():
                            for part in email_message.walk():
                                if part.get_content_type() == "text/plain":
                                    content = part.get_payload(decode=True).decode()
                                    break
                        else:
                            content = email_message.get_payload(decode=True).decode()
                        
                        # Créer un nouveau message dans la base de données
                        Message.objects.create(
                            user=account.user,
                            message_type='email',
                            sender=sender,
                            recipient=account.email,
                            subject=subject,
                            content=content,
                            status='received'
                        )
                        
                        logger.info(f"Nouvel email reçu de {sender} pour {account.email}")
            
            except Exception as e:
                logger.exception(f"Erreur lors de la vérification des emails pour {account.email}: {str(e)}")
