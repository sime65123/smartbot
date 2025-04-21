import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import BotConfig from './components/dashboard/BotConfig';
import Messages from './components/dashboard/Messages';
import Templates from './components/dashboard/Templates';
import Accounts from './components/dashboard/Accounts';
import Profile from './components/dashboard/Profile';
import RulesConfiguration from './components/bot/RulesConfiguration';
import Navigation from './components/layout/Navigation';
import Footer from './components/layout/Footer';
import DashboardLayout from './components/layout/DashboardLayout';
import AuthService from './services/AuthService';
import PageTransition from './components/common/PageTransition';
import './App.css';
import './styles/animations.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const checkAuth = () => {
      const currentUser = AuthService.checkAuth();
      if (currentUser) {
        setIsAuthenticated(true);
        setUser(currentUser);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary spin" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navigation isAuthenticated={isAuthenticated} user={user} setIsAuthenticated={setIsAuthenticated} />
      
      <main className="flex-grow-1">
        <Container fluid className="pb-5">
          <Routes location={location}>
            <Route path="/" element={
              <PageTransition>
                <div className="text-center my-5">
                  <h1 className="display-4 mb-4">Bienvenue sur SmartBot</h1>
                  <p className="lead">Votre assistant intelligent pour la gestion des emails et messages WhatsApp</p>
                  {!isAuthenticated && (
                    <div className="mt-4">
                      <a href="/login" className="btn btn-primary me-3 btn-bounce">Se connecter</a>
                      <a href="/register" className="btn btn-outline-primary btn-bounce">S'inscrire</a>
                    </div>
                  )}
                </div>
              </PageTransition>
            } />
            
            <Route path="/login" element={
              <PageTransition>
                <Login setIsAuthenticated={setIsAuthenticated} setUser={setUser} />
              </PageTransition>
            } />
            
            <Route path="/register" element={
              <PageTransition>
                <Register setIsAuthenticated={setIsAuthenticated} setUser={setUser} />
              </PageTransition>
            } />
            
            <Route path="/dashboard" element={
              <DashboardLayout isAuthenticated={isAuthenticated}>
                <PageTransition>
                  <Dashboard user={user} />
                </PageTransition>
              </DashboardLayout>
            } />
            
            <Route path="/bot-config" element={
              <DashboardLayout isAuthenticated={isAuthenticated}>
                <PageTransition>
                  <BotConfig user={user} />
                </PageTransition>
              </DashboardLayout>
            } />
            
            <Route path="/messages" element={
              <DashboardLayout isAuthenticated={isAuthenticated}>
                <PageTransition>
                  <Messages user={user} />
                </PageTransition>
              </DashboardLayout>
            } />
            
            <Route path="/templates" element={
              <DashboardLayout isAuthenticated={isAuthenticated}>
                <PageTransition>
                  <Templates user={user} />
                </PageTransition>
              </DashboardLayout>
            } />
            
            <Route path="/accounts" element={
              <DashboardLayout isAuthenticated={isAuthenticated}>
                <PageTransition>
                  <Accounts user={user} />
                </PageTransition>
              </DashboardLayout>
            } />
            
            <Route path="/profile" element={
              <DashboardLayout isAuthenticated={isAuthenticated}>
                <PageTransition>
                  <Profile user={user} setUser={setUser} />
                </PageTransition>
              </DashboardLayout>
            } />
            
            <Route path="/rules-config" element={
              <DashboardLayout isAuthenticated={isAuthenticated}>
                <PageTransition>
                  <RulesConfiguration user={user} />
                </PageTransition>
              </DashboardLayout>
            } />
          </Routes>
        </Container>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;
