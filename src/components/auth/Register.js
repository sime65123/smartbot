import React, { useState } from 'react';
import { Form, Button, Card, Alert, Container, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import AuthService from '../../services/AuthService';

const Register = ({ setIsAuthenticated, setUser }) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Schéma de validation
  const validationSchema = Yup.object().shape({
    username: Yup.string()
      .required('Le nom d\'utilisateur est requis')
      .min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères')
      .max(30, 'Le nom d\'utilisateur ne doit pas dépasser 30 caractères'),
    email: Yup.string()
      .email('Adresse email invalide')
      .required('L\'adresse email est requise'),
    password: Yup.string()
      .required('Le mot de passe est requis')
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Les mots de passe doivent correspondre')
      .required('La confirmation du mot de passe est requise'),
    firstName: Yup.string(),
    lastName: Yup.string()
  });

  // Gérer la soumission du formulaire
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError('');
      setLoading(true);
      
      console.log('Tentative d\'inscription avec:', {
        username: values.username,
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName
      });
      
      await AuthService.register(
        values.username, 
        values.email, 
        values.password,
        values.firstName || '',
        values.lastName || ''
      );
      
      console.log('Inscription réussie, tentative de connexion...');
      
      // Connexion automatique après l'inscription
      try {
        const userData = await AuthService.login(values.username, values.password);
        setIsAuthenticated(true);
        setUser(userData);
        navigate('/dashboard');
      } catch (loginError) {
        console.error('Erreur lors de la connexion automatique:', loginError);
        // Rediriger vers la page de connexion en cas d'échec de la connexion automatique
        setError('Inscription réussie mais la connexion automatique a échoué. Veuillez vous connecter manuellement.');
        setTimeout(() => navigate('/login'), 3000);
      }
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      
      // Gestion des erreurs spécifiques du backend
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        
        if (errorData.username) {
          setError(`Nom d'utilisateur: ${errorData.username[0]}`);
        } else if (errorData.email) {
          setError(`Email: ${errorData.email[0]}`);
        } else if (errorData.password) {
          setError(`Mot de passe: ${errorData.password[0]}`);
        } else if (errorData.error) {
          setError(`Erreur: ${errorData.error}`);
        } else {
          setError('Erreur lors de l\'inscription. Veuillez réessayer.');
        }
      } else {
        setError('Erreur lors de l\'inscription. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-5 mt-4">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow">
            <Card.Body>
              <h2 className="text-center mb-4">Inscription</h2>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Formik
                initialValues={{ 
                  username: '', 
                  email: '', 
                  password: '', 
                  confirmPassword: '',
                  firstName: '',
                  lastName: ''
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
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

                    <Form.Group className="mb-3">
                      <Form.Label>Prénom</Form.Label>
                      <Form.Control
                        type="text"
                        name="firstName"
                        value={values.firstName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.firstName && errors.firstName}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.firstName}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Nom</Form.Label>
                      <Form.Control
                        type="text"
                        name="lastName"
                        value={values.lastName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.lastName && errors.lastName}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.lastName}
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

                    <Form.Group className="mb-3">
                      <Form.Label>Confirmer le mot de passe</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        value={values.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.confirmPassword && errors.confirmPassword}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.confirmPassword}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Button 
                      variant="primary" 
                      type="submit" 
                      className="w-100 mt-3"
                      disabled={isSubmitting || loading}
                    >
                      {loading ? 'Inscription en cours...' : 'S\'inscrire'}
                    </Button>
                  </Form>
                )}
              </Formik>
            </Card.Body>
          </Card>
          
          <div className="text-center mt-3">
            <p>
              Déjà inscrit ? <Link to="/login">Se connecter</Link>
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
