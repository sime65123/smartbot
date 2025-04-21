import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BotConfig from '../BotConfig';
import BotService from '../../../services/BotService';

// Mock du service
jest.mock('../../../services/BotService', () => ({
  getBotConfigurations: jest.fn(),
  createBotConfiguration: jest.fn(),
  updateBotConfiguration: jest.fn(),
  deleteBotConfiguration: jest.fn()
}));

describe('BotConfig Component', () => {
  const mockUser = { id: 1, username: 'testuser' };
  const mockConfigs = [
    {
      id: 1,
      name: 'Default Config',
      is_active: true,
      auto_reply_emails: true,
      auto_reply_whatsapp: false,
      working_hours_start: '09:00:00',
      working_hours_end: '17:00:00',
      working_days: [1, 2, 3, 4, 5]
    },
    {
      id: 2,
      name: 'Weekend Config',
      is_active: false,
      auto_reply_emails: true,
      auto_reply_whatsapp: true,
      working_hours_start: '10:00:00',
      working_hours_end: '15:00:00',
      working_days: [6, 0]
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    BotService.getBotConfigurations.mockResolvedValue(mockConfigs);
    BotService.createBotConfiguration.mockResolvedValue(mockConfigs[0]);
    BotService.updateBotConfiguration.mockResolvedValue(mockConfigs[0]);
    BotService.deleteBotConfiguration.mockResolvedValue({});
  });

  test('renders bot configurations after loading', async () => {
    render(<BotConfig user={mockUser} />);

    // Vérifier l'état de chargement initial
    expect(screen.getByText(/Chargement/i)).toBeInTheDocument();

    // Vérifier que les configurations sont affichées après le chargement
    await waitFor(() => {
      expect(screen.getByText('Default Config')).toBeInTheDocument();
      expect(screen.getByText('Weekend Config')).toBeInTheDocument();
    });

    // Vérifier que le service a été appelé
    expect(BotService.getBotConfigurations).toHaveBeenCalled();
  });

  test('opens modal when add button is clicked', async () => {
    render(<BotConfig user={mockUser} />);

    // Attendre que les données soient chargées
    await waitFor(() => {
      expect(screen.getByText('Default Config')).toBeInTheDocument();
    });

    // Cliquer sur le bouton d'ajout
    fireEvent.click(screen.getByText(/Ajouter/i));

    // Vérifier que le modal est affiché
    expect(screen.getByText(/Nouvelle configuration/i)).toBeInTheDocument();
  });

  test('submits form with valid data', async () => {
    render(<BotConfig user={mockUser} />);

    // Attendre que les données soient chargées
    await waitFor(() => {
      expect(screen.getByText('Default Config')).toBeInTheDocument();
    });

    // Cliquer sur le bouton d'ajout
    fireEvent.click(screen.getByText(/Ajouter/i));

    // Remplir le formulaire
    fireEvent.change(screen.getByLabelText(/Nom/i), {
      target: { value: 'New Config' }
    });

    // Soumettre le formulaire
    fireEvent.click(screen.getByText(/Enregistrer/i));

    // Vérifier que le service a été appelé avec les bonnes valeurs
    await waitFor(() => {
      expect(BotService.createBotConfiguration).toHaveBeenCalled();
      const callArg = BotService.createBotConfiguration.mock.calls[0][0];
      expect(callArg.name).toBe('New Config');
    });
  });

  test('deletes configuration when delete button is clicked', async () => {
    render(<BotConfig user={mockUser} />);

    // Attendre que les données soient chargées
    await waitFor(() => {
      expect(screen.getByText('Default Config')).toBeInTheDocument();
    });

    // Trouver et cliquer sur le bouton de suppression
    const deleteButtons = screen.getAllByRole('button', { name: /Supprimer/i });
    fireEvent.click(deleteButtons[0]);

    // Confirmer la suppression
    fireEvent.click(screen.getByText(/Confirmer/i));

    // Vérifier que le service a été appelé
    await waitFor(() => {
      expect(BotService.deleteBotConfiguration).toHaveBeenCalledWith(1);
    });
  });
});
