import { getLocalStorage, setLocalStorage } from "../utils";

export const getOpenAIApiKey = () => {
  // Only check env variable on server side
  if (typeof window === 'undefined') {
    return process.env.OPENAI_API_KEY;
  }
  
  // Check localStorage on client side
  const apiKey = getLocalStorage('openaiApiKey');
  return apiKey || process.env.OPENAI_API_KEY;
};

export const setOpenAIApiKey = async (apiKey: string) => {
  if (typeof window === 'undefined') return;
  setLocalStorage('openaiApiKey', apiKey);
};

export const getFinancialDataApiKey = () => {
  const envApiKey = process.env.FMP_API_KEY;
  if (envApiKey) return envApiKey;

  // Check localStorage on client side
  const apiKey = getLocalStorage('fmpApiKey');
  return apiKey || process.env.FMP_API_KEY;
};

export const setFinancialDataApiKey = async (apiKey: string) => {
  if (typeof window === 'undefined') return;
  setLocalStorage('fmpApiKey', apiKey);
};

export const getLocalOpenAIApiKey = () => {
  if (typeof window === 'undefined') return null;
  return getLocalStorage('openaiApiKey');
};