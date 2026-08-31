import axios from 'axios';

// 1. Determine the base URL dynamically
const getBaseURL = (): string => {
  if (typeof window !== 'undefined') {
    // Client-side: Browser handles relative URLs perfectly automatically
    return ''; 
  }
  // Server-side: Use the environment variable domain name
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
};

export const api= axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout:50000, // 10 seconds timeout limit
});

// 2. Global Interceptors (Optional but recommended)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global API errors here (e.g., token expiration, logging)
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);
