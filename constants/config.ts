import Constants from 'expo-constants';

const getApiBaseUrl = () => {
  const expoConfig = Constants.expoConfig?.extra?.apiBaseUrl;
  
  if (expoConfig) {
    // Use __DEV__ to determine environment
    const environment = __DEV__ ? 'development' : 'production';
    const url = expoConfig[environment];
    
    if (url) {
      return url;
    }
  }
  
  // Fallback
  if (__DEV__) return 'http://localhost:3000/api/v1'

  // Use this domain if running on device in development
  // return 'http://10.0.0.238:3000/api/v1' 
  
  return 'https://personal-coach-server-c405d49500bf.herokuapp.com/api/v1';
};

export const API_BASE_URL = getApiBaseUrl();