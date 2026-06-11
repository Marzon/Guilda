// Stub hook for marketing site - no-op logout
export const useLogout = () => {
  return {
    logout: () => {
      // Redirect to core app for logout
      window.location.href = 'https://suprema.guilda.app.br/auth';
    },
    isLoading: false,
  };
};
