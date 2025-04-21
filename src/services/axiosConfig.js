import axios from 'axios';

// Configuration de base d'Axios
const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',  // URL complète avec le protocole, le domaine et le port
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Intercepteur pour ajouter le token d'authentification à chaque requête
axiosInstance.interceptors.request.use(
  (config) => {
    // Récupérer les informations utilisateur à chaque requête pour avoir le token le plus récent
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
      console.log('Token trouvé, ajout à la requête:', user.token.substring(0, 10) + '...');
      // Assurez-vous que le format est exactement 'Token <token>' (avec un espace après 'Token')
      config.headers['Authorization'] = `Token ${user.token}`;
      
      // Débogage des en-têtes
      console.log('En-têtes complets de la requête:', config.headers);
    } else {
      console.warn('Aucun token trouvé pour authentifier la requête');
    }
    
    // Log de débogage pour chaque requête
    console.log('Requête envoyée:', {
      url: config.url,
      method: config.method,
      data: config.data,
      headers: config.headers
    });
    
    return config;
  },
  (error) => {
    console.error('Erreur dans l\'intercepteur de requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Réponse reçue:', {
      status: response.status,
      data: response.data,
      url: response.config.url
    });
    return response;
  },
  (error) => {
    console.error('Erreur dans l\'intercepteur de réponse:', error);
    
    if (error.response) {
      // Gérer les erreurs d'authentification
      if (error.response.status === 401) {
        console.error('Erreur d\'authentification (401): Session expirée ou token invalide');
        localStorage.removeItem('user'); // Supprimer l'utilisateur du localStorage
        window.location.href = '/login'; // Rediriger vers la page de connexion
      } else if (error.response.status === 403) {
        console.error('Erreur d\'autorisation (403): Accès interdit');
      }
      
      console.error('Détails de l\'erreur:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url
      });
    } else if (error.request) {
      console.error('Aucune réponse reçue:', error.request);
    } else {
      console.error('Erreur de configuration de la requête:', error.message);
    }
    
    // Gérer les erreurs d'authentification (401)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
