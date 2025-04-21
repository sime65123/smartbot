import requests
import json
import sys

def test_profile_api():
    """Test l'API de profil utilisateur"""
    # Remplacez ces valeurs par vos propres identifiants
    username = "testuser123"
    password = "TestPassword123!"
    
    # URL de base
    base_url = "http://127.0.0.1:8000/api/"
    
    # Étape 1: Se connecter pour obtenir un token
    login_url = base_url + "accounts/login/"
    login_data = {
        "username": username,
        "password": password
    }
    
    print(f"Tentative de connexion avec {username}...")
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
        
        # Étape 2: Récupérer le profil utilisateur
        profile_url = base_url + "accounts/profile/"
        headers = {
            "Authorization": f"Token {token}",
            "Content-Type": "application/json"
        }
        
        print(f"\nEn-têtes de la requête: {headers}")
        
        print(f"\nTentative de récupération du profil utilisateur...")
        profile_response = requests.get(profile_url, headers=headers)
        print(f"Statut de la réponse du profil: {profile_response.status_code}")
        
        if profile_response.status_code != 200:
            print(f"Échec de la récupération du profil: {profile_response.text}")
            return
        
        profile_data = profile_response.json()
        print(f"\nProfil utilisateur récupéré avec succès:")
        print(json.dumps(profile_data, indent=2))
        
        # Vérifier si les dates sont présentes
        if 'date_joined' in profile_data:
            print(f"\nDate d'inscription: {profile_data['date_joined']}")
        else:
            print("\nAucune date d'inscription trouvée dans la réponse")
        
        if 'last_login' in profile_data:
            print(f"Dernière connexion: {profile_data['last_login']}")
        else:
            print("Aucune date de dernière connexion trouvée dans la réponse")
        
    except Exception as e:
        print(f"Erreur lors du test de l'API: {str(e)}")

if __name__ == "__main__":
    test_profile_api()
