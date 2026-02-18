import { API_URL } from '../config';

class ApiClient {
  constructor() {
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  async request(path, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });

    if (res.status === 204) return null;

    const data = await res.json();

    if (!res.ok) {
      const error = new Error(data.detail || 'Anfrage fehlgeschlagen');
      error.status = res.status;
      throw error;
    }

    return data;
  }

  // Auth
  register(name, email, password) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }

  login(email, password) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  socialLogin(provider, idToken, name) {
    return this.request('/api/auth/social', {
      method: 'POST',
      body: JSON.stringify({ provider, id_token: idToken, name }),
    });
  }

  getMe() {
    return this.request('/api/auth/me');
  }

  updateMe(data) {
    return this.request('/api/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  updateFCMToken(token) {
    return this.request('/api/auth/fcm-token', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  deleteAccount() {
    return this.request('/api/auth/me', { method: 'DELETE' });
  }

  // Missions
  createMission(lat, lng, note) {
    return this.request('/api/missions/create', {
      method: 'POST',
      body: JSON.stringify({ lat, lng, note }),
    });
  }

  respondToMission(missionId, action, helperLat, helperLng) {
    return this.request('/api/missions/respond', {
      method: 'POST',
      body: JSON.stringify({
        mission_id: missionId,
        action,
        helper_lat: helperLat,
        helper_lng: helperLng,
      }),
    });
  }

  endMission(missionId) {
    return this.request('/api/missions/end', {
      method: 'POST',
      body: JSON.stringify({ mission_id: missionId }),
    });
  }

  getActiveMission() {
    return this.request('/api/missions/active');
  }

  getMissionHistory() {
    return this.request('/api/missions/history');
  }

  // Health
  health() {
    return this.request('/api/health');
  }
}

export const api = new ApiClient();
export default api;
