// src/utils/auth.js
export const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  if (!token) return {};

  // Check if the token already includes 'Bearer '
  if (token.startsWith("Bearer ")) {
    return { Authorization: token };
  }

  return { Authorization: `Bearer ${token}` };
};
