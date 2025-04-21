import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Container, Row, Col, Card, Alert, Badge, Table, Spinner } from 'react-bootstrap';
import { FaEnvelope, FaClock, FaCheck, FaExclamationTriangle, FaWhatsapp } from 'react-icons/fa';
import BotService from '../../services/BotService';
import AccountService from '../../services/AccountService';

// Composant de statistique optimisé avec React.memo
const StatCard = React.memo(({ title, value, icon, color }) => (
  <Card className="mb-4 shadow-sm">
    <Card.Body>
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <h6 className="text-muted">{title}</h6>
          <h2 className="mb-0">{value}</h2>
        </div>
        <div className={`text-${color} fs-1`}>
          {icon}
        </div>
      </div>
    </Card.Body>
  </Card>
));

// Composant de message récent optimisé avec React.memo
const RecentMessage = React.memo(({ message, formatDate, getStatusBadge }) => (
  <tr key={message.id}>
    <td>{message.sender}</td>
    <td>{message.subject}</td>
    <td>{formatDate(message.received_at)}</td>
    <td>{getStatusBadge(message.status)}</td>
  </tr>
));

// Composant d'activité récente optimisé avec React.memo
const RecentActivity = React.memo(({ activity, formatDate }) => (
  <tr key={activity.id}>
    <td>{activity.activity_type}</td>
    <td>{activity.details}</td>
    <td>{formatDate(activity.timestamp)}</td>
  </tr>
));

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [recentMessages, setRecentMessages] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [accountsSummary, setAccountsSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Utilisation de useCallback pour mémoriser les fonctions
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Récupérer les statistiques du tableau de bord
      try {
        console.log('Récupération des statistiques du tableau de bord...');
        const statsData = await BotService.getDashboardStats();
        console.log('Statistiques reçues:', statsData);
        setStats(statsData || {});
      } catch (statsError) {
        console.error('Erreur lors de la récupération des statistiques:', statsError);
        setStats({});
      }
      
      // Récupérer les messages récents (limités à 5)
      try {
        console.log('Récupération des messages récents...');
        const messagesData = await BotService.getMessages();
        console.log('Messages reçus:', messagesData);
        // Vérifier que messagesData est bien un tableau avant d'appeler slice()
        if (Array.isArray(messagesData)) {
          setRecentMessages(messagesData.slice(0, 5));
        } else {
          console.warn('Les données de messages ne sont pas un tableau:', messagesData);
          setRecentMessages([]);
        }
      } catch (messagesError) {
        console.error('Erreur lors de la récupération des messages:', messagesError);
        setRecentMessages([]);
      }
      
      // Récupérer les activités récentes (limitées à 5)
      try {
        console.log('Récupération des activités récentes...');
        const activitiesData = await AccountService.getUserActivities();
        console.log('Activités reçues:', activitiesData);
        // Vérifier que activitiesData est bien un tableau avant d'appeler slice()
        if (Array.isArray(activitiesData)) {
          setRecentActivities(activitiesData.slice(0, 5));
        } else {
          console.warn('Les données d\'activités ne sont pas un tableau:', activitiesData);
          setRecentActivities([]);
        }
      } catch (activitiesError) {
        console.error('Erreur lors de la récupération des activités:', activitiesError);
        setRecentActivities([]);
      }
      
      // Récupérer le résumé des comptes
      try {
        console.log('Récupération du résumé des comptes...');
        const accountsData = await AccountService.getAccountsSummary();
        console.log('Résumé des comptes reçu:', accountsData);
        setAccountsSummary(accountsData || {});
      } catch (accountsError) {
        console.error('Erreur lors de la récupération du résumé des comptes:', accountsError);
        setAccountsSummary({});
      }
      
    } catch (err) {
      setError("Une erreur s'est produite lors du chargement des données du tableau de bord.");
      console.error('Erreur générale lors du chargement du tableau de bord:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger les données au montage du composant
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Formater la date avec useCallback pour éviter les re-rendus inutiles
  const formatDate = useCallback((dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  }, []);

  // Fonction pour obtenir la couleur du badge selon le statut
  const getStatusBadge = useCallback((status) => {
    switch (status) {
      case 'pending':
        return <Badge bg="warning"><FaClock className="me-1" /> En attente</Badge>;
      case 'processed':
        return <Badge bg="info"><FaCheck className="me-1" /> Traité</Badge>;
      case 'replied':
        return <Badge bg="success"><FaCheck className="me-1" /> Répondu</Badge>;
      case 'failed':
        return <Badge bg="danger"><FaExclamationTriangle className="me-1" /> Échoué</Badge>;
      default:
        return <Badge bg="secondary">Inconnu</Badge>;
    }
  }, []);

  // Mémoriser les cartes de statistiques pour éviter les re-rendus inutiles
  const statCards = useMemo(() => {
    if (!stats) return null;

    return (
      <Row>
        <Col md={3}>
          <StatCard 
            title="Messages totaux" 
            value={stats.total_messages} 
            icon={<FaEnvelope />} 
            color="primary" 
          />
        </Col>
        <Col md={3}>
          <StatCard 
            title="En attente" 
            value={stats.pending_messages} 
            icon={<FaClock />} 
            color="warning" 
          />
        </Col>
        <Col md={3}>
          <StatCard 
            title="Traités" 
            value={stats.processed_messages} 
            icon={<FaCheck />} 
            color="info" 
          />
        </Col>
        <Col md={3}>
          <StatCard 
            title="Répondus" 
            value={stats.replied_messages} 
            icon={<FaCheck />} 
            color="success" 
          />
        </Col>
      </Row>
    );
  }, [stats]);

  // Mémoriser les cartes de comptes pour éviter les re-rendus inutiles
  const accountCards = useMemo(() => {
    if (!accountsSummary) return null;

    // Vérifier si email_accounts et whatsapp_accounts sont des objets et extraire la valeur 'total'
    const emailAccountsValue = accountsSummary.email_accounts && typeof accountsSummary.email_accounts === 'object' 
      ? accountsSummary.email_accounts.total || 0 
      : (accountsSummary.email_accounts || 0);
      
    const whatsappAccountsValue = accountsSummary.whatsapp_accounts && typeof accountsSummary.whatsapp_accounts === 'object' 
      ? accountsSummary.whatsapp_accounts.total || 0 
      : (accountsSummary.whatsapp_accounts || 0);

    return (
      <Row className="mt-4">
        <Col md={6}>
          <StatCard 
            title="Comptes Email" 
            value={emailAccountsValue} 
            icon={<FaEnvelope />} 
            color="primary" 
          />
        </Col>
        <Col md={6}>
          <StatCard 
            title="Comptes WhatsApp" 
            value={whatsappAccountsValue} 
            icon={<FaWhatsapp />} 
            color="success" 
          />
        </Col>
      </Row>
    );
  }, [accountsSummary]);

  return (
    <Container>
      <h1 className="mb-4">Tableau de bord</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Statistiques */}
          {statCards}
          
          {/* Comptes */}
          {accountCards}
          
          {/* Messages récents et activités récentes */}
          <Row className="mt-4">
            <Col md={6}>
              <Card className="shadow-sm mb-4">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Messages récents</h5>
                </Card.Header>
                <Card.Body>
                  {recentMessages.length > 0 ? (
                    <Table responsive hover>
                      <thead>
                        <tr>
                          <th>Expéditeur</th>
                          <th>Sujet</th>
                          <th>Date</th>
                          <th>Statut</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentMessages.map(message => (
                          <RecentMessage 
                            key={message.id}
                            message={message}
                            formatDate={formatDate}
                            getStatusBadge={getStatusBadge}
                          />
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <p className="text-center text-muted my-3">Aucun message récent</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="shadow-sm mb-4">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Activités récentes</h5>
                </Card.Header>
                <Card.Body>
                  {recentActivities.length > 0 ? (
                    <Table responsive hover>
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Détails</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentActivities.map(activity => (
                          <RecentActivity 
                            key={activity.id}
                            activity={activity}
                            formatDate={formatDate}
                          />
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <p className="text-center text-muted my-3">Aucune activité récente</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default React.memo(Dashboard);
