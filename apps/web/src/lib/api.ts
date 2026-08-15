/**
 * MindCanvas API Client
 * Centralized HTTP client for communicating with the FastAPI backend.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) localStorage.setItem('mc_token', token);
    else localStorage.removeItem('mc_token');
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('mc_token');
    }
    return this.token;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {}),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

    if (res.status === 204) return undefined as T;

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(err.detail || err.message || `HTTP ${res.status}`);
    }

    return res.json();
  }

  // Auth
  register(data: { email: string; password: string; full_name?: string }) {
    return this.request<{ access_token: string; user: any }>('/api/v1/auth/register', { method: 'POST', body: JSON.stringify(data) });
  }
  login(data: { email: string; password: string }) {
    return this.request<{ access_token: string; user: any }>('/api/v1/auth/login', { method: 'POST', body: JSON.stringify(data) });
  }
  getMe() { return this.request<any>('/api/v1/auth/me'); }
  updateProfile(data: any) { return this.request<any>('/api/v1/auth/profile', { method: 'PUT', body: JSON.stringify(data) }); }
  completeOnboarding(data: any) { return this.request<any>('/api/v1/auth/onboarding', { method: 'POST', body: JSON.stringify(data) }); }
  updatePreferences(data: any) { return this.request<any>('/api/v1/auth/preferences', { method: 'PUT', body: JSON.stringify(data) }); }

  // Dashboard
  getDashboard() { return this.request<any>('/api/v1/dashboard'); }

  // Journal
  listJournals(params?: Record<string, any>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<any>(`/api/v1/journal${qs}`);
  }
  getJournal(id: string) { return this.request<any>(`/api/v1/journal/${id}`); }
  createJournal(data: any) { return this.request<any>('/api/v1/journal', { method: 'POST', body: JSON.stringify(data) }); }
  updateJournal(id: string, data: any) { return this.request<any>(`/api/v1/journal/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  deleteJournal(id: string) { return this.request<void>(`/api/v1/journal/${id}`, { method: 'DELETE' }); }
  getJournalCalendar(year: number, month: number) { return this.request<any>(`/api/v1/journal/calendar?year=${year}&month=${month}`); }
  uploadJournalMedia(journalId: string, file: File) {
    const form = new FormData(); form.append('file', file);
    return this.request<any>(`/api/v1/journal/${journalId}/media`, { method: 'POST', body: form });
  }
  deleteJournalMedia(journalId: string, mediaId: string) {
    return this.request<void>(`/api/v1/journal/${journalId}/media/${mediaId}`, { method: 'DELETE' });
  }

  // Ideas
  listIdeas(params?: Record<string, any>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<any>(`/api/v1/ideas${qs}`);
  }
  createIdea(data: any) { return this.request<any>('/api/v1/ideas', { method: 'POST', body: JSON.stringify(data) }); }
  updateIdea(id: string, data: any) { return this.request<any>(`/api/v1/ideas/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  deleteIdea(id: string) { return this.request<void>(`/api/v1/ideas/${id}`, { method: 'DELETE' }); }

  // Projects
  listProjects(params?: Record<string, any>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<any>(`/api/v1/projects${qs}`);
  }
  getProject(id: string) { return this.request<any>(`/api/v1/projects/${id}`); }
  createProject(data: any) { return this.request<any>('/api/v1/projects', { method: 'POST', body: JSON.stringify(data) }); }
  updateProject(id: string, data: any) { return this.request<any>(`/api/v1/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  deleteProject(id: string) { return this.request<void>(`/api/v1/projects/${id}`, { method: 'DELETE' }); }

  // Tasks
  listTasks(params?: Record<string, any>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<any>(`/api/v1/tasks${qs}`);
  }
  createTask(data: any) { return this.request<any>('/api/v1/tasks', { method: 'POST', body: JSON.stringify(data) }); }
  updateTask(id: string, data: any) { return this.request<any>(`/api/v1/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  deleteTask(id: string) { return this.request<void>(`/api/v1/tasks/${id}`, { method: 'DELETE' }); }

  // Finance
  listTransactions(params?: Record<string, any>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<any>(`/api/v1/finance${qs}`);
  }
  getFinanceSummary() { return this.request<any>('/api/v1/finance/summary'); }
  createTransaction(data: any) { return this.request<any>('/api/v1/finance', { method: 'POST', body: JSON.stringify(data) }); }
  deleteTransaction(id: string) { return this.request<void>(`/api/v1/finance/${id}`, { method: 'DELETE' }); }

  // Learning
  listLearningItems(params?: Record<string, any>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<any>(`/api/v1/learning/items${qs}`);
  }
  createLearningItem(data: any) { return this.request<any>('/api/v1/learning/items', { method: 'POST', body: JSON.stringify(data) }); }
  updateLearningItem(id: string, data: any) { return this.request<any>(`/api/v1/learning/items/${id}`, { method: 'PUT', body: JSON.stringify(data) }); }
  listLearningSessions(params?: Record<string, any>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<any>(`/api/v1/learning/sessions${qs}`);
  }
  createLearningSession(data: any) { return this.request<any>('/api/v1/learning/sessions', { method: 'POST', body: JSON.stringify(data) }); }

  // Wellness
  listWellness(params?: Record<string, any>) {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<any>(`/api/v1/wellness${qs}`);
  }
  createWellness(data: any) { return this.request<any>('/api/v1/wellness', { method: 'POST', body: JSON.stringify(data) }); }

  // Events
  listEvents() { return this.request<any>('/api/v1/events'); }
  createEvent(data: any) { return this.request<any>('/api/v1/events', { method: 'POST', body: JSON.stringify(data) }); }
  deleteEvent(id: string) { return this.request<void>(`/api/v1/events/${id}`, { method: 'DELETE' }); }

  // Search
  search(query: string) { return this.request<any>(`/api/v1/search?q=${encodeURIComponent(query)}`); }
}

export const api = new ApiClient();
