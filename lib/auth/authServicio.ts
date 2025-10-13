import { storage } from "@/lib/almacenamiento";
import { postData } from "@/servicios/api";
import { jwtDecode } from "jwt-decode";

// Función para verificar el token
export const verificarJWT = async () => {
    const token = await storage.getItem("token");

    if (token) {
        const tokenDecodificado: any = jwtDecode(token);  // Decodificar el JWT
        const currentTime = Date.now() / 1000;  // Tiempo actual en segundos

        if (tokenDecodificado.exp > currentTime) {
            // Si el token es válido, devolvemos los datos del usuario
            return {
                token: token,
                boleta: tokenDecodificado.id,
                rol: tokenDecodificado.rol,
                nombre: tokenDecodificado.username,
            };
        } else {
            // Si el token ha expirado, lanzamos un error
            await storage.removeItem("token");
            throw new Error("La sesión ha expirado, por favor inicia sesión nuevamente.");
        }
    }
};

// Función para iniciar sesión
export const login = async (boleta: string, password: string) => {
    try {
        const data = await postData("users/loginuser", { boleta, password });
        if (data.error === 0) {
            const tokenDecodificado: any = jwtDecode(data.token);
            await storage.setItem("token", data.token);
            return {
                token: data.token,
                boleta: tokenDecodificado.id,
                rol: tokenDecodificado.rol,
                nombre: tokenDecodificado.username,
            };
        } else {
            throw new Error(data.error);
        }
    } catch (error: any) {
        if (error.message === "1") {
            throw new Error("Boleta o contraseña incorrectos.");
        } else {
            throw new Error("Error al conectar con el servidor. Inténtalo de nuevo más tarde.");
        }
    }

};

// Función para cerrar sesión
export const logout = async () => {
    try {
        await storage.removeItem("token");
    } catch (error) {
        throw new Error("Error al cerrar sesión");
    }
};
