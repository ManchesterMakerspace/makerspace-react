export const buildJsonUrl = (path: string) => {
  return `${path}.json`;
};

export const emailValid = (email: string): boolean => {
  return (/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i).test(email);
};

export const handleApiError = (e: any): string => {
  return e.response.data.error;
};