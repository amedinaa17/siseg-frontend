import React, { useEffect, useMemo, useRef } from "react";
import { Text, View } from "react-native";
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from "react-native-maps";

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

export default function NativeMap({ puntos, puntoSeleccionado, onMarkerPress }: Props) {
  const mapRef = useRef<MapView>(null);
  const validos = useMemo(() => puntos.filter(p => p.latitude && p.longitude), [puntos]);

  useEffect(() => {
    if (puntoSeleccionado?.latitude && puntoSeleccionado?.longitude) {
      mapRef.current?.animateCamera(
        {
          center: { latitude: Number(puntoSeleccionado.latitude), longitude: Number(puntoSeleccionado.longitude) },
          zoom: 14,
        },
        { duration: 800 }
      );
    }
  }, [puntoSeleccionado]);

  const initialRegion = validos.length
    ? { latitude: Number(validos[0].latitude), longitude: Number(validos[0].longitude), latitudeDelta: 6, longitudeDelta: 6 }
    : { latitude: 19.4326, longitude: -99.1332, latitudeDelta: 6, longitudeDelta: 6 };

  return (
    <MapView ref={mapRef} style={{ height: 520, width: "100%", borderRadius: 12 }} provider={PROVIDER_GOOGLE} initialRegion={initialRegion}>
      {validos.map((p, idx) => (
        <Marker key={`${p.sede}-${idx}`} coordinate={{ latitude: Number(p.latitude), longitude: Number(p.longitude) }} onPress={() => onMarkerPress?.(p)} title={p.sede} description={p.ubicacion}>
          <Callout onPress={() => onMarkerPress?.(p)}>
            <View style={{ maxWidth: 220 }}>
              <Text allowFontScaling={false} style={{ fontWeight: "600" }}>{p.sede}</Text>
              <Text allowFontScaling={false} style={{ marginTop: 4 }}>{p.ubicacion}</Text>
              {!!p.plaza?.PROGRAMA && <Text allowFontScaling={false} style={{ marginTop: 6 }}>Programa: <Text allowFontScaling={false} style={{ fontWeight: "600" }}>{p.plaza.PROGRAMA}</Text></Text>}
              {!!p.plaza?.CARRERA && <Text>Carrera: <Text allowFontScaling={false} style={{ fontWeight: "600" }}>{p.plaza.CARRERA}</Text></Text>}
            </View>
          </Callout>
        </Marker>
      ))}
    </MapView>
  );
}
