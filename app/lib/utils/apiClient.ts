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

// 2. Global Interceptors (Session expulsion & API error logging)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Automated Expulsion: Catch expired sessions, deleted accounts, or unauthorized calls
    if (typeof window !== "undefined") {
      const status = error.response?.status;
      const data = error.response?.data;
      const isAuthError =
        status === 401 ||
        (status === 404 && data?.error === "User not found") ||
        data?.code === "SESSION_EXPIRED" ||
        data?.code === "USER_NOT_FOUND";

      if (isAuthError) {
        const currentPath = window.location.pathname;
        if (!currentPath.startsWith("/login") && !currentPath.startsWith("/superadmin/login")) {
          // Cleanly redirect to login with expired notice flag
          window.location.href = "/login?expired=true";
        }
      }
    }

    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);
