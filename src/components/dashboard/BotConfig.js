import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Modal } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import BotService from '../../services/BotService';

const BotConfig = ({ user }) => {
  const [configurations, setConfigurations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentConfig, setCurrentConfig] = useState(null);

  // Schéma de validation
  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Le nom est requis'),
    is_active: Yup.boolean(),
    auto_reply_emails: Yup.boolean(),
    auto_reply_whatsapp: Yup.boolean(),
    working_hours_start: Yup.string().nullable(),
    working_hours_end: Yup.string().nullable()
  });

  // Charger les configurations du bot
  useEffect(() => {
    fetchConfigurations();
  }, []);

  const fetchConfigurations = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Tentative de récupération des configurations du bot...');
      const response = await BotService.getBotConfigurations();
      console.log('Réponse reçue:', response);
      
      if (response && Array.isArray(response)) {
        setConfigurations(response);
      } else if (response && response.results && Array.isArray(response.results)) {
        setConfigurations(response.results);
      } else {
        console.warn('Format de réponse inattendu:', response);
        setConfigurations([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des configurations:', error);
      if (error.response) {
        console.error('Détails de l\'erreur:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      setError('Erreur lors du chargement des configurations. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // Gérer l'ajout d'une nouvelle configuration
  const handleAddConfig = () => {
    setCurrentConfig(null);
    setShowModal(true);
  };

  // Gérer la modification d'une configuration existante
  const handleEditConfig = (config) => {
    setCurrentConfig(config);
    setShowModal(true);
  };

  // Gérer la suppression d'une configuration
  const handleDeleteConfig = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette configuration ?')) {
      try {
        setLoading(true);
        
        await BotService.deleteBotConfiguration(id);
        
        setSuccess('Configuration supprimée avec succès');
        fetchConfigurations();
      } catch (error) {
        console.error('Erreur lors de la suppression de la configuration:', error);
        setError('Erreur lors de la suppression de la configuration. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setError('');
      setSuccess('');
      
      console.log('Données du formulaire à envoyer:', values);
      
      if (currentConfig) {
        // Mettre à jour une configuration existante
        console.log(`Mise à jour de la configuration ${currentConfig.id}...`);
        const updatedConfig = await BotService.updateBotConfiguration(currentConfig.id, values);
        console.log('Configuration mise à jour:', updatedConfig);
        setSuccess('Configuration mise à jour avec succès');
      } else {
        // Créer une nouvelle configuration
        console.log('Création d\'une nouvelle configuration...');
        const newConfig = await BotService.createBotConfiguration(values);
        console.log('Nouvelle configuration créée:', newConfig);
        setSuccess('Configuration créée avec succès');
      }
      
      // Fermer le modal et rafraîchir les données
      setShowModal(false);
      resetForm();
      fetchConfigurations();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de la configuration:', error);
      if (error.response) {
        console.error('Détails de l\'erreur:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      setError('Erreur lors de l\'enregistrement de la configuration. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Configuration du Bot</h1>
        <Button variant="primary" onClick={handleAddConfig}>
          Ajouter une configuration
        </Button>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      {loading && configurations.length === 0 ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Chargement des configurations...</p>
        </div>
      ) : (
        <Row>
          {configurations.length > 0 ? (
            configurations.map(config => (
              <Col md={6} lg={4} key={config.id} className="mb-4">
                <Card className="h-100 shadow-sm">
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <span>{config.name}</span>
                    <div>
                      {config.is_active ? (
                        <span className="badge bg-success me-2">Actif</span>
                      ) : (
                        <span className="badge bg-secondary me-2">Inactif</span>
                      )}
                    </div>
                  </Card.Header>
                  <Card.Body>
                    <div className="mb-3">
                      <strong>Réponse automatique:</strong>
                      <div>
                        <span className={`badge ${config.auto_reply_emails ? 'bg-success' : 'bg-secondary'} me-2`}>
                          Emails: {config.auto_reply_emails ? 'Activé' : 'Désactivé'}
                        </span>
                        <span className={`badge ${config.auto_reply_whatsapp ? 'bg-success' : 'bg-secondary'}`}>
                          WhatsApp: {config.auto_reply_whatsapp ? 'Activé' : 'Désactivé'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <strong>Heures de travail:</strong>
                      <div>
                        {config.working_hours_start && config.working_hours_end ? (
                          <span>De {config.working_hours_start} à {config.working_hours_end}</span>
                        ) : (
                          <span className="text-muted">Non configurées</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-muted small">
                      <strong>Créé le:</strong> {new Date(config.created_at).toLocaleDateString()}
                    </div>
                  </Card.Body>
                  <Card.Footer className="d-flex justify-content-between">
                    <Button variant="outline-primary" size="sm" onClick={() => handleEditConfig(config)}>
                      Modifier
                    </Button>
                    <Button variant="outline-danger" size="sm" onClick={() => handleDeleteConfig(config.id)}>
                      Supprimer
                    </Button>
                  </Card.Footer>
                </Card>
              </Col>
            ))
          ) : (
            <Col md={12}>
              <Alert variant="info">
                Aucune configuration trouvée. Cliquez sur "Ajouter une configuration" pour commencer.
              </Alert>
            </Col>
          )}
        </Row>
      )}
      
      {/* Modal pour ajouter/modifier une configuration */}
      <Modal show={showModal} onHide={() => setShowModal(false)} backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>
            {currentConfig ? 'Modifier la configuration' : 'Ajouter une configuration'}
          </Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={{
            name: currentConfig?.name || '',
            is_active: currentConfig?.is_active ?? true,
            auto_reply_emails: currentConfig?.auto_reply_emails ?? true,
            auto_reply_whatsapp: currentConfig?.auto_reply_whatsapp ?? true,
            working_hours_start: currentConfig?.working_hours_start || '',
            working_hours_end: currentConfig?.working_hours_end || ''
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting
          }) => (
            <Form onSubmit={handleSubmit}>
              <Modal.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Nom de la configuration</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.name && errors.name}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="is_active"
                    name="is_active"
                    label="Configuration active"
                    checked={values.is_active}
                    onChange={handleChange}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="auto_reply_emails"
                    name="auto_reply_emails"
                    label="Réponse automatique aux emails"
                    checked={values.auto_reply_emails}
                    onChange={handleChange}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="auto_reply_whatsapp"
                    name="auto_reply_whatsapp"
                    label="Réponse automatique aux messages WhatsApp"
                    checked={values.auto_reply_whatsapp}
                    onChange={handleChange}
                  />
                </Form.Group>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Début des heures de travail</Form.Label>
                      <Form.Control
                        type="time"
                        name="working_hours_start"
                        value={values.working_hours_start}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Fin des heures de travail</Form.Label>
                      <Form.Control
                        type="time"
                        name="working_hours_end"
                        value={values.working_hours_end}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                  Annuler
                </Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                      Enregistrement...
                    </>
                  ) : (
                    'Enregistrer'
                  )}
                </Button>
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      </Modal>
    </Container>
  );
};

export default BotConfig;
