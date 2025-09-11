import * as SecureStore from "expo-secure-store";

const web = typeof window !== "undefined" && window.localStorage;

export const sessionStorage = {
  // Obtener item del almacenamiento
  async getItem(key: string) {
    if (web) {
      // Si es web, usar localStorage
      return window.localStorage.getItem(key);
    } else {
      // Si no es web (es Android/iOS), usar expo-secure-store
      return await SecureStore.getItemAsync(key);
    }
  },

  // Guardar item en el almacenamiento
  async setItem(key: string, value: string) {
    if (web) {
      // Si es web, usar localStorage
      window.localStorage.setItem(key, value);
    } else {
      // Si no es web (es Android/iOS), usar expo-secure-store
      await SecureStore.setItemAsync(key, value);
    }
  },

  // Eliminar item del almacenamiento
  async removeItem(key: string) {
    if (web) {
      // Si es web, usar localStorage
      window.localStorage.removeItem(key);
    } else {
      // Si no es web (es Android/iOS), usar expo-secure-store
      await SecureStore.deleteItemAsync(key);
    }
  },
};
