"""
Service de gestion des messages pour l'envoi et la réception d'emails et de messages WhatsApp.
"""

import smtplib
import imaplib
import email
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import requests
import json
import logging
from django.utils import timezone
from django.conf import settings
from .models import Message, MessageResponse
from .nlp_service import NLPService

logger = logging.getLogger(__name__)

class EmailService:
    """
    Service pour gérer l'envoi et la réception d'emails.
    """
    
    @staticmethod
    def send_email(email_account, recipient, subject, content):
        """
        Envoie un email via le compte email configuré.
        
        Args:
            email_account: Instance du modèle EmailAccount
            recipient: Adresse email du destinataire
            subject: Sujet de l'email
            content: Contenu de l'email
            
        Returns:
            bool: True si l'envoi a réussi, False sinon
        """
        try:
            # Créer le message
            msg = MIMEMultipart()
            msg['From'] = email_account.email
            msg['To'] = recipient
            msg['Subject'] = subject
            
            # Ajouter le contenu
            msg.attach(MIMEText(content, 'plain'))
            
            # Connexion au serveur SMTP
            server = smtplib.SMTP(email_account.smtp_server, email_account.smtp_port)
            server.starttls()  # Sécuriser la connexion
            server.login(email_account.username, email_account.password)
            
            # Envoyer l'email
            server.send_message(msg)
            server.quit()
            
            logger.info(f"Email envoyé à {recipient} avec succès")
            return True
            
        except Exception as e:
            logger.error(f"Erreur lors de l'envoi de l'email à {recipient}: {str(e)}")
            return False
    
    @staticmethod
    def check_emails(email_account):
        """
        Vérifie les nouveaux emails pour un compte email configuré.
        
        Args:
            email_account: Instance du modèle EmailAccount
            
        Returns:
            list: Liste des nouveaux messages
        """
        try:
            # Connexion au serveur IMAP
            mail = imaplib.IMAP4_SSL(email_account.imap_server, email_account.imap_port)
            mail.login(email_account.username, email_account.password)
            mail.select('inbox')
            
            # Rechercher les emails non lus
            status, data = mail.search(None, 'UNSEEN')
            
            new_messages = []
            
            # Pour chaque email non lu
            for num in data[0].split():
                status, data = mail.fetch(num, '(RFC822)')
                raw_email = data[0][1]
                
                # Analyser l'email
                msg = email.message_from_bytes(raw_email)
                
                sender = msg['From']
                recipient = msg['To']
                subject = msg['Subject']
                
                # Extraire le contenu
                content = ""
                if msg.is_multipart():
                    for part in msg.walk():
                        content_type = part.get_content_type()
                        if content_type == 'text/plain':
                            content = part.get_payload(decode=True).decode()
                            break
                else:
                    content = msg.get_payload(decode=True).decode()
                
                # Créer un message dans la base de données
                message = Message.objects.create(
                    user=email_account.user,
                    message_type='email',
                    sender=sender,
                    recipient=recipient,
                    subject=subject,
                    content=content
                )
                
                new_messages.append(message)
                
                # Marquer l'email comme lu
                mail.store(num, '+FLAGS', '\\Seen')
            
            mail.close()
            mail.logout()
            
            return new_messages
            
        except Exception as e:
            logger.error(f"Erreur lors de la vérification des emails: {str(e)}")
            return []

class WhatsAppService:
    """
    Service pour gérer l'envoi et la réception de messages WhatsApp.
    Note: Ce service est un exemple et nécessite une intégration avec une API WhatsApp réelle.
    """
    
    @staticmethod
    def send_whatsapp(whatsapp_account, recipient, content):
        """
        Envoie un message WhatsApp via le compte configuré.
        
        Args:
            whatsapp_account: Instance du modèle WhatsAppAccount
            recipient: Numéro de téléphone du destinataire
            content: Contenu du message
            
        Returns:
            bool: True si l'envoi a réussi, False sinon
        """
        try:
            # Exemple d'intégration avec une API WhatsApp (à adapter selon l'API utilisée)
            api_url = "https://api.whatsapp.service.com/send"
            
            payload = {
                "phone": recipient,
                "message": content,
                "api_key": whatsapp_account.api_key,
                "api_secret": whatsapp_account.api_secret
            }
            
            # Envoyer la requête à l'API
            # Note: Ceci est un exemple, il faudra adapter selon l'API réelle utilisée
            # response = requests.post(api_url, json=payload)
            
            # Simuler une réponse réussie pour l'exemple
            # if response.status_code == 200:
            logger.info(f"Message WhatsApp envoyé à {recipient} avec succès")
            return True
            # else:
            #    logger.error(f"Erreur lors de l'envoi du message WhatsApp: {response.text}")
            #    return False
            
        except Exception as e:
            logger.error(f"Erreur lors de l'envoi du message WhatsApp à {recipient}: {str(e)}")
            return False

class AutoReplyService:
    """
    Service pour gérer les réponses automatiques aux messages.
    """
    
    @staticmethod
    def process_message(message):
        """
        Traite un message et génère une réponse automatique si nécessaire.
        
        Args:
            message: Instance du modèle Message
            
        Returns:
            MessageResponse or None: La réponse générée ou None si aucune réponse n'est générée
        """
        try:
            # Vérifier si la réponse automatique est activée pour ce type de message
            bot_config = message.user.bot_configurations.filter(is_active=True).first()
            
            if not bot_config:
                logger.info(f"Aucune configuration de bot active pour l'utilisateur {message.user.username}")
                return None
            
            # Vérifier si la réponse automatique est activée pour ce type de message
            if message.message_type == 'email' and not bot_config.auto_reply_emails:
                logger.info("Réponse automatique aux emails désactivée")
                return None
                
            if message.message_type == 'whatsapp' and not bot_config.auto_reply_whatsapp:
                logger.info("Réponse automatique aux messages WhatsApp désactivée")
                return None
            
            # Vérifier si nous sommes dans les heures de travail (si configurées)
            if bot_config.working_hours_start and bot_config.working_hours_end:
                now = timezone.localtime().time()
                if not (bot_config.working_hours_start <= now <= bot_config.working_hours_end):
                    logger.info("En dehors des heures de travail configurées")
                    return None
            
            # Analyser le message avec le service NLP
            analysis = NLPService.analyze_message(message)
            
            # Générer une réponse
            response_content = NLPService.generate_response(message, analysis)
            
            # Créer la réponse dans la base de données
            response = MessageResponse.objects.create(
                original_message=message,
                content=response_content
            )
            
            # Mettre à jour le statut du message
            message.status = 'processed'
            message.processed_at = timezone.now()
            message.save()
            
            # Envoyer la réponse
            if message.message_type == 'email':
                # Trouver le compte email à utiliser
                email_account = message.user.email_accounts.filter(is_active=True).first()
                
                if email_account:
                    EmailService.send_email(
                        email_account=email_account,
                        recipient=message.sender,
                        subject=f"Re: {message.subject}" if message.subject else "Réponse automatique",
                        content=response_content
                    )
                    
                    # Mettre à jour le statut du message
                    message.status = 'replied'
                    message.save()
            
            elif message.message_type == 'whatsapp':
                # Trouver le compte WhatsApp à utiliser
                whatsapp_account = message.user.whatsapp_accounts.filter(is_active=True).first()
                
                if whatsapp_account:
                    WhatsAppService.send_whatsapp(
                        whatsapp_account=whatsapp_account,
                        recipient=message.sender,
                        content=response_content
                    )
                    
                    # Mettre à jour le statut du message
                    message.status = 'replied'
                    message.save()
            
            return response
            
        except Exception as e:
            logger.error(f"Erreur lors du traitement automatique du message: {str(e)}")
            
            # Mettre à jour le statut du message en cas d'erreur
            message.status = 'failed'
            message.save()
            
            return None
