import axios from "axios";
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.API_URL;

// GET
export const fetchData = async (endpoint: string) => {
  try {
    const response = await axios.get(`${API_URL}/${endpoint}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw new Error("Error al obtener datos");
  }
};

// POST
export const postData = async (endpoint: string, data: any) => {
  try {
    const response = await axios.post(`${API_URL}/${endpoint}`, data);
    return response.data;
  } catch (error) {
    console.error("Error posting data:", error);
    throw new Error("Error al enviar datos");
  }
};

// PUT
export const putData = async (endpoint: string, data: any) => {
  try {
    const response = await axios.put(`${API_URL}/${endpoint}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating data:", error);
    throw new Error("Error al actualizar datos");
  }
};

// DELETE
export const deleteData = async (endpoint: string) => {
  try {
    const response = await axios.delete(`${API_URL}/${endpoint}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting data:", error);
    throw new Error("Error al eliminar datos");
  }
};