import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Table } from 'react-bootstrap';
import { FaPlus, FaTrash, FaEdit, FaSave } from 'react-icons/fa';
import BotService from '../../services/BotService';
import './RulesConfiguration.css';

const RulesConfiguration = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Données des règles et templates
  const [intents, setIntents] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  
  // Formulaire pour nouveau template
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    content: '',
    template_type: 'both',
    is_default: false,
    intent_category: ''
  });
  
  // Chargement initial des données
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setLoadingTemplates(true);
        
        // Charger les intentions et catégories
        try {
          const intentsData = await BotService.getIntents();
          setIntents(Array.isArray(intentsData) ? intentsData : []);
        } catch (intentErr) {
          console.error('Erreur lors du chargement des intentions:', intentErr);
          setIntents([]);
        }
        
        // Charger les templates de réponse
        try {
          const templatesData = await BotService.getResponseTemplates();
          setTemplates(Array.isArray(templatesData) ? templatesData : []);
        } catch (templateErr) {
          console.error('Erreur lors du chargement des templates:', templateErr);
          setTemplates([]);
        }
        
        setLoadingTemplates(false);
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Impossible de charger les données. Veuillez réessayer plus tard.');
        setLoadingTemplates(false);
        setLoading(false);
        setTemplates([]);
        setIntents([]);
      }
    };
    
    fetchData();
  }, []);
  
  // Gestion du formulaire de nouveau template
  const handleTemplateChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewTemplate({
      ...newTemplate,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      
      if (editingTemplate) {
        // Mise à jour d'un template existant
        await BotService.updateResponseTemplate(editingTemplate.id, {
          ...newTemplate
        });
        setSuccess('Le modèle de réponse a été mis à jour avec succès.');
        
        // Rafraîchir la liste des templates
        const updatedTemplates = templates.map(t => 
          t.id === editingTemplate.id ? { ...t, ...newTemplate } : t
        );
        setTemplates(updatedTemplates);
        
        // Réinitialiser le formulaire
        setEditingTemplate(null);
      } else {
        // Création d'un nouveau template
        const createdTemplate = await BotService.createResponseTemplate(newTemplate);
        setSuccess('Le modèle de réponse a été créé avec succès.');
        
        // Ajouter le nouveau template à la liste
        setTemplates([...templates, createdTemplate]);
      }
      
      // Réinitialiser le formulaire
      setNewTemplate({
        name: '',
        content: '',
        template_type: 'both',
        is_default: false,
        intent_category: ''
      });
      
      setSaving(false);
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement du template:', err);
      setError('Impossible d\'enregistrer le modèle de réponse. Veuillez réessayer.');
      setSaving(false);
    }
  };
  
  // Édition d'un template existant
  const handleEdit = (template) => {
    setEditingTemplate(template);
    setNewTemplate({
      name: template.name,
      content: template.content,
      template_type: template.template_type,
      is_default: template.is_default,
      intent_category: template.intent_category ? template.intent_category.id : ''
    });
  };
  
  // Suppression d'un template
  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce modèle de réponse ?')) {
      try {
        await BotService.deleteResponseTemplate(id);
        setTemplates(templates.filter(t => t.id !== id));
        setSuccess('Le modèle de réponse a été supprimé avec succès.');
      } catch (err) {
        console.error('Erreur lors de la suppression du template:', err);
        setError('Impossible de supprimer le modèle de réponse. Veuillez réessayer.');
      }
    }
  };
  
  // Annuler l'édition
  const handleCancel = () => {
    setEditingTemplate(null);
    setNewTemplate({
      name: '',
      content: '',
      template_type: 'both',
      is_default: false,
      intent_category: ''
    });
  };
  
  return (
    <Container className="my-4">
      <h2 className="mb-4">Configuration des règles de réponse automatique</h2>
      
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Chargement des données...</p>
        </div>
      ) : (
        <Row>
          {/* Formulaire de création/édition */}
          <Col md={12} lg={6} className="mb-4">
            <Card>
              <Card.Header as="h5">
                {editingTemplate ? 'Modifier un modèle de réponse' : 'Ajouter un modèle de réponse'}
              </Card.Header>
              <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}
                
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nom du modèle</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={newTemplate.name}
                      onChange={handleTemplateChange}
                      required
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Type de message</Form.Label>
                    <Form.Select
                      name="template_type"
                      value={newTemplate.template_type}
                      onChange={handleTemplateChange}
                      required
                    >
                      <option value="email">Email</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="both">Les deux</option>
                    </Form.Select>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Catégorie d'intention</Form.Label>
                    <Form.Select
                      name="intent_category"
                      value={newTemplate.intent_category}
                      onChange={handleTemplateChange}
                    >
                      <option value="">Aucune (réponse générique)</option>
                      {intents.map(intent => (
                        <option key={intent.id} value={intent.id}>
                          {intent.name} - {intent.description}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Contenu du modèle</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      name="content"
                      value={newTemplate.content}
                      onChange={handleTemplateChange}
                      required
                    />
                    <Form.Text className="text-muted">
                      Vous pouvez utiliser des variables comme {'{nom}'}, {'{date}'} qui seront remplacées automatiquement.
                    </Form.Text>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label="Définir comme modèle par défaut"
                      name="is_default"
                      checked={newTemplate.is_default}
                      onChange={handleTemplateChange}
                    />
                  </Form.Group>
                  
                  <div className="d-flex justify-content-between">
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                          />
                          <span className="ms-2">Enregistrement...</span>
                        </>
                      ) : (
                        <>
                          <FaSave className="me-2" />
                          {editingTemplate ? 'Mettre à jour' : 'Enregistrer'}
                        </>
                      )}
                    </Button>
                    
                    {editingTemplate && (
                      <Button
                        variant="secondary"
                        onClick={handleCancel}
                        disabled={saving}
                      >
                        Annuler
                      </Button>
                    )}
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
          
          {/* Liste des modèles existants */}
          <Col md={12} lg={6}>
            <Card>
              <Card.Header as="h5">Modèles de réponse existants</Card.Header>
              <Card.Body>
                {loadingTemplates ? (
                  <div className="text-center my-3">
                    <Spinner animation="border" variant="primary" size="sm" />
                    <p className="mt-2">Chargement des modèles...</p>
                  </div>
                ) : templates.length === 0 ? (
                  <Alert variant="info">
                    Aucun modèle de réponse n'a été créé. Utilisez le formulaire pour en ajouter.
                  </Alert>
                ) : (
                  <Table responsive striped hover>
                    <thead>
                      <tr>
                        <th>Nom</th>
                        <th>Type</th>
                        <th>Par défaut</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(templates) && templates.map(template => (
                        <tr key={template.id || Math.random()}>
                          <td>{template.name}</td>
                          <td>
                            {template.template_type === 'both' ? 'Email & WhatsApp' : 
                             template.template_type === 'email' ? 'Email' : 'WhatsApp'}
                          </td>
                          <td>{template.is_default ? 'Oui' : 'Non'}</td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
                              onClick={() => handleEdit(template)}
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(template.id)}
                            >
                              <FaTrash />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default RulesConfiguration;
