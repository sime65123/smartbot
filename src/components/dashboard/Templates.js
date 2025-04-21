import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Modal, Form, Badge } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import BotService from '../../services/BotService';

const Templates = ({ user }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(null);

  // Schéma de validation
  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Le nom est requis'),
    content: Yup.string().required('Le contenu est requis'),
    category: Yup.string().required('La catégorie est requise'),
    is_active: Yup.boolean()
  });

  // Charger les modèles
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await BotService.getResponseTemplates();
      setTemplates(response.results || []);
    } catch (error) {
      console.error('Erreur lors du chargement des modèles:', error);
      setError('Erreur lors du chargement des modèles. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // Gérer l'ajout d'un nouveau modèle
  const handleAddTemplate = () => {
    setCurrentTemplate(null);
    setShowModal(true);
  };

  // Gérer la modification d'un modèle existant
  const handleEditTemplate = (template) => {
    setCurrentTemplate(template);
    setShowModal(true);
  };

  // Gérer la suppression d'un modèle
  const handleDeleteTemplate = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce modèle ?')) {
      try {
        setLoading(true);
        
        await BotService.deleteResponseTemplate(id);
        
        setSuccess('Modèle supprimé avec succès');
        fetchTemplates();
      } catch (error) {
        console.error('Erreur lors de la suppression du modèle:', error);
        setError('Erreur lors de la suppression du modèle. Veuillez réessayer.');
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
      
      if (currentTemplate) {
        // Mettre à jour un modèle existant
        await BotService.updateResponseTemplate(currentTemplate.id, values);
        setSuccess('Modèle mis à jour avec succès');
      } else {
        // Créer un nouveau modèle
        await BotService.createResponseTemplate(values);
        setSuccess('Modèle créé avec succès');
      }
      
      // Fermer le modal et rafraîchir les données
      setShowModal(false);
      resetForm();
      fetchTemplates();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du modèle:', error);
      setError('Erreur lors de l\'enregistrement du modèle. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  // Fonction pour obtenir les catégories uniques
  const getUniqueCategories = () => {
    const categories = templates.map(template => template.category);
    return [...new Set(categories)];
  };

  // Fonction pour regrouper les modèles par catégorie
  const getTemplatesByCategory = () => {
    const categories = getUniqueCategories();
    const templatesByCategory = {};
    
    categories.forEach(category => {
      templatesByCategory[category] = templates.filter(template => template.category === category);
    });
    
    return templatesByCategory;
  };

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Modèles de réponse</h1>
        <Button variant="primary" onClick={handleAddTemplate}>
          Ajouter un modèle
        </Button>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      {loading && templates.length === 0 ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Chargement des modèles...</p>
        </div>
      ) : templates.length > 0 ? (
        Object.entries(getTemplatesByCategory()).map(([category, categoryTemplates]) => (
          <div key={category} className="mb-4">
            <h3 className="mb-3">{category}</h3>
            <Row>
              {categoryTemplates.map(template => (
                <Col md={6} lg={4} key={template.id} className="mb-4">
                  <Card className="h-100 shadow-sm">
                    <Card.Header className="d-flex justify-content-between align-items-center">
                      <span>{template.name}</span>
                      {template.is_active ? (
                        <Badge bg="success">Actif</Badge>
                      ) : (
                        <Badge bg="secondary">Inactif</Badge>
                      )}
                    </Card.Header>
                    <Card.Body>
                      <div className="template-content mb-3" style={{ maxHeight: '150px', overflow: 'auto' }}>
                        <div style={{ whiteSpace: 'pre-wrap' }}>
                          {template.content}
                        </div>
                      </div>
                      <div className="text-muted small">
                        <strong>Créé le:</strong> {new Date(template.created_at).toLocaleDateString()}
                      </div>
                    </Card.Body>
                    <Card.Footer className="d-flex justify-content-between">
                      <Button variant="outline-primary" size="sm" onClick={() => handleEditTemplate(template)}>
                        Modifier
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDeleteTemplate(template.id)}>
                        Supprimer
                      </Button>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        ))
      ) : (
        <Alert variant="info">
          Aucun modèle trouvé. Cliquez sur "Ajouter un modèle" pour commencer.
        </Alert>
      )}
      
      {/* Modal pour ajouter/modifier un modèle */}
      <Modal show={showModal} onHide={() => setShowModal(false)} backdrop="static" keyboard={false} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {currentTemplate ? 'Modifier le modèle' : 'Ajouter un modèle'}
          </Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={{
            name: currentTemplate?.name || '',
            content: currentTemplate?.content || '',
            category: currentTemplate?.category || '',
            is_active: currentTemplate?.is_active ?? true
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
                  <Form.Label>Nom du modèle</Form.Label>
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
                  <Form.Label>Catégorie</Form.Label>
                  <Form.Control
                    type="text"
                    name="category"
                    value={values.category}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.category && errors.category}
                    list="categories"
                  />
                  <datalist id="categories">
                    {getUniqueCategories().map((category, index) => (
                      <option key={index} value={category} />
                    ))}
                  </datalist>
                  <Form.Text className="text-muted">
                    Vous pouvez sélectionner une catégorie existante ou en créer une nouvelle.
                  </Form.Text>
                  <Form.Control.Feedback type="invalid">
                    {errors.category}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Contenu du modèle</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={8}
                    name="content"
                    value={values.content}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.content && errors.content}
                  />
                  <Form.Text className="text-muted">
                    Vous pouvez utiliser les variables suivantes: {'{nom}'}, {'{date}'}, {'{sujet}'}, etc.
                  </Form.Text>
                  <Form.Control.Feedback type="invalid">
                    {errors.content}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="is_active"
                    name="is_active"
                    label="Modèle actif"
                    checked={values.is_active}
                    onChange={handleChange}
                  />
                </Form.Group>
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

export default Templates;
