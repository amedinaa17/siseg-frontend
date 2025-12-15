import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const esWeb = Platform.OS === "web";

/**
 * Para web usa `sessionStorage`
 * Para móvil usa `AsyncStorage`
*/

// Guarda un valor asociado a una clave
export const almacenamiento = {
  async guardarItem(clave: string, valor: string) {
    if (esWeb) {
      sessionStorage.setItem(clave, valor);
      return;
    }
    await AsyncStorage.setItem(clave, valor);
  },

  // Obtiene el valor asociado a una clave
  async obtenerItem(clave: string) {
    if (esWeb) {
      return sessionStorage.getItem(clave);
    }
    return await AsyncStorage.getItem(clave);
  },

  // Elimina el valor asociado a una clave
  async eliminarItem(clave: string) {
    if (esWeb) {
      sessionStorage.removeItem(clave);
      return;
    }
    await AsyncStorage.removeItem(clave);
  },
};
