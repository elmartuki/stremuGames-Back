
export const register = async ({ username, email, password }) => {
  
  return {
    username,
    email,
  };
};

export const login = async ({ email, password }) => {
  return "TOKEN_FAKE";
};
