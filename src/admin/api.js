const getToken = () => localStorage.getItem('adminToken');

export const authFetch = (url, options = {}) => {
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...options.headers,
    },
  });
};

export const authFetchForm = (url, options = {}) => {
  return fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${getToken()}`,
      ...options.headers,
    },
  });
};

export const login = async (username, password) => {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error('Invalid credentials');
  const data = await res.json();
  localStorage.setItem('adminToken', data.token);
  return data;
};

export const logout = () => {
  localStorage.removeItem('adminToken');
};

export const isLoggedIn = () => !!getToken();
