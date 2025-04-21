import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Form, Pagination, Alert, Spinner, Modal } from 'react-bootstrap';
import { FaEnvelope, FaWhatsapp, FaReply, FaEye, FaTrash } from 'react-icons/fa';
import { Formik } from 'formik';
import * as Yup from 'yup';
import BotService from '../../services/BotService';
import ListTransition from '../common/ListTransition';
import { CSSTransition } from 'react-transition-group';
import '../../styles/animations.css';

const Messages = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [messageFilter, setMessageFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showViewModal, setShowViewModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(null);
  const [messageResponses, setMessageResponses] = useState([]);

  // Schéma de validation pour la réponse
  const validationSchema = Yup.object().shape({
    content: Yup.string().required('Le contenu de la réponse est requis'),
    template_id: Yup.number().nullable()
  });

  // Charger les messages
  useEffect(() => {
    fetchMessages();
    fetchTemplates();
  }, [currentPage, messageFilter, typeFilter]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Construire les paramètres de requête
      let params = `?page=${currentPage}`;
      
      if (messageFilter !== 'all') {
        params += `&status=${messageFilter}`;
      }
      
      if (typeFilter !== 'all') {
        params += `&message_type=${typeFilter}`;
      }
      
      const response = await BotService.getMessages(params);
      setMessages(response.results || []);
      
      // Calculer le nombre total de pages
      const count = response.count || 0;
      const pageSize = 10; // Taille de page par défaut de l'API
      setTotalPages(Math.ceil(count / pageSize));
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
      setError('Erreur lors du chargement des messages. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await BotService.getResponseTemplates();
      setTemplates(response.results || []);
    } catch (error) {
      console.error('Erreur lors du chargement des modèles:', error);
    }
  };

  // Gérer la visualisation d'un message
  const handleViewMessage = async (message) => {
    setCurrentMessage(message);
    
    try {
      // Charger les réponses associées à ce message
      const responses = await BotService.getMessageResponses(message.id);
      setMessageResponses(responses.results || []);
      
      setShowViewModal(true);
    } catch (error) {
      console.error('Erreur lors du chargement des réponses:', error);
      setError('Erreur lors du chargement des réponses. Veuillez réessayer.');
    }
  };

  // Gérer la réponse à un message
  const handleReplyMessage = (message) => {
    setCurrentMessage(message);
    setShowReplyModal(true);
  };

  // Gérer la suppression d'un message
  const handleDeleteMessage = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      try {
        setLoading(true);
        
        await BotService.deleteMessage(id);
        
        setSuccess('Message supprimé avec succès');
        fetchMessages();
      } catch (error) {
        console.error('Erreur lors de la suppression du message:', error);
        setError('Erreur lors de la suppression du message. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Gérer la soumission du formulaire de réponse
  const handleSubmitReply = async (values, { setSubmitting, resetForm }) => {
    try {
      setError('');
      setSuccess('');
      
      // Préparer les données de la réponse
      const responseData = {
        original_message: currentMessage.id,
        content: values.content
      };
      
      // Ajouter le modèle si sélectionné
      if (values.template_id) {
        responseData.template_used = values.template_id;
      }
      
      // Envoyer la réponse
      await BotService.createMessageResponse(responseData);
      
      // Mettre à jour le statut du message
      await BotService.updateMessageStatus(currentMessage.id, 'replied');
      
      setSuccess('Réponse envoyée avec succès');
      setShowReplyModal(false);
      resetForm();
      fetchMessages();
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la réponse:', error);
      setError('Erreur lors de l\'envoi de la réponse. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  // Fonction pour formater la date avec useCallback pour éviter les re-rendus inutiles
  const formatDate = useCallback((dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  }, []);

  // Fonction pour obtenir le badge de statut avec useCallback
  const getStatusBadge = useCallback((status) => {
    switch (status) {
      case 'pending':
        return <Badge bg="warning">En attente</Badge>;
      case 'processed':
        return <Badge bg="info">Traité</Badge>;
      case 'replied':
        return <Badge bg="success">Répondu</Badge>;
      case 'failed':
        return <Badge bg="danger">Échoué</Badge>;
      default:
        return <Badge bg="secondary">Inconnu</Badge>;
    }
  }, []);

  // Fonction pour obtenir l'icône du type de message avec useCallback
  const getMessageTypeIcon = useCallback((type) => {
    switch (type) {
      case 'email':
        return <FaEnvelope className="text-primary" />;
      case 'whatsapp':
        return <FaWhatsapp className="text-success" />;
      default:
        return null;
    }
  }, []);

  // Gérer la pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Créer les éléments de pagination
  const renderPaginationItems = () => {
    const items = [];
    
    // Première page
    items.push(
      <Pagination.First 
        key="first" 
        onClick={() => handlePageChange(1)} 
        disabled={currentPage === 1} 
      />
    );
    
    // Page précédente
    items.push(
      <Pagination.Prev 
        key="prev" 
        onClick={() => handlePageChange(currentPage - 1)} 
        disabled={currentPage === 1} 
      />
    );
    
    // Pages numériques
    for (let page = Math.max(1, currentPage - 2); page <= Math.min(totalPages, currentPage + 2); page++) {
      items.push(
        <Pagination.Item 
          key={page} 
          active={page === currentPage} 
          onClick={() => handlePageChange(page)}
        >
          {page}
        </Pagination.Item>
      );
    }
    
    // Page suivante
    items.push(
      <Pagination.Next 
        key="next" 
        onClick={() => handlePageChange(currentPage + 1)} 
        disabled={currentPage === totalPages} 
      />
    );
    
    // Dernière page
    items.push(
      <Pagination.Last 
        key="last" 
        onClick={() => handlePageChange(totalPages)} 
        disabled={currentPage === totalPages} 
      />
    );
    
    return items;
  };

  // Composant pour un message individuel avec mémoisation
  const MessageRow = React.memo(({ message }) => (
    <tr className="message-row">
      <td>{getMessageTypeIcon(message.message_type)}</td>
      <td>{message.sender}</td>
      <td>{message.subject || '(Sans objet)'}</td>
      <td className="d-none d-md-table-cell">{formatDate(message.received_at)}</td>
      <td>{getStatusBadge(message.status)}</td>
      <td>
        <Button 
          variant="outline-info" 
          size="sm" 
          className="me-2 btn-bounce" 
          onClick={() => handleViewMessage(message)}
        >
          <FaEye />
        </Button>
        {message.status !== 'replied' && (
          <Button 
            variant="outline-success" 
            size="sm" 
            className="me-2 btn-bounce" 
            onClick={() => handleReplyMessage(message)}
          >
            <FaReply />
          </Button>
        )}
        <Button 
          variant="outline-danger" 
          size="sm" 
          className="btn-bounce" 
          onClick={() => handleDeleteMessage(message.id)}
        >
          <FaTrash />
        </Button>
      </td>
    </tr>
  ));

  return (
    <Container>
      <h1 className="mb-4">Gestion des messages</h1>
      
      {/* Afficher les messages de succès ou d'erreur */}
      <CSSTransition
        in={!!error}
        timeout={300}
        classNames="fade"
        unmountOnExit
      >
        <Alert variant="danger" className="mb-4" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      </CSSTransition>
      
      <CSSTransition
        in={!!success}
        timeout={300}
        classNames="fade"
        unmountOnExit
      >
        <Alert variant="success" className="mb-4" onClose={() => setSuccess('')} dismissible>
          {success}
        </Alert>
      </CSSTransition>
      
      {/* Filtres */}
      <Card className="mb-4 shadow-sm card-appear">
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Filtrer par statut</Form.Label>
                <Form.Select 
                  value={messageFilter} 
                  onChange={(e) => setMessageFilter(e.target.value)}
                >
                  <option value="all">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="processed">Traités</option>
                  <option value="replied">Répondus</option>
                  <option value="failed">Échoués</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Filtrer par type</Form.Label>
                <Form.Select 
                  value={typeFilter} 
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">Tous les types</option>
                  <option value="email">Email</option>
                  <option value="whatsapp">WhatsApp</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Liste des messages */}
      <Card className="shadow-sm card-appear">
        <Card.Body>
          {loading ? (
            <div className="text-center my-5">
              <div className="spinner-border text-primary spin" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
            </div>
          ) : messages.length > 0 ? (
            <>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Expéditeur</th>
                    <th>Sujet</th>
                    <th className="d-none d-md-table-cell">Date</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <ListTransition
                    items={messages}
                    keyExtractor={(message) => message.id}
                    renderItem={(message) => <MessageRow message={message} />}
                  />
                </tbody>
              </Table>
              
              {/* Pagination */}
              <div className="d-flex justify-content-center mt-4">
                <Pagination>{renderPaginationItems()}</Pagination>
              </div>
            </>
          ) : (
            <p className="text-center text-muted my-5">Aucun message trouvé</p>
          )}
        </Card.Body>
      </Card>
      
      {/* Modal de visualisation du message */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Détails du message</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentMessage && (
            <div className="slide-in">
              <Row className="mb-4">
                <Col md={6}>
                  <p><strong>Expéditeur:</strong> {currentMessage.sender}</p>
                  <p><strong>Sujet:</strong> {currentMessage.subject || '(Sans objet)'}</p>
                  <p><strong>Date:</strong> {formatDate(currentMessage.received_at)}</p>
                </Col>
                <Col md={6}>
                  <p>
                    <strong>Type:</strong> {' '}
                    {currentMessage.message_type === 'email' ? 'Email' : 'WhatsApp'}
                  </p>
                  <p>
                    <strong>Statut:</strong> {' '}
                    {getStatusBadge(currentMessage.status)}
                  </p>
                </Col>
              </Row>
              
              <div className="mb-4">
                <h5>Contenu</h5>
                <Card>
                  <Card.Body>
                    <pre style={{ whiteSpace: 'pre-wrap' }}>{currentMessage.content}</pre>
                  </Card.Body>
                </Card>
              </div>
              
              {messageResponses.length > 0 && (
                <div>
                  <h5>Réponses</h5>
                  <ListTransition
                    items={messageResponses}
                    keyExtractor={(response) => response.id}
                    renderItem={(response) => (
                      <Card className="mb-3">
                        <Card.Body>
                          <p className="mb-2"><strong>Date:</strong> {formatDate(response.created_at)}</p>
                          <pre style={{ whiteSpace: 'pre-wrap' }}>{response.content}</pre>
                        </Card.Body>
                      </Card>
                    )}
                  />
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Fermer
          </Button>
          {currentMessage && currentMessage.status !== 'replied' && (
            <Button 
              variant="primary" 
              onClick={() => {
                setShowViewModal(false);
                handleReplyMessage(currentMessage);
              }}
            >
              Répondre
            </Button>
          )}
        </Modal.Footer>
      </Modal>
      
      {/* Modal de réponse au message */}
      <Modal show={showReplyModal} onHide={() => setShowReplyModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Répondre au message</Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={{ content: '', template_id: '' }}
          validationSchema={validationSchema}
          onSubmit={handleSubmitReply}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
            setFieldValue
          }) => (
            <Form onSubmit={handleSubmit}>
              <Modal.Body>
                {currentMessage && (
                  <div className="mb-4 slide-in">
                    <p><strong>Expéditeur:</strong> {currentMessage.sender}</p>
                    <p><strong>Sujet:</strong> {currentMessage.subject || '(Sans objet)'}</p>
                    <p><strong>Message original:</strong></p>
                    <Card className="mb-3">
                      <Card.Body>
                        <pre style={{ whiteSpace: 'pre-wrap' }}>{currentMessage.content}</pre>
                      </Card.Body>
                    </Card>
                  </div>
                )}
                
                {templates.length > 0 && (
                  <Form.Group className="mb-3">
                    <Form.Label>Utiliser un modèle</Form.Label>
                    <Form.Select
                      name="template_id"
                      value={values.template_id}
                      onChange={(e) => {
                        const templateId = e.target.value;
                        setFieldValue('template_id', templateId);
                        
                        if (templateId) {
                          const template = templates.find(t => t.id.toString() === templateId);
                          if (template) {
                            setFieldValue('content', template.content);
                          }
                        }
                      }}
                      onBlur={handleBlur}
                    >
                      <option value="">Sélectionner un modèle</option>
                      {templates.map(template => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                )}
                
                <Form.Group className="mb-3">
                  <Form.Label>Contenu de la réponse</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    name="content"
                    value={values.content}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.content && !!errors.content}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.content}
                  </Form.Control.Feedback>
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowReplyModal(false)}>
                  Annuler
                </Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Envoi...
                    </>
                  ) : (
                    'Envoyer la réponse'
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

export default React.memo(Messages);
