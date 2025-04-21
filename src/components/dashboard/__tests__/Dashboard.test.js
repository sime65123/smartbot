import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from '../Dashboard';
import BotService from '../../../services/BotService';
import AccountService from '../../../services/AccountService';

// Mock des services
jest.mock('../../../services/BotService', () => ({
  getDashboardStats: jest.fn(),
  getMessages: jest.fn()
}));

jest.mock('../../../services/AccountService', () => ({
  getAccountsSummary: jest.fn(),
  getUserActivities: jest.fn()
}));

describe('Dashboard Component', () => {
  const mockUser = { id: 1, username: 'testuser' };
  const mockStats = {
    total_messages: 100,
    pending_messages: 20,
    processed_messages: 60,
    replied_messages: 20
  };
  const mockMessages = [
    {
      id: 1,
      sender: 'user1@example.com',
      subject: 'Test message 1',
      content: 'This is a test message',
      received_at: '2023-04-01T10:00:00Z',
      status: 'pending'
    },
    {
      id: 2,
      sender: 'user2@example.com',
      subject: 'Test message 2',
      content: 'This is another test message',
      received_at: '2023-04-02T11:00:00Z',
      status: 'replied'
    }
  ];
  const mockActivities = [
    {
      id: 1,
      user: 1,
      activity_type: 'login',
      timestamp: '2023-04-01T09:00:00Z',
      details: 'User logged in'
    },
    {
      id: 2,
      user: 1,
      activity_type: 'message_reply',
      timestamp: '2023-04-01T10:30:00Z',
      details: 'User replied to a message'
    }
  ];
  const mockAccountsSummary = {
    email_accounts: 2,
    whatsapp_accounts: 1
  };

  beforeEach(() => {
    jest.clearAllMocks();
    BotService.getDashboardStats.mockResolvedValue(mockStats);
    BotService.getMessages.mockResolvedValue(mockMessages);
    AccountService.getAccountsSummary.mockResolvedValue(mockAccountsSummary);
    AccountService.getUserActivities.mockResolvedValue(mockActivities);
  });

  test('renders dashboard with loading state initially', () => {
    render(<Dashboard user={mockUser} />);
    expect(screen.getByText(/Chargement/i)).toBeInTheDocument();
  });

  test('renders dashboard with data after loading', async () => {
    render(<Dashboard user={mockUser} />);

    await waitFor(() => {
      // Vérifier que les statistiques sont affichées
      expect(screen.getByText(/100/)).toBeInTheDocument(); // Total messages
      expect(screen.getByText(/20/)).toBeInTheDocument(); // Pending messages
      
      // Vérifier que les messages récents sont affichés
      expect(screen.getByText(/Test message 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Test message 2/i)).toBeInTheDocument();
      
      // Vérifier que les activités récentes sont affichées
      expect(screen.getByText(/User logged in/i)).toBeInTheDocument();
      expect(screen.getByText(/User replied to a message/i)).toBeInTheDocument();
    });

    // Vérifier que les services ont été appelés
    expect(BotService.getDashboardStats).toHaveBeenCalled();
    expect(BotService.getMessages).toHaveBeenCalled();
    expect(AccountService.getAccountsSummary).toHaveBeenCalled();
    expect(AccountService.getUserActivities).toHaveBeenCalled();
  });

  test('displays error message when API calls fail', async () => {
    const errorMessage = 'Failed to fetch data';
    BotService.getDashboardStats.mockRejectedValue(new Error(errorMessage));

    render(<Dashboard user={mockUser} />);

    await waitFor(() => {
      expect(screen.getByText(/Une erreur s'est produite/i)).toBeInTheDocument();
    });
  });
});
