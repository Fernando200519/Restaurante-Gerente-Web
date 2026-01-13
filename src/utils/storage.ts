const TOKEN_KEY = "auth_token";

export const saveToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);

  window.dispatchEvent(new Event("auth-sync"));
};

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);

  window.dispatchEvent(new Event("auth-sync"));
};
