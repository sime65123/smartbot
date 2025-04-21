import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Modal, Form, Nav, Tab } from 'react-bootstrap';
import { FaEnvelope, FaWhatsapp, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { Formik } from 'formik';
import * as Yup from 'yup';
import AccountService from '../../services/AccountService';

const Accounts = ({ user }) => {
  const [emailAccounts, setEmailAccounts] = useState([]);
  const [whatsappAccounts, setWhatsappAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showWhatsappModal, setShowWhatsappModal] = useState(false);
  const [currentEmailAccount, setCurrentEmailAccount] = useState(null);
  const [currentWhatsappAccount, setCurrentWhatsappAccount] = useState(null);
  const [activeTab, setActiveTab] = useState('email');

  // Schémas de validation
  const emailValidationSchema = Yup.object().shape({
    email_address: Yup.string().email('Adresse email invalide').required('L\'adresse email est requise'),
    password: Yup.string().required('Le mot de passe est requis'),
    smtp_server: Yup.string().required('Le serveur SMTP est requis'),
    smtp_port: Yup.number().required('Le port SMTP est requis').positive('Le port doit être positif'),
    imap_server: Yup.string().required('Le serveur IMAP est requis'),
    imap_port: Yup.number().required('Le port IMAP est requis').positive('Le port doit être positif'),
    is_active: Yup.boolean()
  });

  const whatsappValidationSchema = Yup.object().shape({
    phone_number: Yup.string().required('Le numéro de téléphone est requis'),
    api_key: Yup.string().required('La clé API est requise'),
    api_url: Yup.string().url('URL invalide').required('L\'URL de l\'API est requise'),
    is_active: Yup.boolean()
  });

  // Charger les comptes
  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Récupérer les comptes email
      const emailResponse = await AccountService.getEmailAccounts();
      setEmailAccounts(emailResponse.results || []);
      
      // Récupérer les comptes WhatsApp
      const whatsappResponse = await AccountService.getWhatsAppAccounts();
      setWhatsappAccounts(whatsappResponse.results || []);
    } catch (error) {
      console.error('Erreur lors du chargement des comptes:', error);
      setError('Erreur lors du chargement des comptes. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // Gérer l'ajout d'un nouveau compte email
  const handleAddEmailAccount = () => {
    setCurrentEmailAccount(null);
    setShowEmailModal(true);
  };

  // Gérer la modification d'un compte email existant
  const handleEditEmailAccount = (account) => {
    setCurrentEmailAccount(account);
    setShowEmailModal(true);
  };

  // Gérer la suppression d'un compte email
  const handleDeleteEmailAccount = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce compte email ?')) {
      try {
        setLoading(true);
        
        await AccountService.deleteEmailAccount(id);
        
        setSuccess('Compte email supprimé avec succès');
        fetchAccounts();
      } catch (error) {
        console.error('Erreur lors de la suppression du compte email:', error);
        setError('Erreur lors de la suppression du compte email. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Gérer l'ajout d'un nouveau compte WhatsApp
  const handleAddWhatsappAccount = () => {
    setCurrentWhatsappAccount(null);
    setShowWhatsappModal(true);
  };

  // Gérer la modification d'un compte WhatsApp existant
  const handleEditWhatsappAccount = (account) => {
    setCurrentWhatsappAccount(account);
    setShowWhatsappModal(true);
  };

  // Gérer la suppression d'un compte WhatsApp
  const handleDeleteWhatsappAccount = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce compte WhatsApp ?')) {
      try {
        setLoading(true);
        
        await AccountService.deleteWhatsAppAccount(id);
        
        setSuccess('Compte WhatsApp supprimé avec succès');
        fetchAccounts();
      } catch (error) {
        console.error('Erreur lors de la suppression du compte WhatsApp:', error);
        setError('Erreur lors de la suppression du compte WhatsApp. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Gérer la soumission du formulaire de compte email
  const handleSubmitEmailAccount = async (values, { setSubmitting, resetForm }) => {
    try {
      setError('');
      setSuccess('');
      
      if (currentEmailAccount) {
        // Mettre à jour un compte email existant
        await AccountService.updateEmailAccount(currentEmailAccount.id, values);
        setSuccess('Compte email mis à jour avec succès');
      } else {
        // Créer un nouveau compte email
        await AccountService.createEmailAccount(values);
        setSuccess('Compte email créé avec succès');
      }
      
      // Fermer le modal et rafraîchir les données
      setShowEmailModal(false);
      resetForm();
      fetchAccounts();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du compte email:', error);
      setError('Erreur lors de l\'enregistrement du compte email. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  // Gérer la soumission du formulaire de compte WhatsApp
  const handleSubmitWhatsappAccount = async (values, { setSubmitting, resetForm }) => {
    try {
      setError('');
      setSuccess('');
      
      if (currentWhatsappAccount) {
        // Mettre à jour un compte WhatsApp existant
        await AccountService.updateWhatsAppAccount(currentWhatsappAccount.id, values);
        setSuccess('Compte WhatsApp mis à jour avec succès');
      } else {
        // Créer un nouveau compte WhatsApp
        await AccountService.createWhatsAppAccount(values);
        setSuccess('Compte WhatsApp créé avec succès');
      }
      
      // Fermer le modal et rafraîchir les données
      setShowWhatsappModal(false);
      resetForm();
      fetchAccounts();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du compte WhatsApp:', error);
      setError('Erreur lors de l\'enregistrement du compte WhatsApp. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container>
      <h1 className="mb-4">Gestion des comptes</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Tab.Container id="account-tabs" activeKey={activeTab} onSelect={setActiveTab}>
        <Nav variant="tabs" className="mb-4">
          <Nav.Item>
            <Nav.Link eventKey="email">
              <FaEnvelope className="me-2" />
              Comptes Email
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="whatsapp">
              <FaWhatsapp className="me-2" />
              Comptes WhatsApp
            </Nav.Link>
          </Nav.Item>
        </Nav>
        
        <Tab.Content>
          <Tab.Pane eventKey="email">
            <div className="d-flex justify-content-end mb-3">
              <Button variant="primary" onClick={handleAddEmailAccount}>
                <FaPlus className="me-2" />
                Ajouter un compte email
              </Button>
            </div>
            
            {loading && emailAccounts.length === 0 ? (
              <div className="text-center my-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Chargement des comptes email...</p>
              </div>
            ) : emailAccounts.length > 0 ? (
              <Row>
                {emailAccounts.map(account => (
                  <Col md={6} lg={4} key={account.id} className="mb-4">
                    <Card className="h-100 shadow-sm">
                      <Card.Header className="d-flex justify-content-between align-items-center">
                        <span>
                          <FaEnvelope className="me-2" />
                          {account.email_address}
                        </span>
                        {account.is_active ? (
                          <span className="badge bg-success">Actif</span>
                        ) : (
                          <span className="badge bg-secondary">Inactif</span>
                        )}
                      </Card.Header>
                      <Card.Body>
                        <p><strong>SMTP:</strong> {account.smtp_server}:{account.smtp_port}</p>
                        <p><strong>IMAP:</strong> {account.imap_server}:{account.imap_port}</p>
                        <div className="text-muted small">
                          <strong>Créé le:</strong> {new Date(account.created_at).toLocaleDateString()}
                        </div>
                      </Card.Body>
                      <Card.Footer className="d-flex justify-content-between">
                        <Button variant="outline-primary" size="sm" onClick={() => handleEditEmailAccount(account)}>
                          <FaEdit className="me-1" /> Modifier
                        </Button>
                        <Button variant="outline-danger" size="sm" onClick={() => handleDeleteEmailAccount(account.id)}>
                          <FaTrash className="me-1" /> Supprimer
                        </Button>
                      </Card.Footer>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Alert variant="info">
                Aucun compte email trouvé. Cliquez sur "Ajouter un compte email" pour commencer.
              </Alert>
            )}
          </Tab.Pane>
          
          <Tab.Pane eventKey="whatsapp">
            <div className="d-flex justify-content-end mb-3">
              <Button variant="success" onClick={handleAddWhatsappAccount}>
                <FaPlus className="me-2" />
                Ajouter un compte WhatsApp
              </Button>
            </div>
            
            {loading && whatsappAccounts.length === 0 ? (
              <div className="text-center my-5">
                <Spinner animation="border" variant="success" />
                <p className="mt-2">Chargement des comptes WhatsApp...</p>
              </div>
            ) : whatsappAccounts.length > 0 ? (
              <Row>
                {whatsappAccounts.map(account => (
                  <Col md={6} lg={4} key={account.id} className="mb-4">
                    <Card className="h-100 shadow-sm">
                      <Card.Header className="d-flex justify-content-between align-items-center">
                        <span>
                          <FaWhatsapp className="me-2" />
                          {account.phone_number}
                        </span>
                        {account.is_active ? (
                          <span className="badge bg-success">Actif</span>
                        ) : (
                          <span className="badge bg-secondary">Inactif</span>
                        )}
                      </Card.Header>
                      <Card.Body>
                        <p><strong>API URL:</strong> {account.api_url}</p>
                        <p><strong>API Key:</strong> {account.api_key.substring(0, 8)}...</p>
                        <div className="text-muted small">
                          <strong>Créé le:</strong> {new Date(account.created_at).toLocaleDateString()}
                        </div>
                      </Card.Body>
                      <Card.Footer className="d-flex justify-content-between">
                        <Button variant="outline-success" size="sm" onClick={() => handleEditWhatsappAccount(account)}>
                          <FaEdit className="me-1" /> Modifier
                        </Button>
                        <Button variant="outline-danger" size="sm" onClick={() => handleDeleteWhatsappAccount(account.id)}>
                          <FaTrash className="me-1" /> Supprimer
                        </Button>
                      </Card.Footer>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Alert variant="info">
                Aucun compte WhatsApp trouvé. Cliquez sur "Ajouter un compte WhatsApp" pour commencer.
              </Alert>
            )}
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
      
      {/* Modal pour ajouter/modifier un compte email */}
      <Modal show={showEmailModal} onHide={() => setShowEmailModal(false)} backdrop="static" keyboard={false} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {currentEmailAccount ? 'Modifier le compte email' : 'Ajouter un compte email'}
          </Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={{
            email_address: currentEmailAccount?.email_address || '',
            password: currentEmailAccount?.password || '',
            smtp_server: currentEmailAccount?.smtp_server || '',
            smtp_port: currentEmailAccount?.smtp_port || 587,
            imap_server: currentEmailAccount?.imap_server || '',
            imap_port: currentEmailAccount?.imap_port || 993,
            is_active: currentEmailAccount?.is_active ?? true
          }}
          validationSchema={emailValidationSchema}
          onSubmit={handleSubmitEmailAccount}
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
                  <Form.Label>Adresse email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email_address"
                    value={values.email_address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.email_address && errors.email_address}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email_address}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Mot de passe</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.password && errors.password}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.password}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Serveur SMTP</Form.Label>
                      <Form.Control
                        type="text"
                        name="smtp_server"
                        value={values.smtp_server}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.smtp_server && errors.smtp_server}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.smtp_server}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Port SMTP</Form.Label>
                      <Form.Control
                        type="number"
                        name="smtp_port"
                        value={values.smtp_port}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.smtp_port && errors.smtp_port}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.smtp_port}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Serveur IMAP</Form.Label>
                      <Form.Control
                        type="text"
                        name="imap_server"
                        value={values.imap_server}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.imap_server && errors.imap_server}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.imap_server}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Port IMAP</Form.Label>
                      <Form.Control
                        type="number"
                        name="imap_port"
                        value={values.imap_port}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.imap_port && errors.imap_port}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.imap_port}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="is_active"
                    name="is_active"
                    label="Compte actif"
                    checked={values.is_active}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowEmailModal(false)}>
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
      
      {/* Modal pour ajouter/modifier un compte WhatsApp */}
      <Modal show={showWhatsappModal} onHide={() => setShowWhatsappModal(false)} backdrop="static" keyboard={false} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {currentWhatsappAccount ? 'Modifier le compte WhatsApp' : 'Ajouter un compte WhatsApp'}
          </Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={{
            phone_number: currentWhatsappAccount?.phone_number || '',
            api_key: currentWhatsappAccount?.api_key || '',
            api_url: currentWhatsappAccount?.api_url || '',
            is_active: currentWhatsappAccount?.is_active ?? true
          }}
          validationSchema={whatsappValidationSchema}
          onSubmit={handleSubmitWhatsappAccount}
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
                  <Form.Label>Numéro de téléphone</Form.Label>
                  <Form.Control
                    type="text"
                    name="phone_number"
                    value={values.phone_number}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.phone_number && errors.phone_number}
                  />
                  <Form.Text className="text-muted">
                    Format international, ex: +33612345678
                  </Form.Text>
                  <Form.Control.Feedback type="invalid">
                    {errors.phone_number}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>URL de l'API</Form.Label>
                  <Form.Control
                    type="text"
                    name="api_url"
                    value={values.api_url}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.api_url && errors.api_url}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.api_url}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Clé API</Form.Label>
                  <Form.Control
                    type="password"
                    name="api_key"
                    value={values.api_key}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.api_key && errors.api_key}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.api_key}
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Check
                    type="switch"
                    id="whatsapp_is_active"
                    name="is_active"
                    label="Compte actif"
                    checked={values.is_active}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowWhatsappModal(false)}>
                  Annuler
                </Button>
                <Button variant="success" type="submit" disabled={isSubmitting}>
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

export default Accounts;
