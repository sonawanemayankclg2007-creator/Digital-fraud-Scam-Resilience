import axios from 'axios';

const API_BASE = '/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('arthraksha_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API Methods
export const api = {
  // Auth
  register: (data: any) => apiClient.post('/auth/register', data),
  login: (data: any) => apiClient.post('/auth/login', data),
  logout: () => apiClient.post('/auth/logout'),
  getMe: () => apiClient.get('/auth/me'),
  updateMe: (data: any) => apiClient.patch('/auth/me', data),

  // Scam & Claims
  analyzeScam: (data: { message_text: string; language?: string; source?: string }) =>
    apiClient.post('/scam/analyze', data),
  checkClaim: (data: { claim_text: string; language?: string }) =>
    apiClient.post('/scam/claim-check', data),

  // Accounts & UPI
  checkAccount: (account_identifier: string) =>
    apiClient.post('/account/check', { account_identifier }),
  getAccount: (id: string) => apiClient.get(`/account/${id}`),
  getAccountTransactions: (id: string) => apiClient.get(`/account/${id}/transactions`),

  // Phone
  checkPhone: (phone_number: string) =>
    apiClient.post('/phone/check', { phone_number }),

  // Transactions
  analyzeTransaction: (data: { sender_account: string; receiver_account: string; amount: number }) =>
    apiClient.post('/transactions/analyze', data),
  getTransactions: (limit = 50) => apiClient.get(`/transactions?limit=${limit}`),
  createTransaction: (data: any) => apiClient.post('/transactions', data),

  // Networks & Graph
  getFullGraph: (min_amount = 0) =>
    apiClient.get(`/network/full-graph?min_amount=${min_amount}`),
  getFraudRings: () => apiClient.get('/network/rings'),
  getAccountGraph: (account_id: string, hops = 2) =>
    apiClient.get(`/network/${encodeURIComponent(account_id)}?hops=${hops}`),
  getAccountClusters: (account_id: string) =>
    apiClient.get(`/network/${encodeURIComponent(account_id)}/clusters`),
  getAccountNetworkRisk: (account_id: string) =>
    apiClient.get(`/network/${encodeURIComponent(account_id)}/risk`),

  // Reports
  submitReport: (data: any) => apiClient.post('/reports', data),
  getReports: (params?: { report_type?: string; status_filter?: string }) =>
    apiClient.get('/reports', { params }),
  getReport: (id: number) => apiClient.get(`/reports/${id}`),

  // Alerts
  getAlerts: (limit = 50) => apiClient.get(`/alerts?limit=${limit}`),
  createAlert: (data: any) => apiClient.post('/alerts/create', data),
  dismissAlert: (id: number) => apiClient.patch(`/alerts/${id}/dismiss`),

  // Notifications & Announcements
  sendNotification: (data: {
    channel: string;
    recipient: string;
    message: string;
    language?: string;
  }) => apiClient.post('/notifications/send', data),
  getNotifications: (limit = 50, unreadOnly = false) =>
    apiClient.get(`/notifications?limit=${limit}&unread_only=${unreadOnly}`),
  getUnreadNotificationCount: () => apiClient.get('/notifications/unread-count'),
  markNotificationRead: (id: number) => apiClient.patch(`/notifications/${id}/read`),
  markAllNotificationsRead: () => apiClient.patch('/notifications/read-all'),

  // Announcements (User Dashboard & Admin)
  getAnnouncements: (limit = 10) => apiClient.get(`/announcements?limit=${limit}`),
  getAdminAnnouncements: (limit = 50) => apiClient.get(`/admin/announcements?limit=${limit}`),
  createAnnouncement: (data: any) => apiClient.post('/admin/announcements', data),
  getAnnouncement: (id: number) => apiClient.get(`/admin/announcements/${id}`),
  updateAnnouncement: (id: number, data: any) => apiClient.put(`/admin/announcements/${id}`, data),
  toggleAnnouncementStatus: (id: number, is_active: boolean) =>
    apiClient.patch(`/admin/announcements/${id}/status`, { is_active }),
  deleteAnnouncement: (id: number) => apiClient.delete(`/admin/announcements/${id}`),
  sendAnnouncementTargeted: (id: number, user_ids: number[]) =>
    apiClient.post(`/admin/announcements/${id}/send`, { user_ids }),

  // Dashboard
  getDashboardSummary: () => apiClient.get('/dashboard/summary'),
  getRiskTrends: () => apiClient.get('/dashboard/risk-trends'),
  getScamCategories: () => apiClient.get('/dashboard/scam-categories'),

  // Admin & User Management
  getAdminStats: () => apiClient.get('/admin/stats'),
  getAdminUsers: (params?: { query?: string; role?: string; status?: string }) =>
    apiClient.get('/admin/users', { params }),
  updateUserStatus: (id: number, is_active: boolean) =>
    apiClient.patch(`/admin/users/${id}/status`, { is_active }),
  createAnalyst: (data: { name: string; email: string; password: string; phone?: string }) =>
    apiClient.post('/admin/analysts', data),
  toggleAnalystStatus: (id: number, is_active: boolean) =>
    apiClient.patch(`/admin/analysts/${id}/status`, { is_active }),
  getAdminReports: () => apiClient.get('/admin/reports'),
  moderateReport: (id: number, status: string) =>
    apiClient.patch(`/admin/reports/${id}`, { status }),
  getAdminAccounts: () => apiClient.get('/admin/accounts'),
  getAdminNetworks: () => apiClient.get('/admin/networks'),
  getAdminAuditLogs: () => apiClient.get('/admin/audit-logs'),

  // Translation
  translate: (text: string, target_language: string) =>
    apiClient.post('/translate', { text, target_language }),
};
