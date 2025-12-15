import { Platform } from "react-native";

// Verifica si el entorno es web
const esWeb = Platform.OS === "web";

// Canal para comunicación entre pestañas
const CANAL = "siseg-sesion-unica";

// Claves de almacenamiento
const ID_DUENIO = "sesion_owner";       // localStorage
const ID_PESTANA = "tab_id";     // sessionStorage

// Tiempo máximo para considerar viva una pestaña (ms)
const TTL = 5000;

// Obtiene el timestamp actual
function ahora() {
    return Date.now();
}

// Obtiene (si no existe, genera) el ID único de la pestaña
function obtenerIdPestana(): string {
    let id = sessionStorage.getItem(ID_PESTANA);
    if (!id) {
        id = crypto.randomUUID();
        sessionStorage.setItem(ID_PESTANA, id);
    }
    return id;
}

// Lee al dueño actual de la sesión desde localStorage
function leerDuenio(): { idPestana: string; ts: number } | null {
    const raw = localStorage.getItem(ID_DUENIO);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

// Escribe/actualiza el dueño de la sesión
function escribirDuenio(idPestana: string) {
    localStorage.setItem(ID_DUENIO, JSON.stringify({ idPestana, ts: ahora() }));
}

// Libera al dueño SOLO si esta pestaña es la dueña
export function liberarSesionUnica() {
  if (!esWeb) return;
  const idPestana = sessionStorage.getItem(ID_PESTANA);
  const duenio = leerDuenio();
  if (duenio && duenio.idPestana === idPestana) {
    localStorage.removeItem(ID_DUENIO);
  }
}

// Activa la protección de sesión única por pestaña
export function activarSesionUnica(onBloquear: () => void) {
    if (!esWeb) return () => { };

    const idPestana = obtenerIdPestana();      // Se mantiene en refresh
    const idInstancia = crypto.randomUUID();   // Único por carga
    const canal = new BroadcastChannel(CANAL);

    let bloqueado = false;

    // Ejecuta el bloqueo solo una vez
    const bloquear = () => {
        if (bloqueado) return;
        bloqueado = true;
        try { canal.close(); } catch { }
        onBloquear();
    };

    // Si ya existe un dueño válido y no es la pestaña actual, bloquea
    const duenio = leerDuenio();
    if (duenio && duenio.idPestana !== idPestana && ahora() - duenio.ts < TTL) {
        bloquear();
        return () => { };
    }

    // Reclamamos/renovamos la sesión como dueños
    escribirDuenio(idPestana);

    // Heartbeat para mantener viva la sesión mientras la pestaña exista
    const latido = setInterval(() => {
        const d = leerDuenio();
        if (!d || d.idPestana === idPestana) escribirDuenio(idPestana);
    }, TTL / 2);

    // Detecta pestañas duplicadas mediante mensajes PING/PONG
    canal.onmessage = (e) => {
        const msg = e.data;

        if (msg?.type === "PING" && msg.idPestana === idPestana) {
            if (msg.idInstancia !== idInstancia) {
                canal.postMessage({ type: "PONG", idPestana, to: msg.idInstancia });
            }
        }

        if (msg?.type === "PONG" && msg.idPestana === idPestana && msg.to === idInstancia) {
            bloquear();
        }
    };

    // Pregunta si existe otra instancia viva de esta pestaña
    canal.postMessage({ type: "PING", idPestana, idInstancia });

    // Detecta cambios de dueño desde otras pestañas
    const onCambiarStorage = (ev: StorageEvent) => {
        if (ev.key !== ID_DUENIO) return;
        const d = leerDuenio();
        if (d && d.idPestana !== idPestana && ahora() - d.ts < TTL) bloquear();
    };
    window.addEventListener("storage", onCambiarStorage);

    // Limpieza al desmontar
    return () => {
        clearInterval(latido);
        window.removeEventListener("storage", onCambiarStorage);
        try { canal.close(); } catch { }
    };
}
