import requests
import json
import sys

def test_register():
    """Test l'API d'inscription"""
    url = "http://127.0.0.1:8000/api/accounts/register/"
    data = {
        "username": "testuser123",
        "email": "testuser123@example.com",
        "password": "TestPassword123!",
        "password2": "TestPassword123!",
        "first_name": "Test",
        "last_name": "User"
    }
    
    print(f"Envoi de la requête à {url} avec les données: {json.dumps(data, indent=2)}")
    
    try:
        response = requests.post(url, json=data)
        print(f"Statut de la réponse: {response.status_code}")
        print(f"Contenu de la réponse: {response.text}")
        
        if response.status_code == 201:
            print("✅ Inscription réussie!")
        else:
            print("❌ Échec de l'inscription")
    except Exception as e:
        print(f"❌ Erreur lors de la requête: {str(e)}")

if __name__ == "__main__":
    test_register()
