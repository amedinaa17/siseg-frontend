import React, { useEffect, useMemo } from "react";

export type PuntoConPlaza = {
  sede: string;
  ubicacion: string;
  latitude: number | null;
  longitude: number | null;
  plaza?: { PROGRAMA?: string; CARRERA?: string };
};

type Props = {
  puntos: PuntoConPlaza[];
  puntoSeleccionado?: PuntoConPlaza | null;
  onMarkerPress?: (p: PuntoConPlaza) => void;
};

export default function WebMap({ puntos, puntoSeleccionado, onMarkerPress }: Props) {
  const [leaflet, setLeaflet] = React.useState<any>(null);
  const [customIcon, setCustomIcon] = React.useState<any>(null);

  useEffect(() => {
    const id = "leaflet-css";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
      link.crossOrigin = "";
      document.head.appendChild(link);
    }

    (async () => {
      const [rl, L] = await Promise.all([import("react-leaflet"), import("leaflet")]);
      const Leaflet = (L as any).default || L;

      const icon = Leaflet.icon({
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png",
        iconRetinaUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      setLeaflet({ rl, L: Leaflet });
      setCustomIcon(icon);
    })();
  }, []);

  const validos = useMemo(() => puntos.filter(p => p.latitude && p.longitude), [puntos]);

  if (!leaflet) {
    return <div style={{ height: 520, borderRadius: 12, border: "1px solid #e5e7eb" }} />;
  }

  const { rl } = leaflet;
  const { MapContainer, TileLayer, Marker, Popup, useMap } = rl;

  const FlyToSelected: React.FC<{ punto?: PuntoConPlaza | null }> = ({ punto }) => {
    const map = useMap();
    useEffect(() => {
      if (punto?.latitude && punto?.longitude) {
        map.flyTo([Number(punto.latitude), Number(punto.longitude)], 14, { duration: 0.8 });
      }
    }, [punto, map]);
    return null;
  };

  const center = validos.length
    ? [Number(validos[0].latitude), Number(validos[0].longitude)]
    : [19.4326, -99.1332]; // CDMX fallback

  return (
    <div style={{ height: 520, borderRadius: 12, overflow: "hidden", border: "1px solid #e5e7eb" }}>
      <MapContainer center={center as any} zoom={5} style={{ height: "520px", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <FlyToSelected punto={puntoSeleccionado} />
        {validos.map((p, idx) => (
          <Marker
            key={`${p.sede}-${idx}`}
            position={[Number(p.latitude), Number(p.longitude)] as any}
            eventHandlers={{ click: () => onMarkerPress?.(p) }}
            icon={customIcon || undefined}
          >
            <Popup>
              <div style={{ minWidth: 220 }}>
                <strong>{p.sede}</strong>
                <div style={{ fontSize: 12, marginTop: 4 }}>{p.ubicacion}</div>
                {p.plaza?.PROGRAMA && (
                  <div style={{ fontSize: 12, marginTop: 6 }}>
                    Programa: <b>{p.plaza.PROGRAMA}</b>
                  </div>
                )}
                {p.plaza?.CARRERA && (
                  <div style={{ fontSize: 12 }}>
                    Carrera: <b>{p.plaza.CARRERA}</b>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
