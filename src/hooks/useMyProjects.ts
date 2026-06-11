// Stub hook for marketing site - returns empty projects
export const useMyProjects = () => {
  return {
    ownedProjects: [],
    memberProjects: [],
    allProjects: [],
    isLoading: false,
  };
};
