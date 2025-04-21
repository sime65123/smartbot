import axios from './axiosConfig';

// L'URL de base est déjà préfixée par 'api/' dans les requêtes axios
const API_URL = '';

class BotService {
  // Configurations du bot
  async getBotConfigurations() {
    try {
      console.log('Appel API: GET', API_URL + 'bot-configurations/');
      const response = await axios.get(API_URL + 'bot-configurations/');
      console.log('Réponse API getBotConfigurations:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur dans getBotConfigurations:', error.message);
      if (error.response) {
        console.error('Détails:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      throw error;
    }
  }

  async getBotConfiguration(id) {
    try {
      const response = await axios.get(API_URL + `bot-configurations/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createBotConfiguration(configData) {
    try {
      console.log('Appel API: POST', API_URL + 'bot-configurations/', configData);
      const response = await axios.post(API_URL + 'bot-configurations/', configData);
      console.log('Réponse API createBotConfiguration:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur dans createBotConfiguration:', error.message);
      if (error.response) {
        console.error('Détails:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      throw error;
    }
  }

  async updateBotConfiguration(id, configData) {
    try {
      const response = await axios.put(API_URL + `bot-configurations/${id}/`, configData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteBotConfiguration(id) {
    try {
      const response = await axios.delete(API_URL + `bot-configurations/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Modèles de réponse
  async getResponseTemplates() {
    try {
      const response = await axios.get(API_URL + 'response-templates/');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getResponseTemplate(id) {
    try {
      const response = await axios.get(API_URL + `response-templates/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createResponseTemplate(templateData) {
    try {
      const response = await axios.post(API_URL + 'response-templates/', templateData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateResponseTemplate(id, templateData) {
    try {
      const response = await axios.put(API_URL + `response-templates/${id}/`, templateData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteResponseTemplate(id) {
    try {
      const response = await axios.delete(API_URL + `response-templates/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Messages
  async getMessages() {
    try {
      console.log('Appel API: GET messages');
      // Utiliser le chemin correct sans ajouter api/ car déjà dans baseURL
      const response = await axios.get('messages/');
      console.log('Réponse API getMessages:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur dans getMessages:', error.message);
      if (error.response) {
        console.error('Détails:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      // En cas d'erreur, retourner un tableau vide pour éviter les erreurs dans le tableau de bord
      console.log('Retour d\'un tableau vide suite à l\'erreur');
      return [];
    }
  }

  async getMessage(id) {
    try {
      const response = await axios.get(API_URL + `messages/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateMessageStatus(id, status) {
    try {
      const response = await axios.patch(API_URL + `messages/${id}/`, { status });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Réponses aux messages
  async getMessageResponses(messageId) {
    try {
      const response = await axios.get(API_URL + `message-responses/?message=${messageId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createMessageResponse(responseData) {
    try {
      const response = await axios.post(API_URL + 'message-responses/', responseData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  // Statistiques pour le tableau de bord
  async getDashboardStats() {
    try {
      console.log('Appel API: GET dashboard-stats');
      // Utiliser le chemin correct sans ajouter api/ car déjà dans baseURL
      const response = await axios.get('dashboard-stats/');
      console.log('Réponse API getDashboardStats:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur dans getDashboardStats:', error.message);
      if (error.response) {
        console.error('Détails:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      // En cas d'erreur, retourner un objet vide pour éviter les erreurs dans le tableau de bord
      console.log('Retour d\'un objet vide suite à l\'erreur');
      return {};
    }
  }
  
  // Intentions et catégories d'intentions
  async getIntents() {
    try {
      console.log('Appel API: GET api/intents');
      const response = await axios.get('api/intents/');
      console.log('Réponse API getIntents:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur dans getIntents:', error.message);
      if (error.response) {
        console.error('Détails:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      // En cas d'erreur, retourner un tableau vide
      return [];
    }
  }
  
  async getIntentCategories() {
    try {
      console.log('Appel API: GET api/intent-categories');
      const response = await axios.get('api/intent-categories/');
      console.log('Réponse API getIntentCategories:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur dans getIntentCategories:', error.message);
      if (error.response) {
        console.error('Détails:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      // En cas d'erreur, retourner un tableau vide
      return [];
    }
  }
}

export default new BotService();
