"""
Tâches Celery pour l'application API.
"""

from celery import shared_task
import logging
from .models import Message
from .message_service import EmailService, AutoReplyService
from accounts.models import EmailAccount, WhatsAppAccount

logger = logging.getLogger(__name__)

@shared_task
def check_new_emails():
    """
    Tâche périodique pour vérifier les nouveaux emails pour tous les comptes actifs.
    """
    logger.info("Vérification des nouveaux emails...")
    
    # Récupérer tous les comptes email actifs
    email_accounts = EmailAccount.objects.filter(is_active=True)
    
    new_messages_count = 0
    
    # Pour chaque compte email
    for account in email_accounts:
        try:
            # Vérifier les nouveaux emails
            new_messages = EmailService.check_emails(account)
            new_messages_count += len(new_messages)
            
            logger.info(f"{len(new_messages)} nouveaux emails trouvés pour {account.email}")
            
        except Exception as e:
            logger.error(f"Erreur lors de la vérification des emails pour {account.email}: {str(e)}")
    
    logger.info(f"Vérification terminée. {new_messages_count} nouveaux messages au total.")
    
    return new_messages_count

@shared_task
def process_pending_messages():
    """
    Tâche périodique pour traiter les messages en attente et générer des réponses automatiques.
    """
    logger.info("Traitement des messages en attente...")
    
    # Récupérer tous les messages en attente
    pending_messages = Message.objects.filter(status='pending')
    
    processed_count = 0
    
    # Pour chaque message
    for message in pending_messages:
        try:
            # Traiter le message
            response = AutoReplyService.process_message(message)
            
            if response:
                processed_count += 1
                logger.info(f"Message {message.id} traité avec succès")
            else:
                logger.info(f"Message {message.id} non traité (pas de réponse générée)")
            
        except Exception as e:
            logger.error(f"Erreur lors du traitement du message {message.id}: {str(e)}")
            
            # Mettre à jour le statut du message en cas d'erreur
            message.status = 'failed'
            message.save()
    
    logger.info(f"Traitement terminé. {processed_count} messages traités sur {pending_messages.count()}.")
    
    return processed_count
