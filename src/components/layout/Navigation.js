import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaRobot, FaFileAlt, FaUserCircle, FaSignOutAlt, FaHome, FaCogs } from 'react-icons/fa';
import AuthService from '../../services/AuthService';

const Navigation = ({ isAuthenticated, user, setIsAuthenticated, setUser }) => {
  const navigate = useNavigate();

  // Gérer la déconnexion
  const handleLogout = async () => {
    try {
      await AuthService.logout();
      setIsAuthenticated(false);
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" sticky="top" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <FaRobot className="me-2" />
          SmartBot
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          {isAuthenticated ? (
            <>
              <Nav className="me-auto">
                <Nav.Link as={Link} to="/dashboard">
                  <FaHome className="me-1" /> Tableau de bord
                </Nav.Link>
                <Nav.Link as={Link} to="/messages">
                  <FaEnvelope className="me-1" /> Messages
                </Nav.Link>
                <Nav.Link as={Link} to="/templates">
                  <FaFileAlt className="me-1" /> Modèles
                </Nav.Link>
                <NavDropdown title="Paramètres" id="basic-nav-dropdown">
                  <NavDropdown.Item as={Link} to="/bot-config">Configuration du Bot</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/rules-config"><FaCogs className="me-1" /> Règles de réponse</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/accounts">Gestion des comptes</NavDropdown.Item>
                </NavDropdown>
              </Nav>
              <Nav>
                <NavDropdown 
                  title={
                    <span>
                      <FaUserCircle className="me-1" />
                      {user?.username || 'Utilisateur'}
                    </span>
                  } 
                  id="user-dropdown"
                  align="end"
                >
                  <NavDropdown.Item as={Link} to="/profile">Mon profil</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    <FaSignOutAlt className="me-1" /> Déconnexion
                  </NavDropdown.Item>
                </NavDropdown>
              </Nav>
            </>
          ) : (
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/login">Connexion</Nav.Link>
              <Nav.Link as={Link} to="/register">Inscription</Nav.Link>
            </Nav>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
