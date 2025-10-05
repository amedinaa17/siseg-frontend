import AsyncStorage from "@react-native-async-storage/async-storage";

const esWeb = typeof window !== "undefined" && window.localStorage;

export const storage = {
  async setItem(key: string, value: string) {
    if (esWeb) {
      localStorage.setItem(key, value);
    } else {
      await AsyncStorage.setItem(key, value);
    }
  },
  async getItem(key: string) {
    if (esWeb) {
      return localStorage.getItem(key);
    } else {
      return await AsyncStorage.getItem(key);
    }
  },
  async removeItem(key: string) {
    if (esWeb) {
      localStorage.removeItem(key);
    } else {
      await AsyncStorage.removeItem(key);
    }
  }
};
