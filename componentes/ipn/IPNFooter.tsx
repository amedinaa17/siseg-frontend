import React, { useEffect, useMemo, useState } from "react";
import { Linking, Platform, View } from "react-native";
const WebViewComp: any = Platform.OS === "web" ? null : require("react-native-webview").WebView;

export default function IPNFooterOnly() {
  const [alto, setAlto] = useState(245);

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
            html, body { margin: 0; padding: 0; background: transparent; overflow: hidden; }
            footer, .footer, .site-footer { width: 100%; }
          </style>
        </head>
        <body>
          <div class="footer-ipn">
            <div class="container">
              <div class="row d-flex align-items-center">
                <div class="col-lg-4 text-center">
                  <img src="${BASE}/assets/files/main/img/template/footer/pleca-educacion-footer.png" class="img-fluid logo-educacion-footer" alt="Logotipo SEP">
                </div>
                <div class="col-lg-8 px-5">
                  <p>INSTITUTO POLITÉCNICO NACIONAL</p>
                  <p>D.R. Instituto Politécnico Nacional (IPN). Av. Luis Enrique Erro S/N, 
                  Unidad Profesional Adolfo López Mateos, Zacatenco, Alcaldía Gustavo A. Madero, 
                  C.P. 07738, Ciudad de México. Conmutador: 55 57 29 60 00 / 55 57 29 63 00.</p>
                  <p class="mb-0">Esta página es una obra intelectual protegida por la Ley 
                  Federal del Derecho de Autor, puede ser reproducida con fines no lucrativos, 
                  siempre y cuando no se mutile, se cite la fuente completa y su dirección 
                  electrónica; su uso para otros fines, requiere autorización previa y por escrito 
                  de la Dirección General del Instituto.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- JS: Bootstrap + script general IPN -->
          <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/js/bootstrap.bundle.min.js"></script>
          <script src="${BASE}/assets/files/main/js/index.js"></script>

          <script>
            (function(){
              function sendHeight(){
                var h = document.body.scrollHeight || document.documentElement.scrollHeight || 245;
                if (parent && parent.postMessage) parent.postMessage({ __ipnFooterOnlyHeight: h }, "*");
                if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(String(h));
              }
              try{
                var ro = new ResizeObserver(function(){ setTimeout(sendHeight, 30); });
                ro.observe(document.body);
              }catch(e){ console.error(e); }
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
    [BASE]
  );

  // Web (iframe)
  if (Platform.OS === "web") {
    useEffect(() => {
      const handler = (ev: MessageEvent) => {
        const data = ev.data as any;
        if (data && typeof data.__ipnFooterOnlyHeight === "number") {
          const h = Math.max(245, Math.min(450, data.__ipnFooterOnlyHeight));
          setAlto(h);
        }
      };
      window.addEventListener("message", handler);
      return () => window.removeEventListener("message", handler);
    }, []);

    return (
      <div style={{ height: alto, width: "100%" }}>
        <iframe
          title=""
          style={{
            border: 0,
            width: "100%",
            height: "100%",
            background: "#333",
            display: "block",
          }}
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
        javaScriptEnabled
        domStorageEnabled
        setSupportMultipleWindows={false}
        scrollEnabled={false}
        onMessage={(e: any) => {
          const h = parseInt(e.nativeEvent.data, 10);
          if (Number.isFinite(h)) {
            const clamped = Math.max(245, Math.min(450, h));
            setAlto(clamped);
          }
        }}
        onShouldStartLoadWithRequest={(req: any) => {
          const url = req?.url || "";
          if (!url || url.startsWith("about:blank")) return true;

          if (url.includes("#") && url.split("#")[0] === "about:blank") return true;

          Linking.openURL(url).catch(() => {});
          return false;
        }}
        style={{ backgroundColor: "#333" }}
      />
    </View>
  );
}
