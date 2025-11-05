import React from "react";

export default function NativeMap() {
  return (
    <div
      style={{
        height: 520,
        width: "100%",
        borderRadius: 12,
        border: "1px dashed #ccc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#888",
        fontSize: 14,
      }}
    >
      Mapa no disponible en web (usa la versión Leaflet)
    </div>
  );
}
