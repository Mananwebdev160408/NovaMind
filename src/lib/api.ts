const API_BASE_URL = 'http://localhost:5000/api';

const getHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
});

export const api = {
  get: (url: string) => fetch(`${API_BASE_URL}${url}`, {
    headers: getHeaders()
  }).then(res => res.json()),

  post: (url: string, data: any) => fetch(`${API_BASE_URL}${url}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  }).then(async res => {
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'API request failed');
    return json;
  }),

  put: (url: string, data: any) => fetch(`${API_BASE_URL}${url}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data)
  }).then(async res => {
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'API request failed');
    return json;
  }),

  delete: (url: string) => fetch(`${API_BASE_URL}${url}`, {
    method: 'DELETE',
    headers: getHeaders()
  }).then(async res => {
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'API request failed');
    return json;
  }),

  patch: (url: string, data: any) => fetch(`${API_BASE_URL}${url}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data)
  }).then(async res => {
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'API request failed');
    return json;
  })
};
