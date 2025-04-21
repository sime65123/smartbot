import requests
import json
import sys

# URL de base de l'API
base_url = 'http://localhost:8000/api/'

# Informations d'identification pour la connexion
login_data = {
    'username': 'Sime',
    'password': 'password123'
}

def test_bot_config():
    # Étape 1: Connexion pour obtenir un token
    print("1. Tentative de connexion...")
    login_url = base_url + "accounts/login/"
    
    try:
        login_response = requests.post(login_url, json=login_data)
        print(f"Statut de la réponse de connexion: {login_response.status_code}")
        
        if login_response.status_code != 200:
            print(f"Échec de la connexion: {login_response.text}")
            return
        
        token = login_response.json().get('token')
        if not token:
            print("Aucun token trouvé dans la réponse de connexion")
            return
        
        print(f"Connexion réussie, token obtenu: {token[:10]}...")
        
        # Configuration des en-têtes avec le token d'authentification
        headers = {
            "Authorization": f"Token {token}",
            "Content-Type": "application/json"
        }
        
        print(f"\nEn-têtes de la requête: {headers}")
        
        # Étape 2: Récupérer les configurations du bot
        print("\n2. Tentative de récupération des configurations du bot...")
        config_url = base_url + "bot-configurations/"
        
        config_response = requests.get(config_url, headers=headers)
        print(f"Statut de la réponse: {config_response.status_code}")
        
        if config_response.status_code != 200:
            print(f"Échec de la récupération des configurations: {config_response.text}")
            return
        
        configs = config_response.json()
        print("\nConfigurations récupérées avec succès:")
        print(json.dumps(configs, indent=2))
        
        # Étape 3: Créer une nouvelle configuration du bot
        print("\n3. Tentative de création d'une nouvelle configuration du bot...")
        new_config = {
            "name": "Test Bot Config",
            "is_active": True,
            "auto_reply_emails": True,
            "auto_reply_whatsapp": True,
            "working_hours_start": "09:00:00",
            "working_hours_end": "17:00:00"
        }
        
        create_response = requests.post(config_url, headers=headers, json=new_config)
        print(f"Statut de la réponse: {create_response.status_code}")
        
        if create_response.status_code not in [200, 201]:
            print(f"Échec de la création de la configuration: {create_response.text}")
            return
        
        created_config = create_response.json()
        print("\nConfiguration créée avec succès:")
        print(json.dumps(created_config, indent=2))
        
        # Étape 4: Mettre à jour la configuration créée
        config_id = created_config.get('id')
        if not config_id:
            print("Aucun ID trouvé dans la configuration créée")
            return
        
        print(f"\n4. Tentative de mise à jour de la configuration {config_id}...")
        update_url = f"{config_url}{config_id}/"
        
        updated_data = {
            "name": "Test Bot Config Updated",
            "is_active": False,
            "auto_reply_emails": False,
            "auto_reply_whatsapp": True,
            "working_hours_start": "10:00:00",
            "working_hours_end": "18:00:00"
        }
        
        update_response = requests.put(update_url, headers=headers, json=updated_data)
        print(f"Statut de la réponse: {update_response.status_code}")
        
        if update_response.status_code != 200:
            print(f"Échec de la mise à jour de la configuration: {update_response.text}")
            return
        
        updated_config = update_response.json()
        print("\nConfiguration mise à jour avec succès:")
        print(json.dumps(updated_config, indent=2))
        
        # Étape 5: Supprimer la configuration
        print(f"\n5. Tentative de suppression de la configuration {config_id}...")
        delete_url = f"{config_url}{config_id}/"
        
        delete_response = requests.delete(delete_url, headers=headers)
        print(f"Statut de la réponse: {delete_response.status_code}")
        
        if delete_response.status_code not in [200, 204]:
            print(f"Échec de la suppression de la configuration: {delete_response.text}")
            return
        
        print("Configuration supprimée avec succès")
        
    except Exception as e:
        print(f"Une erreur s'est produite: {str(e)}")

if __name__ == "__main__":
    test_bot_config()
