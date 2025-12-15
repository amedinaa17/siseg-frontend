import { almacenamiento } from "@/lib/almacenamiento";
import { fetchData, postData } from "@/servicios/api";
import { jwtDecode } from "jwt-decode";

// Margen para renovar 1 minuto antes de expirar
const REFRESH_MARGIN = 1 * 60;

// Función para verificar el token
export const verificarJWT = async () => {
    const token = await almacenamiento.obtenerItem("token");

    if (!token) return null;

    try {
        const tokenDecodificado: any = jwtDecode(token);  // Decodificar el JWT
        const currentTime = Date.now() / 1000;  // Tiempo actual en segundos

        if (tokenDecodificado.exp > currentTime + REFRESH_MARGIN) {
            // Si el token es válido, devolvemos los datos del usuario
            return {
                token: token,
                boleta: tokenDecodificado.id,
                rol: tokenDecodificado.rol,
                nombre: tokenDecodificado.username,
                estatus: tokenDecodificado.estatus,
                perfil: tokenDecodificado.perfil || 0,
            };
        } else if (tokenDecodificado.exp > currentTime) {
            // Token válido pero por expirar
            return await refreshToken(token);
        }
        else {
            // Si el token ha expirado, lanzamos un error
            await almacenamiento.eliminarItem("token");
            throw new Error("La sesión ha expirado, por favor inicia sesión nuevamente.");
        }
    } catch (error) {
        await almacenamiento.eliminarItem("token");
        throw new Error("La sesión ha expirado. Inicia sesión de nuevo para continuar.");
    }
};

// Función para renovar el token
export const refreshToken = async (tk: string) => {
    try {
        const response = await fetchData(`users/refreshToken?tk=${tk}`);
        if (response.error === 0 && response.token) {
            await almacenamiento.guardarItem("token", response.token);
            
            const tokenDecodificado: any = jwtDecode(response.token);
            return {
                token: response.token,
                boleta: tokenDecodificado.id,
                rol: tokenDecodificado.rol,
                nombre: tokenDecodificado.username,
                estatus: tokenDecodificado.estatus,
                perfil: tokenDecodificado.perfil || 0,
            };
        } else {
            await almacenamiento.eliminarItem("token");
            throw new Error("La sesión ha expirado. Inicia sesión de nuevo para continuar.");
        }
    } catch (error) {
        await almacenamiento.eliminarItem("token");
        throw new Error("La sesión ha expirado. Inicia sesión de nuevo para continuar.");
    }
};

// Función para iniciar sesión
export const login = async (boleta: string, password: string) => {
    try {
        const data = await postData("users/loginuser", { boleta, password });
        if (data.error === 0) {
            const tokenDecodificado: any = jwtDecode(data.token);
            await almacenamiento.guardarItem("token", data.token);
            return {
                token: data.token,
                boleta: tokenDecodificado.id,
                rol: tokenDecodificado.rol,
                nombre: tokenDecodificado.username,
                estatus: tokenDecodificado.estatus,
                perfil: tokenDecodificado.perfil || 0,
            };
        } else {
            throw new Error(data.error);
        }
    } catch (error: any) {
        if (error.message === "1") {
            throw new Error("Boleta o contraseña incorrectos");
        } else {
            throw new Error("Error al conectar con el servidor. Inténtalo de nuevo más tarde.");
        }
    }

};

// Función para cerrar sesión
export const logout = async () => {
    try {
        await almacenamiento.eliminarItem("token");
    } catch (error) {
        throw new Error("Error al cerrar sesión");
    }
};
