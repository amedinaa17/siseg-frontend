import React, { useEffect, useMemo, useState } from "react";
import { Image, Linking, Platform, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const WebViewComp: any = Platform.OS === "web" ? null : require("react-native-webview").WebView;

export default function GobMxFooter({
  ambiente = "prod" // qa
}: any) {
  const [alto, setAlto] = useState(425);

  const BASE =
    ambiente === "qa"
      ? "https://framework-gb.cdn.gob.mx/gm/v3/qa"
      : "https://framework-gb.cdn.gob.mx/gm/v3";

  const html = useMemo(
    () => `<!doctype html>
        <html lang="es">
          <head>
            <base target="_top">
            <meta charset="utf-8"/>
            <meta name="viewport" content="width=device-width,initial-scale=1"/>
            <link rel="stylesheet" href="${BASE}/assets/styles/main.css">
            <style>
              html,body{margin:0;padding:0;background:transparent;overflow:hidden}
              /* Evita colapsos por flotados/position */
              footer, .footer, .site-footer { width: 100%; }
            </style>
          </head>
          <body>
            <!-- Hook requerido por gob.mx -->
            <main class="page"></main>

            <script src="${BASE}/assets/js/gobmx.js"></script>

            <!-- Abrir enlaces fuera del iframe -->
            <script>
              (function(){
                document.addEventListener('click', function(e){
                  var a = e.target && e.target.closest && e.target.closest('a[href]');
                  if(!a) return;
                  var href = a.getAttribute('href') || '';
                  if(href && href[0] === '#') return; // deja anclas internas
                  e.preventDefault();
                  try {
                    if (href.startsWith('mailto:') || href.startsWith('tel:')) {
                      window.top.location.href = href;
                    } else {
                      window.top.location.assign(a.href);
                    }
                  } catch(_) {
                    window.open(a.href, '_top');
                  }
                }, true);
              })();
            </script>

            <script>
              (function boot(){
                function selectFooter(){
                  return document.querySelector("footer") ||
                        document.querySelector(".site-footer") ||
                        document.querySelector(".footer");
                }
                function selectHeader(){
                  return document.querySelector("header")
                }
                function kill(nodes){
                  nodes.forEach(function(n){ if(n && n.parentNode){ n.parentNode.removeChild(n); } });
                }
                function sendHeight(){
                  var h = document.body.scrollHeight || document.documentElement.scrollHeight || 425;
                  parent.postMessage({ __gobmxFooterHeight: h }, "*");
                }
                function onReady(){
                  // quitar header y main
                  kill([selectHeader(), document.querySelector("main.page")]);
                  var fo = selectFooter();
                  if(!fo){ return; }
                }
                function waitGmx(n){
                  if (window.$gmx && window.$gmx(document).ready) {
                    window.$gmx(document).ready(function(){
                      // Espera a que el footer realmente exista en el DOM
                      var fo = selectFooter();
                      if(fo){ onReady(); return; }
                      var mo = new MutationObserver(function(){
                        if(selectFooter()){ mo.disconnect(); onReady(); }
                      });
                      mo.observe(document.body, { childList: true, subtree: true });
                    });
                  } else if(n>0){
                    setTimeout(function(){ waitGmx(n-1); }, 150);
                  }
                }
                waitGmx(50);
              })();
            </script>
          </body>
        </html>`,
    [BASE]
  );

  //  WEB (iframe con srcDoc)
  if (Platform.OS === "web") {
    useEffect(() => {
      const handler = (ev: MessageEvent) => {
        const data = ev.data as any;
        if (data && typeof data.__gobmxFooterHeight === "number") {
          const h = Math.max(360, Math.min(500, data.__gobmxFooterHeight));
          setAlto(h);
        }
      };
      window.addEventListener("message", handler);
      return () => window.removeEventListener("message", handler);
    }, []);

    return (
      <>
        <div style={{ height: alto }}>
          <iframe
            title=""
            style={{ border: 0, width: "100%", height: "100%", background: "#611232" }}
            srcDoc={html}
            sandbox="allow-scripts allow-forms allow-popups"
          />
        </div>
        <Image
          source={require('@/activos/imagenes/pleca.png')}
          style={{ width: "100%" }}
        />
      </>
    );
  }

  // NATIVO (WebView)
  return (
    <SafeAreaView edges={["top"]} style={{ backgroundColor: "#611232", width: "100%" }}>
      <View style={{ height: alto }}>
        <WebViewComp
          originWhitelist={["*"]}
          source={{ html }}
          onMessage={(e: any) => {
            const h = parseInt(e.nativeEvent.data, 10);
            if (Number.isFinite(h)) {
              const clamped = Math.max(360, Math.min(500, h));
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
          style={{ background: "#611232" }}
        />
      </View>
      <Image
        source={require('@/activos/imagenes/pleca.png')}
        style={{ width: "100%", height: 50 }}
      />
    </SafeAreaView>
  );
}
