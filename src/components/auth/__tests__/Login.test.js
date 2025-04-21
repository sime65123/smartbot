import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Login';
import AuthService from '../../../services/AuthService';

// Mock du service d'authentification
jest.mock('../../../services/AuthService', () => ({
  login: jest.fn()
}));

// Mock de la fonction de navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('Login Component', () => {
  const mockSetIsAuthenticated = jest.fn();
  const mockSetUser = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form correctly', () => {
    render(
      <BrowserRouter>
        <Login setIsAuthenticated={mockSetIsAuthenticated} setUser={mockSetUser} />
      </BrowserRouter>
    );

    expect(screen.getByText(/Connexion/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nom d'utilisateur/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Se connecter/i })).toBeInTheDocument();
  });

  test('handles form submission correctly with valid data', async () => {
    const mockUser = { id: 1, username: 'testuser', token: 'test-token' };
    AuthService.login.mockResolvedValueOnce(mockUser);

    render(
      <BrowserRouter>
        <Login setIsAuthenticated={mockSetIsAuthenticated} setUser={mockSetUser} />
      </BrowserRouter>
    );

    // Remplir le formulaire
    fireEvent.change(screen.getByLabelText(/Nom d'utilisateur/i), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), {
      target: { value: 'password123' }
    });

    // Soumettre le formulaire
    fireEvent.click(screen.getByRole('button', { name: /Se connecter/i }));

    // Vérifier que le service a été appelé avec les bonnes valeurs
    await waitFor(() => {
      expect(AuthService.login).toHaveBeenCalledWith('testuser', 'password123');
      expect(mockSetIsAuthenticated).toHaveBeenCalledWith(true);
      expect(mockSetUser).toHaveBeenCalledWith(mockUser);
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('displays error message on login failure', async () => {
    const errorMessage = 'Identifiants invalides';
    AuthService.login.mockRejectedValueOnce({
      response: { data: { detail: errorMessage } }
    });

    render(
      <BrowserRouter>
        <Login setIsAuthenticated={mockSetIsAuthenticated} setUser={mockSetUser} />
      </BrowserRouter>
    );

    // Remplir le formulaire
    fireEvent.change(screen.getByLabelText(/Nom d'utilisateur/i), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), {
      target: { value: 'wrongpassword' }
    });

    // Soumettre le formulaire
    fireEvent.click(screen.getByRole('button', { name: /Se connecter/i }));

    // Vérifier que le message d'erreur s'affiche
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(mockSetIsAuthenticated).not.toHaveBeenCalled();
      expect(mockSetUser).not.toHaveBeenCalled();
    });
  });
});
