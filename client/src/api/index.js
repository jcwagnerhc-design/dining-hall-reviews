const API_BASE = '/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('admin_token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data;
}

// Auth
export const login = (username, password) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });

export const getMe = () => request('/auth/me');

// Food items (public)
export const getFoodItems = (tab, monthYear) =>
  request(`/food/${tab}${monthYear ? `?month_year=${monthYear}` : ''}`);

export const getFoodItemDetail = (id, monthYear) =>
  request(`/food/item/${id}${monthYear ? `?month_year=${monthYear}` : ''}`);

// Ratings (public)
export const submitRating = (food_item_id, rating, device_fingerprint) =>
  request('/ratings', { method: 'POST', body: JSON.stringify({ food_item_id, rating, device_fingerprint }) });

export const checkRating = (food_item_id) => request(`/ratings/check/${food_item_id}`);

// Reviews (public)
export const submitReview = (data) =>
  request('/reviews', { method: 'POST', body: JSON.stringify(data) });

export const getReviews = (food_item_id, monthYear) =>
  request(`/reviews/${food_item_id}${monthYear ? `?month_year=${monthYear}` : ''}`);

// Suggestions (public)
export const getSuggestions = (monthYear) =>
  request(`/suggestions${monthYear ? `?month_year=${monthYear}` : ''}`);

export const submitVote = (suggestion_card_id, vote_type, device_fingerprint) =>
  request('/suggestions/vote', { method: 'POST', body: JSON.stringify({ suggestion_card_id, vote_type, device_fingerprint }) });

// Recommendations (public)
export const submitRecommendation = (rec_type, text) =>
  request('/recommendations', { method: 'POST', body: JSON.stringify({ rec_type, text }) });

// Admin — Overview
export const getOverview = (monthYear) =>
  request(`/admin/overview${monthYear ? `?month_year=${monthYear}` : ''}`);

// Admin — Food items
export const getAdminFoodItems = (tab_category) =>
  request(`/admin/food-items${tab_category ? `?tab_category=${tab_category}` : ''}`);

export const createFoodItem = (data) =>
  request('/admin/food-items', { method: 'POST', body: JSON.stringify(data) });

export const updateFoodItem = (id, data) =>
  request(`/admin/food-items/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteFoodItem = (id) =>
  request(`/admin/food-items/${id}`, { method: 'DELETE' });

// Admin — Monthly cycles
export const getCycles = (monthYear) =>
  request(`/admin/cycles${monthYear ? `?month_year=${monthYear}` : ''}`);

export const addToCycle = (data) =>
  request('/admin/cycles', { method: 'POST', body: JSON.stringify(data) });

export const removeFromCycle = (id) =>
  request(`/admin/cycles/${id}`, { method: 'DELETE' });

// Admin — Suggestions
export const getAdminSuggestions = (monthYear) =>
  request(`/admin/suggestions${monthYear ? `?month_year=${monthYear}` : ''}`);

export const createSuggestion = (data) =>
  request('/admin/suggestions', { method: 'POST', body: JSON.stringify(data) });

export const updateSuggestion = (id, data) =>
  request(`/admin/suggestions/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteSuggestion = (id) =>
  request(`/admin/suggestions/${id}`, { method: 'DELETE' });

// Admin — Ratings & Reviews data
export const getAdminRatings = (params) => {
  const q = new URLSearchParams(params).toString();
  return request(`/admin/ratings?${q}`);
};

export const getAdminReviews = (params) => {
  const q = new URLSearchParams(params).toString();
  return request(`/admin/reviews?${q}`);
};

export const getDemographics = (monthYear) =>
  request(`/admin/demographics${monthYear ? `?month_year=${monthYear}` : ''}`);

// Admin — Historical
export const getHistoryMonths = () => request('/admin/history/months');

export const getHistoryTrends = (params) => {
  const q = new URLSearchParams(params).toString();
  return request(`/admin/history/trends?${q}`);
};

// Admin — AI Summaries
export const getAISummaries = (monthYear) =>
  request(`/admin/ai-summaries${monthYear ? `?month_year=${monthYear}` : ''}`);

export const runAISummarizer = (monthYear) =>
  request('/admin/ai-summaries/run', { method: 'POST', body: JSON.stringify({ month_year: monthYear }) });

// Admin — Recommendations
export const getAdminRecommendations = (monthYear) =>
  request(`/admin/recommendations${monthYear ? `?month_year=${monthYear}` : ''}`);

// Admin — Account management
export const getAccounts = () => request('/admin/accounts');

export const createAccount = (data) =>
  request('/admin/accounts', { method: 'POST', body: JSON.stringify(data) });

export const updateAccount = (id, data) =>
  request(`/admin/accounts/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteAccount = (id) =>
  request(`/admin/accounts/${id}`, { method: 'DELETE' });

// Upload image
export const uploadImage = async (file) => {
  const token = localStorage.getItem('admin_token');
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${API_BASE}/admin/upload-image`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data;
};
