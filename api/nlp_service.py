"""
Service NLP pour analyser les messages et générer des réponses intelligentes.
Ce module utilise des techniques de traitement du langage naturel pour :
1. Analyser le contenu des messages
2. Détecter les intentions
3. Générer des réponses appropriées

Ce service utilise OpenAI pour une compréhension avancée des messages et une génération
de réponses plus pertinentes et contextuelles.
"""

import re
import random
import logging
import os
from django.conf import settings
from openai import OpenAI
from .models import Intent, IntentCategory, MessageIntent, ResponseTemplate

logger = logging.getLogger(__name__)

class NLPService:
    """
    Service pour le traitement du langage naturel (NLP) utilisant OpenAI.
    """
    
    # Initialiser le client OpenAI
    @staticmethod
    def get_openai_client():
        """
        Récupère un client OpenAI configuré.
        
        Returns:
            OpenAI: Client OpenAI configuré
        """
        api_key = getattr(settings, 'OPENAI_API_KEY', os.environ.get('OPENAI_API_KEY'))
        if not api_key:
            logger.warning("Clé API OpenAI non configurée. Utilisation du service NLP de base.")
            return None
            
        return OpenAI(api_key=api_key)
    
    @staticmethod
    def analyze_message(message):
        """
        Analyse un message pour détecter les intentions et extraire des informations.
        Utilise d'abord OpenAI si disponible, sinon repli sur l'analyse basique par mots-clés.
        
        Args:
            message: Instance du modèle Message à analyser
            
        Returns:
            dict: Résultat de l'analyse avec les intentions détectées et leur niveau de confiance
        """
        # Essayer d'abord avec OpenAI
        client = NLPService.get_openai_client()
        if client:
            try:
                return NLPService.analyze_with_openai(client, message)
            except Exception as e:
                logger.error(f"Erreur lors de l'analyse avec OpenAI: {str(e)}")
                logger.info("Repli sur l'analyse basique par mots-clés.")
        
        # Analyse basique par mots-clés (méthode de repli)
        return NLPService.analyze_with_keywords(message)
    
    @staticmethod
    def analyze_with_openai(client, message):
        """
        Analyse un message avec OpenAI pour détecter les intentions.
        
        Args:
            client: Client OpenAI
            message: Instance du modèle Message à analyser
            
        Returns:
            dict: Résultat de l'analyse avec les intentions détectées
        """
        # Récupérer toutes les intentions possibles
        intents = Intent.objects.all()
        intent_descriptions = [f"{intent.name}: {intent.description}" for intent in intents]
        
        # Préparer le prompt pour OpenAI
        prompt = f"""
        Analyse le message suivant et identifie l'intention principale. 
        Voici les intentions possibles:
        {', '.join(intent_descriptions)}
        
        Message: {message.content}
        
        Réponds uniquement avec le nom de l'intention et un score de confiance entre 0 et 1.
        Format: intention|score
        """
        
        # Appeler l'API OpenAI
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Tu es un assistant spécialisé dans l'analyse des intentions des messages."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=50
        )
        
        # Extraire la réponse
        result = response.choices[0].message.content.strip()
        parts = result.split('|')
        
        if len(parts) == 2:
            intent_name = parts[0].strip()
            confidence = float(parts[1].strip())
            
            # Trouver l'intention correspondante
            intent = Intent.objects.filter(name__icontains=intent_name).first()
            
            if intent:
                # Créer une association MessageIntent
                message_intent = MessageIntent.objects.create(
                    message=message,
                    intent=intent,
                    confidence=confidence
                )
                
                return {
                    'detected_intents': [{
                        'intent': intent,
                        'confidence': confidence
                    }],
                    'top_intent': {
                        'intent': intent,
                        'confidence': confidence
                    },
                    'analysis_method': 'openai'
                }
        
        # En cas d'échec, revenir à l'analyse par mots-clés
        logger.warning(f"Impossible d'interpréter la réponse OpenAI: {result}")
        return NLPService.analyze_with_keywords(message)
    
    @staticmethod
    def analyze_with_keywords(message):
        """
        Analyse un message avec la méthode basique par mots-clés.
        
        Args:
            message: Instance du modèle Message à analyser
            
        Returns:
            dict: Résultat de l'analyse avec les intentions détectées et leur niveau de confiance
        """
        # Nettoyer le texte
        text = message.content.lower()
        
        # Récupérer toutes les intentions de la base de données
        intents = Intent.objects.all()
        
        # Détecter les intentions
        detected_intents = []
        
        for intent in intents:
            # Extraire les mots-clés
            keywords = [kw.strip().lower() for kw in intent.keywords.split(',')]
            
            # Calculer le niveau de confiance basé sur la présence de mots-clés
            confidence = 0.0
            matches = 0
            
            for keyword in keywords:
                if keyword in text:
                    matches += 1
            
            if matches > 0 and len(keywords) > 0:
                confidence = matches / len(keywords)
                
                # Créer une association MessageIntent
                message_intent = MessageIntent.objects.create(
                    message=message,
                    intent=intent,
                    confidence=confidence
                )
                
                detected_intents.append({
                    'intent': intent,
                    'confidence': confidence
                })
        
        # Trier les intentions par niveau de confiance
        detected_intents.sort(key=lambda x: x['confidence'], reverse=True)
        
        return {
            'detected_intents': detected_intents,
            'top_intent': detected_intents[0] if detected_intents else None,
            'analysis_method': 'keywords'
        }
    
    @staticmethod
    def generate_response(message, analysis_result=None):
        """
        Génère une réponse automatique basée sur l'analyse du message.
        Utilise d'abord OpenAI si disponible, sinon repli sur les modèles de réponse prédéfinis.
        
        Args:
            message: Instance du modèle Message
            analysis_result: Résultat de l'analyse (optionnel)
            
        Returns:
            str: Réponse générée
        """
        if not analysis_result:
            analysis_result = NLPService.analyze_message(message)
        
        # Essayer d'abord avec OpenAI
        client = NLPService.get_openai_client()
        if client:
            try:
                return NLPService.generate_with_openai(client, message, analysis_result)
            except Exception as e:
                logger.error(f"Erreur lors de la génération de réponse avec OpenAI: {str(e)}")
                logger.info("Repli sur les modèles de réponse prédéfinis.")
        
        # Méthode de repli: utiliser les modèles de réponse prédéfinis
        return NLPService.generate_with_templates(message, analysis_result)
    
    @staticmethod
    def generate_with_openai(client, message, analysis_result):
        """
        Génère une réponse avec OpenAI.
        
        Args:
            client: Client OpenAI
            message: Instance du modèle Message
            analysis_result: Résultat de l'analyse
            
        Returns:
            str: Réponse générée
        """
        top_intent = analysis_result.get('top_intent')
        intent_name = top_intent['intent'].name if top_intent else "inconnu"
        
        # Chercher un modèle de réponse correspondant à l'intention
        template = ResponseTemplate.objects.filter(
            user=message.user,
            template_type__in=[message.message_type, 'both'],
            intent_category__intents__name=intent_name
        ).first()
        
        # Si aucun modèle spécifique n'est trouvé, utiliser un modèle par défaut
        if not template:
            template = ResponseTemplate.objects.filter(
                user=message.user,
                template_type__in=[message.message_type, 'both'],
                is_default=True
            ).first()
        
        # Contexte pour la génération de réponse
        context = {
            "intention": intent_name,
            "confiance": top_intent['confidence'] if top_intent else 0,
            "type_message": message.message_type,
            "expediteur": message.sender,
            "sujet": message.subject if hasattr(message, 'subject') else "",
            "modele_reponse": template.content if template else None
        }
        
        # Préparer le prompt pour OpenAI
        prompt = f"""
        Tu es un assistant automatique qui répond aux messages des clients.
        
        Message reçu: {message.content}
        
        Intention détectée: {intent_name} (confiance: {context['confiance']:.2f})
        Type de message: {message.message_type}
        Expéditeur: {message.sender}
        """
        
        if template:
            prompt += f"""
            Voici un modèle de réponse que tu peux adapter:
            {template.content}
            
            Génère une réponse personnalisée basée sur ce modèle, en l'adaptant au contenu spécifique du message.
            """
        else:
            prompt += """
            Génère une réponse professionnelle, courtoise et utile à ce message.
            La réponse doit être concise (maximum 3-4 phrases) et pertinente par rapport au contenu du message.
            """
        
        # Appeler l'API OpenAI
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Tu es un assistant automatique qui répond aux messages des clients de manière professionnelle et concise."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=200
        )
        
        # Extraire la réponse
        return response.choices[0].message.content.strip()
    
    @staticmethod
    def generate_with_templates(message, analysis_result):
        """
        Génère une réponse en utilisant les modèles de réponse prédéfinis.
        
        Args:
            message: Instance du modèle Message
            analysis_result: Résultat de l'analyse
            
        Returns:
            str: Réponse générée
        """
        top_intent = analysis_result.get('top_intent')
        
        # Réponses génériques par défaut
        generic_responses = [
            "Merci pour votre message. Je vais le traiter dès que possible.",
            "J'ai bien reçu votre message et je vous répondrai bientôt.",
            "Votre message a été enregistré. Je vous contacterai prochainement.",
            "Merci de m'avoir contacté. Je vais examiner votre demande."
        ]
        
        # Si aucune intention n'est détectée ou avec une confiance faible
        if not top_intent or top_intent['confidence'] < 0.3:
            # Chercher un modèle de réponse par défaut
            template = ResponseTemplate.objects.filter(
                user=message.user,
                template_type__in=[message.message_type, 'both'],
                is_default=True
            ).first()
            
            if template:
                return template.content
            
            return random.choice(generic_responses)
        
        # Récupérer l'intention principale
        intent = top_intent['intent']
        
        # Chercher un modèle de réponse correspondant à l'intention
        template = ResponseTemplate.objects.filter(
            user=message.user,
            template_type__in=[message.message_type, 'both'],
            intent_category__intents__name=intent.name
        ).first()
        
        if template:
            return template.content
        
        # Réponses prédéfinies par intention
        if intent.name == 'salutation':
            return f"Bonjour ! Merci de m'avoir contacté. Comment puis-je vous aider aujourd'hui ?"
        
        elif intent.name == 'question':
            return f"Merci pour votre question. Je vais chercher les informations nécessaires et vous répondre dès que possible."
        
        elif intent.name == 'problème':
            return f"Je suis désolé d'apprendre que vous rencontrez un problème. Pourriez-vous me donner plus de détails pour que je puisse vous aider efficacement ?"
        
        elif intent.name == 'remerciement':
            return f"Je vous en prie ! N'hésitez pas à me contacter si vous avez d'autres questions."
        
        elif intent.name == 'rendez_vous':
            return f"Je serais ravi de planifier un rendez-vous avec vous. Quelles sont vos disponibilités ?"
        
        # Réponse par défaut
        return random.choice(generic_responses)
