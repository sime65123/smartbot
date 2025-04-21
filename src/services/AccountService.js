import axios from '../services/axiosConfig';

const API_URL = '/';

class AccountService {
  // Comptes email
  async getEmailAccounts() {
    try {
      const response = await axios.get(API_URL + 'email-accounts/');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getEmailAccount(id) {
    try {
      const response = await axios.get(API_URL + `email-accounts/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createEmailAccount(accountData) {
    try {
      const response = await axios.post(API_URL + 'email-accounts/', accountData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateEmailAccount(id, accountData) {
    try {
      const response = await axios.put(API_URL + `email-accounts/${id}/`, accountData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteEmailAccount(id) {
    try {
      const response = await axios.delete(API_URL + `email-accounts/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Comptes WhatsApp
  async getWhatsAppAccounts() {
    try {
      const response = await axios.get(API_URL + 'whatsapp-accounts/');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getWhatsAppAccount(id) {
    try {
      const response = await axios.get(API_URL + `whatsapp-accounts/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async createWhatsAppAccount(accountData) {
    try {
      const response = await axios.post(API_URL + 'whatsapp-accounts/', accountData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateWhatsAppAccount(id, accountData) {
    try {
      const response = await axios.put(API_URL + `whatsapp-accounts/${id}/`, accountData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteWhatsAppAccount(id) {
    try {
      const response = await axios.delete(API_URL + `whatsapp-accounts/${id}/`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Activités utilisateur
  async getUserActivities() {
    try {
      console.log('Appel API: GET accounts/user-activities');
      // Utiliser le chemin correct qui inclut le préfixe 'accounts/'
      const response = await axios.get('accounts/user-activities/');
      console.log('Réponse API getUserActivities:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur dans getUserActivities:', error.message);
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
  
  // Obtenir un résumé des comptes pour le tableau de bord
  async getAccountsSummary() {
    try {
      console.log('Appel API: GET accounts/accounts-summary');
      // Utiliser le chemin correct qui inclut le préfixe 'accounts/'
      const response = await axios.get('accounts/accounts-summary/');
      console.log('Réponse API getAccountsSummary:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur dans getAccountsSummary:', error.message);
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
}

export default new AccountService();
