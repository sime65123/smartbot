import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import AuthService from '../../services/AuthService';

const Profile = ({ user, setUser }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');

  // Charger les données du profil utilisateur au chargement du composant
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setProfileLoading(true);
        setProfileError('');
        
        console.log('Tentative de récupération du profil utilisateur...');
        
        // Récupérer les informations complètes du profil utilisateur
        const updatedUser = await AuthService.fetchUserProfile();
        console.log('Profil utilisateur récupéré:', updatedUser);
        
        // Vérifier si les données du profil sont complètes
        if (!updatedUser.username || !updatedUser.email) {
          console.error('Données du profil incomplètes:', updatedUser);
          setProfileError('Les données du profil sont incomplètes. Veuillez vous reconnecter.');
        } else {
          setUser(updatedUser);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
        setProfileError(error.message || 'Impossible de charger les informations du profil. Veuillez réessayer.');
      } finally {
        setProfileLoading(false);
      }
    };
    
    fetchProfileData();
  }, [setUser]);
  
  // Schéma de validation pour le profil
  const profileValidationSchema = Yup.object().shape({
    username: Yup.string()
      .required('Le nom d\'utilisateur est requis')
      .min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères'),
    email: Yup.string()
      .email('Adresse email invalide')
      .required('L\'adresse email est requise'),
    first_name: Yup.string(),
    last_name: Yup.string()
  });

  // Schéma de validation pour le changement de mot de passe
  const passwordValidationSchema = Yup.object().shape({
    old_password: Yup.string()
      .required('Le mot de passe actuel est requis'),
    new_password: Yup.string()
      .required('Le nouveau mot de passe est requis')
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    confirm_password: Yup.string()
      .oneOf([Yup.ref('new_password'), null], 'Les mots de passe doivent correspondre')
      .required('La confirmation du mot de passe est requise')
  });

  // Gérer la soumission du formulaire de profil
  const handleProfileSubmit = async (values, { setSubmitting }) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const updatedUser = await AuthService.updateProfile(values);
      
      setUser(updatedUser);
      setSuccess('Profil mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        let errorMessage = 'Erreur lors de la mise à jour du profil.';
        
        if (errorData.username) {
          errorMessage = `Nom d'utilisateur: ${errorData.username[0]}`;
        } else if (errorData.email) {
          errorMessage = `Email: ${errorData.email[0]}`;
        }
        
        setError(errorMessage);
      } else {
        setError('Erreur lors de la mise à jour du profil. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  // Gérer la soumission du formulaire de changement de mot de passe
  const handlePasswordSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setLoading(true);
      setPasswordError('');
      setPasswordSuccess('');
      
      console.log('Soumission du formulaire de changement de mot de passe...', values);
      
      await AuthService.changePassword(
        values.old_password,
        values.new_password
      );
      
      setPasswordSuccess('Mot de passe changé avec succès');
      resetForm();
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        let errorMessage = 'Erreur lors du changement de mot de passe.';
        
        // Vérifier les différents champs d'erreur possibles
        if (errorData.old_password) {
          errorMessage = `Mot de passe actuel: ${errorData.old_password[0]}`;
        } else if (errorData.new_password) {
          errorMessage = `Nouveau mot de passe: ${errorData.new_password[0]}`;
        } else if (errorData.new_password2) {
          errorMessage = `Confirmation du mot de passe: ${errorData.new_password2[0]}`;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        }
        
        setPasswordError(errorMessage);
      } else {
        setPasswordError('Erreur lors du changement de mot de passe. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <Container>
      <h1 className="mb-4">Profil utilisateur</h1>
      
      <Row>
        <Col md={6}>
          <Card className="shadow-sm mb-4">
            <Card.Header>
              <h5 className="mb-0">Informations personnelles</h5>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              
              {profileLoading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2">Chargement des informations du profil...</p>
                </div>
              ) : profileError ? (
                <Alert variant="danger">{profileError}</Alert>
              ) : (
                <Formik
                  initialValues={{
                    username: user?.username || '',
                    email: user?.email || '',
                    first_name: user?.first_name || '',
                    last_name: user?.last_name || ''
                  }}
                  validationSchema={profileValidationSchema}
                  onSubmit={handleProfileSubmit}
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
                      <Form.Group className="mb-3">
                        <Form.Label>Nom d'utilisateur</Form.Label>
                        <Form.Control
                          type="text"
                          name="username"
                          value={values.username}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.username && errors.username}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.username}
                        </Form.Control.Feedback>
                      </Form.Group>
                      
                      <Form.Group className="mb-3">
                        <Form.Label>Adresse email</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={values.email}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.email && errors.email}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.email}
                        </Form.Control.Feedback>
                      </Form.Group>
                      
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Prénom</Form.Label>
                            <Form.Control
                              type="text"
                              name="first_name"
                              value={values.first_name}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              isInvalid={touched.first_name && errors.first_name}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.first_name}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Nom</Form.Label>
                            <Form.Control
                              type="text"
                              name="last_name"
                              value={values.last_name}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              isInvalid={touched.last_name && errors.last_name}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.last_name}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                      </Row>
                      
                      <Button 
                        variant="primary" 
                        type="submit" 
                        className="w-100 mt-3"
                        disabled={isSubmitting || loading}
                      >
                        {loading ? (
                          <>
                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                            Mise à jour...
                          </>
                        ) : (
                          'Mettre à jour le profil'
                        )}
                      </Button>
                    </Form>
                  )}
                </Formik>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card className="shadow-sm mb-4">
            <Card.Header>
              <h5 className="mb-0">Changer le mot de passe</h5>
            </Card.Header>
            <Card.Body>
              {passwordError && <Alert variant="danger">{passwordError}</Alert>}
              {passwordSuccess && <Alert variant="success">{passwordSuccess}</Alert>}
              
              <Formik
                initialValues={{
                  old_password: '',
                  new_password: '',
                  confirm_password: ''
                }}
                validationSchema={passwordValidationSchema}
                onSubmit={handlePasswordSubmit}
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
                    <Form.Group className="mb-3">
                      <Form.Label>Mot de passe actuel</Form.Label>
                      <Form.Control
                        type="password"
                        name="old_password"
                        value={values.old_password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.old_password && errors.old_password}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.old_password}
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Nouveau mot de passe</Form.Label>
                      <Form.Control
                        type="password"
                        name="new_password"
                        value={values.new_password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.new_password && errors.new_password}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.new_password}
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Confirmer le nouveau mot de passe</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirm_password"
                        value={values.confirm_password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.confirm_password && errors.confirm_password}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.confirm_password}
                      </Form.Control.Feedback>
                    </Form.Group>
                    
                    <Button 
                      variant="primary" 
                      type="submit" 
                      className="w-100 mt-3"
                      disabled={isSubmitting || loading}
                    >
                      {loading ? (
                        <>
                          <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                          Changement...
                        </>
                      ) : (
                        'Changer le mot de passe'
                      )}
                    </Button>
                  </Form>
                )}
              </Formik>
            </Card.Body>
          </Card>
          
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Informations du compte</h5>
            </Card.Header>
            <Card.Body>
              {profileLoading ? (
                <div className="text-center py-2">
                  <Spinner animation="border" size="sm" variant="primary" />
                  <p className="mt-2">Chargement des informations...</p>
                </div>
              ) : (
                <>
                  <p><strong>Date d'inscription:</strong> {user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'Non disponible'}</p>
                  <p><strong>Dernière connexion:</strong> {user?.last_login ? new Date(user.last_login).toLocaleDateString() : 'Non disponible'}</p>
                  <p className="text-muted small">ID: {user?.id || 'Non disponible'}</p>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
