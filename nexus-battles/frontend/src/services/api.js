// ─── URLs de los microservicios ────────────────────────────────────────────
const AUTH_URL      = 'http://localhost:3001/api/auth';
const GLOBAL_URL    = 'http://localhost:3002/api/v1';
const PERSONAL_URL  = 'http://localhost:3003/api/v1';

const getToken = () => localStorage.getItem('nexus_token');

const headers = (extra = {}) => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
  ...extra,
});

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
  return data;
};

// ── Auth Service ──────────────────────────────────────────────────────────
export const authApi = {
  login:    (body) => fetch(`${AUTH_URL}/login`,    { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(handleResponse),
  register: (body) => fetch(`${AUTH_URL}/register`, { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(handleResponse),
  me:       ()     => fetch(`${AUTH_URL}/me`,        { headers: headers() }).then(handleResponse),
};

// ── Global Inventory Service ──────────────────────────────────────────────
export const globalApi = {
  getProducts: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetch(`${GLOBAL_URL}/products?${qs}`, { headers: headers() }).then(handleResponse);
  },
  getProduct: (id) =>
    fetch(`${GLOBAL_URL}/products/${id}`, { headers: headers() }).then(handleResponse),

  addRating: (productId, stars) =>
    fetch(`${GLOBAL_URL}/products/${productId}/ratings`, {
      method: 'POST', headers: headers(), body: JSON.stringify({ stars }),
    }).then(handleResponse),

  addComment: (productId, text, images = []) =>
    fetch(`${GLOBAL_URL}/products/${productId}/comments`, {
      method: 'POST', headers: headers(), body: JSON.stringify({ text, images }),
    }).then(handleResponse),

  deleteComment: (productId, commentId) =>
    fetch(`${GLOBAL_URL}/products/${productId}/comments/${commentId}`, {
      method: 'DELETE', headers: headers(),
    }).then(handleResponse),
};

// ── Personal Inventory Service ────────────────────────────────────────────
export const personalApi = {
  getInventory: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return fetch(`${PERSONAL_URL}/inventory?${qs}`, { headers: headers() }).then(handleResponse);
  },
  getDecks: () =>
    fetch(`${PERSONAL_URL}/inventory/decks`, { headers: headers() }).then(handleResponse),

  createDeck: (name, cardIds) =>
    fetch(`${PERSONAL_URL}/inventory/decks`, {
      method: 'POST', headers: headers(), body: JSON.stringify({ name, cardIds }),
    }).then(handleResponse),

  updateDeck: (id, data) =>
    fetch(`${PERSONAL_URL}/inventory/decks/${id}`, {
      method: 'PUT', headers: headers(), body: JSON.stringify(data),
    }).then(handleResponse),

  deleteDeck: (id) =>
    fetch(`${PERSONAL_URL}/inventory/decks/${id}`, {
      method: 'DELETE', headers: headers(),
    }).then(handleResponse),
};
