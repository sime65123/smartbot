import axios from './axiosConfig';

const API_URL = 'accounts/';

class AuthService {
  async login(username, password) {
    try {
      console.log('Tentative de connexion avec:', { username });
      const response = await axios.post(API_URL + 'login/', {
        username,
        password
      });
      
      console.log('Réponse de connexion:', response.data);
      
      if (response.data.token) {
        console.log('Token reçu, sauvegarde des informations utilisateur...');
        localStorage.setItem('user', JSON.stringify(response.data));
        // Pas besoin de configurer le token ici, axiosConfig le fera automatiquement
      } else {
        console.warn('Aucun token reçu dans la réponse de connexion');
      }
      
      return response.data;
    } catch (error) {
      console.error('Erreur de connexion:', error.response ? error.response.data : error.message);
      throw error;
    }
  }

  async logout() {
    try {
      console.log('Tentative de déconnexion...');
      
      // Récupérer l'utilisateur actuel pour obtenir le token
      const user = this.getCurrentUser();
      
      // Effectuer la requête de déconnexion avec le token d'authentification
      if (user && user.token) {
        await axios.post(API_URL + 'logout/', {}, {
          headers: {
            'Authorization': `Token ${user.token}`
          }
        });
        console.log('Déconnexion réussie côté serveur');
      } else {
        console.warn('Aucun token trouvé, déconnexion uniquement côté client');
      }
      
      // Supprimer l'utilisateur du localStorage dans tous les cas
      localStorage.removeItem('user');
      console.log('Utilisateur supprimé du localStorage');
      
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      
      // Même en cas d'erreur, on supprime l'utilisateur du localStorage
      localStorage.removeItem('user');
      console.log('Utilisateur supprimé du localStorage malgré l\'erreur');
      
      // On retourne quand même un succès car l'utilisateur est déconnecté côté client
      return { success: true };
    }
  }

  async register(username, email, password, firstName = '', lastName = '') {
    try {
      console.log('Envoi des données d\'inscription:', {
        username,
        email,
        password,
        password2: password,
        first_name: firstName,
        last_name: lastName
      });
      
      const response = await axios.post(API_URL + 'register/', {
        username,
        email,
        password,
        password2: password,
        first_name: firstName,
        last_name: lastName
      });
      
      console.log('Réponse d\'inscription:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      console.error('Détails:', error.response ? error.response.data : error.message);
      throw error;
    }
  }

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  }

  async fetchUserProfile() {
    try {
      console.log('Récupération des informations du profil utilisateur...');
      
      // Vérifier si nous avons un token d'authentification
      const user = this.getCurrentUser();
      if (!user || !user.token) {
        console.error('Aucun token d\'authentification disponible');
        throw new Error('Vous devez être connecté pour accéder à votre profil');
      }
      
      // Utiliser l'instance axios configurée
      const response = await axios.get(API_URL + 'profile/');
      console.log('Profil récupéré:', response.data);
      
      // Vérifier les données reçues
      const profileData = response.data;
      
      // Vérifier les champs obligatoires
      const requiredFields = ['username', 'email', 'first_name', 'last_name'];
      const missingFields = requiredFields.filter(field => !profileData[field]);
      
      if (missingFields.length > 0) {
        console.warn('Champs manquants dans les données du profil:', missingFields);
      }
      
      // Formater les dates si elles existent
      if (profileData.date_joined) {
        console.log('Date d\'inscription trouvée:', profileData.date_joined);
      } else {
        console.warn('Aucune date d\'inscription trouvée dans la réponse');
      }
      
      if (profileData.last_login) {
        console.log('Date de dernière connexion trouvée:', profileData.last_login);
      } else {
        console.warn('Aucune date de dernière connexion trouvée dans la réponse');
      }
      
      // Mettre à jour les informations utilisateur dans le localStorage
      const updatedUser = { ...user, ...profileData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return updatedUser;
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      if (error.response) {
        console.error('Détails de l\'erreur:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      } else if (error.request) {
        console.error('Aucune réponse reçue:', error.request);
      } else {
        console.error('Erreur lors de la configuration de la requête:', error.message);
      }
      throw error;
    }
  }

  checkAuth() {
    const user = localStorage.getItem('user');
    if (user) {
      return JSON.parse(user);
    }
    return null;
  }

  async updateProfile(profileData) {
    try {
      console.log('Tentative de mise à jour du profil:', profileData);
      const response = await axios.put(API_URL + 'profile/', profileData);
      console.log('Réponse de mise à jour du profil:', response.data);
      
      // Récupérer à nouveau le profil complet pour avoir les dates à jour
      console.log('Récupération du profil mis à jour...');
      const updatedProfile = await this.fetchUserProfile();
      
      return updatedProfile;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error.response ? error.response.data : error.message);
      throw error;
    }
  }

  async changePassword(oldPassword, newPassword) {
    try {
      console.log('Tentative de changement de mot de passe...');
      const response = await axios.post(API_URL + 'change-password/', {
        old_password: oldPassword,
        new_password: newPassword,
        new_password2: newPassword // Ajout du champ de confirmation requis par le backend
      });
      
      console.log('Réponse du changement de mot de passe:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error.response ? error.response.data : error.message);
      throw error;
    }
  }
}

export default new AuthService();
