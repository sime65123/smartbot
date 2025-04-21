import React, { useEffect } from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaRobot, FaEnvelope, FaFileAlt, FaUserCircle, FaUserFriends } from 'react-icons/fa';

const DashboardLayout = ({ children, isAuthenticated }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
  useEffect(() => {
    if (!isAuthenticated) {
      console.log('Utilisateur non authentifié, redirection vers la page de connexion');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  // Si l'utilisateur n'est pas authentifié, ne pas afficher le contenu
  if (!isAuthenticated) {
    return null;
  }
  
  // Déterminer le chemin actif
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <Container fluid>
      <Row>
        {/* Sidebar */}
        <Col md={3} lg={2} className="d-none d-md-block bg-light sidebar">
          <div className="position-sticky pt-3">
            <Nav className="flex-column">
              <Nav.Item>
                <Nav.Link 
                  as={Link} 
                  to="/dashboard" 
                  className={isActive('/dashboard') ? 'active' : ''}
                >
                  <FaHome className="me-2" />
                  Tableau de bord
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link 
                  as={Link} 
                  to="/bot-config" 
                  className={isActive('/bot-config') ? 'active' : ''}
                >
                  <FaRobot className="me-2" />
                  Configuration du Bot
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link 
                  as={Link} 
                  to="/messages" 
                  className={isActive('/messages') ? 'active' : ''}
                >
                  <FaEnvelope className="me-2" />
                  Messages
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link 
                  as={Link} 
                  to="/templates" 
                  className={isActive('/templates') ? 'active' : ''}
                >
                  <FaFileAlt className="me-2" />
                  Modèles de réponse
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link 
                  as={Link} 
                  to="/accounts" 
                  className={isActive('/accounts') ? 'active' : ''}
                >
                  <FaUserFriends className="me-2" />
                  Gestion des comptes
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link 
                  as={Link} 
                  to="/profile" 
                  className={isActive('/profile') ? 'active' : ''}
                >
                  <FaUserCircle className="me-2" />
                  Mon profil
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </div>
        </Col>
        
        {/* Contenu principal */}
        <Col md={9} lg={10} className="ms-sm-auto px-md-4 py-4">
          {children}
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardLayout;
