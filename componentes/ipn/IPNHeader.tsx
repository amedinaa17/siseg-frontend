import React, { useEffect, useMemo, useState } from "react";
import { Linking, Platform, View } from "react-native";
const WebViewComp: any = Platform.OS === "web" ? null : require("react-native-webview").WebView;

export default function IPNHeaderOnly() {
  const [alto, setAlto] = useState(170);

  const BASE = "https://www.ipn.mx";

  const htmlDoc = useMemo(
    () => `<!doctype html>
      <html lang="es">
        <head>
          <base target="_top">
          <meta charset="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1"/>
          <!-- Bootstrap -->
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css"/>
          <!-- Estilos IPN -->
          <link rel="stylesheet" href="${BASE}/assets/files/main/css/style-template.css"/>
          <link rel="stylesheet" href="${BASE}/assets/files/main/css/style.css"/>
          <style>
            html,body{margin:0;padding:0;background:transparent;overflow:hidden}
            .menu-principal.sticky-top{top:0;z-index:999}
            .u-oculto{display:none!important}
          </style>
        </head>
        <body>
          <div>
            <div class="container encabezado-ipn">
              <div class="utilerias-header text-right">
                <ul class="list-inline text-end utilerias-list">
                  <li class="list-inline-item"><a href="${BASE}/directorio-telefonico.html">DIRECTORIO</a> |</li>
                  <li class="list-inline-item"><a href="${BASE}/correo-electronico.html">CORREO</a> |</li>
                  <li class="list-inline-item"><a href="${BASE}/calendario-academico.html">CALENDARIO</a> |</li>
                  <li class="list-inline-item"><a href="${BASE}/transparencia/">TRANSPARENCIA</a> |</li>
                  <li class="list-inline-item"><a href="${BASE}/proteccion-datos-personales/">PROTECCIÓN DE DATOS</a></li>
                </ul>
              </div>

              <div class="header-container">
                <div class="container">
                  <div class="row"><div class="col-md-12">
                    <a href="https://www.gob.mx/sep" class="d-inline enlace-educacion" aria-label="Secretaría de Educación Pública">
                      <img src="${BASE}/assets/files/main/img/template/header/pleca-educacion.svg" class="logo-educacion" alt="SEP">
                    </a>
                    <a href="https://ipn.mx/">
                      <img src="${BASE}/assets/files/main/img/template/header/logo-ipn-horizontal.svg" class="logo-ipn" alt="IPN">
                    </a>
                  </div></div>
                </div>
              </div>
            </div>
          </div>

          <!-- JS: Bootstrap + script del IPN -->
          <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/js/bootstrap.bundle.min.js"></script>
          <script src="${BASE}/assets/files/main/js/index.js"></script>

          <script>
            (function(){
              function sendHeight(){
                var h = document.body.scrollHeight || document.documentElement.scrollHeight || 170;
                if (parent && parent.postMessage) parent.postMessage({ __ipnHeaderOnlyHeight: h }, "*");
                if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(String(h));
              }
              try{
                var ro = new ResizeObserver(function(){ setTimeout(sendHeight, 30); });
                ro.observe(document.body);
              }catch(e){}
              window.addEventListener('load', function(){
                sendHeight();
                setTimeout(sendHeight,120);
                setTimeout(sendHeight,300);
                setTimeout(sendHeight,800);
              });
            })();
          </script>
        </body>
      </html>`,
    [BASE, 154]
  );

  // Web (iframe)
  if (Platform.OS === "web") {
    useEffect(() => {
      const handler = (ev: MessageEvent) => {
        const data = ev.data as any;
        if (data && typeof data.__ipnHeaderOnlyHeight === "number") {
          const h = Math.max(154, Math.min(200, data.__ipnHeaderOnlyHeight));
        }
      };
      window.addEventListener("message", handler);
      return () => window.removeEventListener("message", handler);
    }, []);

    return (
      <div style={{ height: alto }}>
        <iframe
          title=""
          style={{ border: 0, width: "100%", height: "100%", background: "transparent" }}
          srcDoc={htmlDoc}
          sandbox="allow-scripts allow-forms allow-popups"
        />
      </div>
    );
  }

  // Nativo (WebView)
  return (
    <View style={{ height: alto }}>
      <WebViewComp
        originWhitelist={["*"]}
        source={{ html: htmlDoc }}
        onMessage={(e: any) => {
          const h = parseInt(e.nativeEvent.data, 10);
          if (Number.isFinite(h)) {
            const clamped = Math.max(154, Math.min(200, h));
            setAlto(clamped);
          }
        }}
        javaScriptEnabled
        domStorageEnabled
        setSupportMultipleWindows={false}
        scrollEnabled={false}
        onShouldStartLoadWithRequest={(req: any) => {
          const url = req?.url || "";
          if (!url || url.startsWith("about:blank")) return true;

          if (url.includes("#") && url.split("#")[0] === "about:blank") return true;

          Linking.openURL(url).catch(() => { });
          return false;
        }}
        style={{ backgroundColor: "transparent" }}
      />
    </View>
  );
}
