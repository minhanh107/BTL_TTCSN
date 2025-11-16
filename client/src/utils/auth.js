// Save token to localStorage
export function saveToken(token) {
  localStorage.setItem('token', token);
}

// Get token from localStorage
export function getToken() {
  return localStorage.getItem('token');
}

// Remove token from localStorage
export function removeToken() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

// Save user to localStorage
export function saveUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

// Get user from localStorage
export function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

// Check if user is authenticated
export function isAuthenticated() {
  return !!getToken();
}

