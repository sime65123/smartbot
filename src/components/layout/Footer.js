import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaEnvelope, FaGithub, FaLinkedin } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <Container>
        <Row className="align-items-center">
          <Col md={4} className="text-center text-md-start">
            <h5 className="footer-brand">SmartBot</h5>
            <p className="footer-text mb-0">
              Une solution intelligente pour la gestion automatisée de vos messages.
            </p>
          </Col>
          <Col md={4} className="text-center my-2 my-md-0">
            <p className="mb-0">
              &copy; {currentYear} SmartBot. Tous droits réservés.
            </p>
          </Col>
          <Col md={4} className="text-center text-md-end">
            <div className="social-links">
              <a href="#" aria-label="Email">
                <FaEnvelope size={18} />
              </a>
              <a href="#" aria-label="GitHub">
                <FaGithub size={18} />
              </a>
              <a href="#" aria-label="LinkedIn">
                <FaLinkedin size={18} />
              </a>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
