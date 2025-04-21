=====================================================
GUIDE COMPLET DE CONFIGURATION DE SMARTBOT
=====================================================

Ce guide vous explique pas à pas comment configurer SmartBot pour répondre automatiquement aux messages WhatsApp et emails.

-----------------------------------------------------
ÉTAPE 1 : INSTALLATION ET DÉMARRAGE
-----------------------------------------------------

1.1. Prérequis
   - Python 3.8 ou supérieur
   - Node.js 14.x ou supérieur
   - npm 6.x ou supérieur
   - Environnement virtuel Python
   - Base de données (SQLite par défaut)

1.2. Installation du backend (Django)
   - Cloner le dépôt : git clone [URL_DU_REPO]
   - Naviguer vers le répertoire du projet : cd ProjetAppo
   - Créer un environnement virtuel : python -m venv venv
   - Activer l'environnement virtuel : 
     * Sur Windows : venv\Scripts\activate
     * Sur Linux/Mac : source venv/bin/activate
   - Installer les dépendances : pip install -r requirements.txt
   - Effectuer les migrations : python manage.py migrate
   - Créer un superutilisateur : python manage.py createsuperuser

1.3. Installation du frontend (React)
   - Naviguer vers le répertoire frontend : cd frontend
   - Installer les dépendances : npm install
   - Créer un fichier .env dans le répertoire frontend avec le contenu suivant :
     ```
     REACT_APP_API_URL=http://localhost:8000/api
     ```

1.4. Démarrage
   - Démarrer le serveur Django (dans un premier terminal) :
     * S'assurer que l'environnement virtuel est activé
     * Naviguer vers le répertoire racine du projet
     * Exécuter : python manage.py runserver
   
   - Démarrer le serveur React (dans un second terminal) :
     * Naviguer vers le répertoire frontend
     * Exécuter : npm start

   - Accéder à l'application :
     * Backend : http://localhost:8000
     * Frontend : http://localhost:3000
   
   - Se connecter avec les identifiants créés lors de l'installation

-----------------------------------------------------
ÉTAPE 2 : CONFIGURATION DU COMPTE WHATSAPP
-----------------------------------------------------

2.1. Accéder à la gestion des comptes
   - Dans le menu de navigation, cliquer sur "Paramètres"
   - Sélectionner "Gestion des comptes"

2.2. Ajouter un compte WhatsApp
   - Dans l'onglet "Comptes WhatsApp", cliquer sur "Ajouter un compte WhatsApp"
   - Remplir les champs suivants :

2.3. Détail des champs
   - Nom du compte : Identifiant descriptif (ex: "WhatsApp Personnel")
     * Rôle : Permet d'identifier facilement ce compte dans l'interface
     * Valeur appropriée : Nom court et descriptif

   - Numéro de téléphone : Format international (ex: +33612345678)
     * Rôle : Numéro associé à votre compte WhatsApp Business
     * Valeur appropriée : Numéro complet avec indicatif pays

   - Description : Information supplémentaire (optionnel)
     * Rôle : Aide à se rappeler l'usage de ce compte
     * Valeur appropriée : Brève description de l'utilisation

   - API Key : Clé d'API WhatsApp Business
     * Rôle : Authentification auprès de l'API WhatsApp
     * Valeur appropriée : Clé obtenue via WhatsApp Business API

   - API Secret : Clé secrète associée
     * Rôle : Sécurisation des appels API
     * Valeur appropriée : Secret obtenu via WhatsApp Business API

   - Actif : État du compte
     * Rôle : Active ou désactive ce compte
     * Valeur appropriée : Coché pour activer

2.4. Enregistrer le compte
   - Cliquer sur "Enregistrer" pour sauvegarder la configuration

2.5. Point important
   ⚠️ Pour utiliser WhatsApp Business API, vous devez vous inscrire auprès de Meta/WhatsApp Business et obtenir les clés d'API. Ce processus peut prendre du temps et nécessiter une vérification d'entreprise.

-----------------------------------------------------
ÉTAPE 3 : CONFIGURATION GÉNÉRALE DU BOT
-----------------------------------------------------

3.1. Accéder à la configuration du bot
   - Dans le menu de navigation, cliquer sur "Paramètres"
   - Sélectionner "Configuration du Bot"

3.2. Créer une nouvelle configuration
   - Cliquer sur "Créer une nouvelle configuration" si aucune n'existe
   - Ou modifier une configuration existante

3.3. Détail des champs
   - Nom : Identifiant de la configuration
     * Rôle : Permet d'identifier cette configuration
     * Valeur appropriée : Nom descriptif (ex: "Configuration principale")

   - Bot actif : État général du bot
     * Rôle : Active ou désactive complètement le bot
     * Valeur appropriée : Coché pour activer

   - Répondre aux emails : Gestion des emails
     * Rôle : Détermine si le bot répond aux emails
     * Valeur appropriée : Coché si vous avez configuré un compte email

   - Répondre aux messages WhatsApp : Gestion des messages WhatsApp
     * Rôle : Détermine si le bot répond aux messages WhatsApp
     * Valeur appropriée : Coché pour activer les réponses WhatsApp

   - Heure de début : Début de la plage horaire
     * Rôle : Définit quand le bot commence à répondre
     * Valeur appropriée : Format HH:MM (ex: 08:00)

   - Heure de fin : Fin de la plage horaire
     * Rôle : Définit quand le bot arrête de répondre
     * Valeur appropriée : Format HH:MM (ex: 20:00)

   - Délai de réponse (minutes) : Temps d'attente
     * Rôle : Temps avant l'envoi d'une réponse automatique
     * Valeur appropriée : Nombre entier (ex: 5)

3.4. Enregistrer la configuration
   - Cliquer sur "Enregistrer" pour sauvegarder

3.5. Point important
   ⚠️ Les heures de début et de fin sont basées sur le fuseau horaire du serveur. Assurez-vous que ces heures correspondent à vos attentes.

-----------------------------------------------------
ÉTAPE 4 : CRÉATION DES MODÈLES DE RÉPONSE
-----------------------------------------------------

4.1. Accéder aux règles de réponse
   - Dans le menu de navigation, cliquer sur "Paramètres"
   - Sélectionner "Règles de réponse"

4.2. Ajouter un modèle de réponse
   - Dans la section "Ajouter un modèle de réponse", remplir les champs

4.3. Détail des champs
   - Nom du modèle : Identifiant du modèle
     * Rôle : Permet d'identifier ce modèle
     * Valeur appropriée : Nom descriptif (ex: "Réponse générale")

   - Type de message : Type de canal
     * Rôle : Détermine pour quel canal ce modèle est utilisé
     * Valeur appropriée : "WhatsApp", "Email" ou "Les deux"

   - Catégorie d'intention : Association à une intention
     * Rôle : Lie le modèle à un type de message détecté
     * Valeur appropriée : Sélectionner une intention ou laisser vide pour général

   - Contenu du modèle : Texte de la réponse
     * Rôle : Le message qui sera envoyé
     * Valeur appropriée : Texte professionnel et courtois

   - Définir comme modèle par défaut : Statut par défaut
     * Rôle : Utilise ce modèle quand aucun autre ne correspond
     * Valeur appropriée : Coché pour un seul modèle par type

4.4. Enregistrer le modèle
   - Cliquer sur "Enregistrer" pour créer ce modèle

4.5. Créer des modèles spécifiques
   Créez plusieurs modèles pour différentes intentions :

   - Modèle "Salutation"
     * Intention : Salutation
     * Contenu suggéré : "Bonjour ! Merci de m'avoir contacté. Je suis actuellement occupé mais je vous répondrai dès que possible."

   - Modèle "Question"
     * Intention : Question
     * Contenu suggéré : "Merci pour votre question. Je l'ai bien reçue et vous répondrai en détail dès que possible."

   - Modèle "Problème"
     * Intention : Problème
     * Contenu suggéré : "Je suis désolé d'apprendre que vous rencontrez un problème. Je vais l'examiner et vous recontacter rapidement."

4.6. Point important
   ⚠️ Assurez-vous d'avoir au moins un modèle par défaut pour chaque type de message que vous souhaitez traiter (WhatsApp et/ou email).

-----------------------------------------------------
ÉTAPE 5 : CONFIGURATION DE L'IA (OPENAI)
-----------------------------------------------------

5.1. Obtenir une clé API OpenAI
   - Créer un compte sur https://platform.openai.com si ce n'est pas déjà fait
   - Générer une clé API dans les paramètres de votre compte OpenAI

5.2. Configurer la clé API
   - Créer un fichier .env à la racine du projet
   - Ajouter la ligne : OPENAI_API_KEY=votre_clé_api_openai
   - Ou définir la variable d'environnement OPENAI_API_KEY

5.3. Redémarrer le serveur
   - Arrêter le serveur Django (Ctrl+C)
   - Redémarrer le serveur : python manage.py runserver

5.4. Point important
   ⚠️ Sans clé API OpenAI, le système utilisera une analyse basique par mots-clés qui est moins précise pour détecter les intentions des messages.

-----------------------------------------------------
ÉTAPE 6 : VÉRIFICATION ET TEST
-----------------------------------------------------

6.1. Accéder au tableau de bord
   - Se connecter à l'application
   - Vérifier que le tableau de bord affiche correctement les informations

6.2. Vérifier les configurations
   - Compte WhatsApp : Doit apparaître dans la liste des comptes
   - Configuration du bot : Doit être active
   - Modèles de réponse : Doivent être listés dans la section correspondante

6.3. Test de réception (si possible)
   - Envoyer un message test à votre numéro WhatsApp Business
   - Vérifier qu'il apparaît dans la liste des messages
   - Vérifier que le bot répond automatiquement

6.4. Points importants
   ⚠️ Pour que les messages WhatsApp soient reçus, votre application doit être accessible depuis Internet avec un webhook configuré.
   ⚠️ Le délai de réponse configuré peut retarder l'envoi de la réponse automatique.

-----------------------------------------------------
FONCTIONNEMENT DU SYSTÈME
-----------------------------------------------------

Une fois configuré, le système traite les messages comme suit :

1. Réception du message
   - Le message WhatsApp est reçu via le webhook
   - Il est enregistré dans la base de données

2. Vérification des conditions
   - Le système vérifie si le bot est actif
   - Il vérifie si l'heure actuelle est dans la plage configurée
   - Il vérifie si le compte associé est actif

3. Analyse du message
   - L'IA analyse le contenu pour détecter l'intention
   - Elle attribue un score de confiance à chaque intention possible

4. Sélection du modèle de réponse
   - Le système sélectionne le modèle correspondant à l'intention
   - Si aucun modèle spécifique n'est trouvé, le modèle par défaut est utilisé

5. Envoi de la réponse
   - La réponse est envoyée au destinataire via WhatsApp
   - Le message est marqué comme "répondu" dans le système

6. Suivi
   - Toutes les interactions sont enregistrées et visibles dans le tableau de bord

-----------------------------------------------------
LIMITATIONS ET POINTS D'ATTENTION
-----------------------------------------------------

1. API WhatsApp Business
   - Nécessite un compte WhatsApp Business API approuvé
   - Processus de vérification qui peut prendre du temps
   - Des frais peuvent être associés à l'utilisation de l'API

2. OpenAI
   - Nécessite une clé API valide
   - Des frais peuvent être associés à l'utilisation intensive
   - La qualité des réponses dépend de la qualité de l'analyse

3. Accessibilité
   - Pour recevoir les messages WhatsApp, l'application doit être accessible depuis Internet
   - Un webhook doit être configuré et pointé vers votre application
   - Peut nécessiter un serveur avec une adresse IP publique ou un service de tunneling

4. Maintenance
   - Vérifiez régulièrement les logs pour détecter d'éventuels problèmes
   - Mettez à jour les modèles de réponse en fonction des retours utilisateurs
   - Surveillez l'utilisation de l'API OpenAI pour éviter des coûts imprévus

-----------------------------------------------------
CONSEILS D'UTILISATION
-----------------------------------------------------

1. Commencez avec des modèles de réponse simples et clairs
2. Testez abondamment avant de mettre en production
3. Informez vos contacts que certaines réponses peuvent être automatisées
4. Vérifiez régulièrement les messages reçus et les réponses envoyées
5. Ajustez les heures de travail en fonction de vos besoins réels
6. Créez des modèles de réponse spécifiques pour les demandes fréquentes

=====================================================
FIN DU GUIDE
=====================================================
