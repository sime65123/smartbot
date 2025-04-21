import React, { useState } from 'react';
import { Form, Button, Card, Alert, Container, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import AuthService from '../../services/AuthService';

const Login = ({ setIsAuthenticated, setUser }) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Schéma de validation
  const validationSchema = Yup.object().shape({
    username: Yup.string().required('Le nom d\'utilisateur est requis'),
    password: Yup.string().required('Le mot de passe est requis')
  });

  // Gérer la soumission du formulaire
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError('');
      setLoading(true);
      
      const userData = await AuthService.login(values.username, values.password);
      
      setIsAuthenticated(true);
      setUser(userData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Erreur de connexion:', error);
      setError(
        error.response?.data?.non_field_errors?.[0] || 
        error.response?.data?.detail || 
        'Erreur lors de la connexion. Veuillez vérifier vos identifiants.'
      );
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
              <h2 className="text-center mb-4">Connexion</h2>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Formik
                initialValues={{ username: '', password: '' }}
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

                    <Button 
                      variant="primary" 
                      type="submit" 
                      className="w-100 mt-3"
                      disabled={isSubmitting || loading}
                    >
                      {loading ? 'Connexion en cours...' : 'Se connecter'}
                    </Button>
                  </Form>
                )}
              </Formik>
            </Card.Body>
          </Card>
          
          <div className="text-center mt-3">
            <p>
              Pas encore de compte ? <Link to="/register">S'inscrire</Link>
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
