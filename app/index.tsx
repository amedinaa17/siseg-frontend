import { useAuth } from "@/context/AuthProvider";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function Index() {
    const { sesion, cargando } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!sesion) {
            router.replace("/(auth)/iniciar-sesion");
            return;
        }

        if (sesion.rol === "ALUMNO") {
        router.replace("/(app)/(alumno)/inicio-alumno");
        return;
    }

    if (sesion.rol === "P_ADMIN") {
        router.replace("/(app)/(administrativo)/inicio-administrativo");
        return;
    }
}, [sesion, cargando, router]);
}
