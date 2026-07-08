const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiFetch = async (url, options) => {
  const response = await window.fetch(url, options);
  if (response.status === 401) {
    localStorage.removeItem('admin_token');
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin/login')) {
      window.location.href = '/admin/login';
    }
  }
  return response;
};

const fetch = apiFetch;

const getHeaders = () => {
  const token = localStorage.getItem('admin_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export async function fetchProducts(filters = {}) {
  const query = new URLSearchParams(filters).toString();
  const response = await fetch(`${API_URL}/products${query ? `?${query}` : ''}`);
  if (!response.ok) throw new Error('Failed to fetch products');
  return response.json();
}

export async function fetchProductById(id) {
  const response = await fetch(`${API_URL}/products/${id}`);
  if (!response.ok) throw new Error('Failed to fetch product');
  return response.json();
}

export async function fetchCollections() {
  const response = await fetch(`${API_URL}/collections`);
  if (!response.ok) throw new Error('Failed to fetch collections');
  return response.json();
}

export async function fetchCollectionById(id) {
  const response = await fetch(`${API_URL}/collections/${id}`);
  if (!response.ok) throw new Error('Failed to fetch collection');
  return response.json();
}

export async function createCollection(collectionData) {
  const response = await fetch(`${API_URL}/collections`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(collectionData),
  });
  if (!response.ok) throw new Error('Failed to create collection');
  return response.json();
}

export async function updateCollection(id, collectionData) {
  const response = await fetch(`${API_URL}/collections/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(collectionData),
  });
  if (!response.ok) throw new Error('Failed to update collection');
  return response.json();
}

export async function deleteCollection(id) {
  const response = await fetch(`${API_URL}/collections/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete collection');
}

export async function fetchImpactStats() {
  const response = await fetch(`${API_URL}/impact-stats`);
  if (!response.ok) throw new Error('Failed to fetch impact stats');
  return response.json();
}

export async function createImpactStat(statData) {
  const response = await fetch(`${API_URL}/impact-stats`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(statData),
  });
  if (!response.ok) throw new Error('Failed to create impact stat');
  return response.json();
}

export async function updateImpactStat(id, statData) {
  const response = await fetch(`${API_URL}/impact-stats/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(statData),
  });
  if (!response.ok) throw new Error('Failed to update impact stat');
  return response.json();
}

export async function deleteImpactStat(id) {
  const response = await fetch(`${API_URL}/impact-stats/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete impact stat');
}

export async function fetchDashboardStats() {
  const response = await fetch(`${API_URL}/admin/dashboard-stats`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch dashboard stats');
  return response.json();
}

export async function deleteProduct(id) {
  const response = await fetch(`${API_URL}/products/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Delete failed');
}

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  const token = localStorage.getItem('admin_token');

  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: formData,
  });
  if (!response.ok) throw new Error('Upload failed');
  return response.json();
}

export async function createProduct(productData) {
  const response = await fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(productData),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error('Failed to create product');
    error.status = response.status;
    error.data = errorData;
    throw error;
  }
  return response.json();
}

export async function updateProduct(id, productData) {
  const response = await fetch(`${API_URL}/products/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(productData),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error('Failed to update product');
    error.status = response.status;
    error.data = errorData;
    throw error;
  }
  return response.json();
}

export async function createOrder(orderData) {
  const response = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  if (!response.ok) throw new Error('Failed to place order');
  return response.json();
}

export async function fetchOrders() {
  const response = await fetch(`${API_URL}/orders`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch orders');
  return response.json();
}

export async function updateOrderStatus(id, status) {
  const response = await fetch(`${API_URL}/orders/${id}/status`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error('Failed to update status');
  return response.json();
}

export async function fetchProperties() {
  const response = await fetch(`${API_URL}/properties`);
  if (!response.ok) throw new Error('Failed to fetch properties');
  return response.json();
}

export async function createProperty(propertyData) {
  const response = await fetch(`${API_URL}/properties`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(propertyData),
  });
  if (!response.ok) throw new Error('Failed to create property');
  return response.json();
}

export async function deleteProperty(id) {
  const response = await fetch(`${API_URL}/properties/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete property');
}

export async function submitMessage(messageData) {
  const response = await fetch(`${API_URL}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(messageData),
  });
  if (!response.ok) throw new Error('Failed to send message');
  return response.json();
}

export async function fetchMessages() {
  const response = await fetch(`${API_URL}/messages`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch messages');
  return response.json();
}

export async function updateMessageStatus(id, status) {
  const response = await fetch(`${API_URL}/messages/${id}/status`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error('Failed to update message status');
  return response.json();
}

export async function deleteMessage(id) {
  const response = await fetch(`${API_URL}/messages/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete message');
}

export async function fetchSubscribers() {
  const response = await fetch(`${API_URL}/subscribers`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch subscribers');
  return response.json();
}

export async function createSubscriber(subscriberData) {
  const response = await fetch(`${API_URL}/subscribers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscriberData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.error || 'Failed to subscribe');
    throw error;
  }
  return response.json();
}

export async function deleteSubscriber(id) {
  const response = await fetch(`${API_URL}/subscribers/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete subscriber');
}

// --- EDITORIAL API ---

export async function fetchLookbook() {
  const response = await fetch(`${API_URL}/lookbook`);
  if (!response.ok) throw new Error('Failed to fetch lookbook');
  return response.json();
}

export async function createLookbookItem(data) {
  const response = await fetch(`${API_URL}/lookbook`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create lookbook item');
  return response.json();
}

export async function deleteLookbookItem(id) {
  const response = await fetch(`${API_URL}/lookbook/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete lookbook item');
}

export async function fetchCommunityImages() {
  const response = await fetch(`${API_URL}/community-images`);
  if (!response.ok) throw new Error('Failed to fetch community images');
  return response.json();
}

export async function createCommunityImage(data) {
  const response = await fetch(`${API_URL}/community-images`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create community image');
  return response.json();
}

export async function deleteCommunityImage(id) {
  const response = await fetch(`${API_URL}/community-images/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete community image');
}

export async function fetchTestimonials() {
  const response = await fetch(`${API_URL}/testimonials`);
  if (!response.ok) throw new Error('Failed to fetch testimonials');
  return response.json();
}

export async function createTestimonial(data) {
  const response = await fetch(`${API_URL}/testimonials`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create testimonial');
  return response.json();
}

export async function deleteTestimonial(id) {
  const response = await fetch(`${API_URL}/testimonials/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete testimonial');
}

// --- REVIEWS API ---

export async function fetchReviews(productId) {
  const response = await fetch(`${API_URL}/products/${productId}/reviews`);
  if (!response.ok) throw new Error('Failed to fetch reviews');
  return response.json();
}

export async function submitReview(reviewData) {
  const response = await fetch(`${API_URL}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reviewData),
  });
  if (!response.ok) throw new Error('Failed to submit review');
  return response.json();
}

export async function deleteReview(id) {
  const response = await fetch(`${API_URL}/reviews/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete review');
}

// --- SITE SETTINGS API ---

export async function fetchSiteSettings() {
  const response = await fetch(`${API_URL}/settings`);
  if (!response.ok) throw new Error('Failed to fetch site settings');
  return response.json();
}

export async function updateSiteSettings(data) {
  const response = await fetch(`${API_URL}/settings`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update site settings');
  return response.json();
}

