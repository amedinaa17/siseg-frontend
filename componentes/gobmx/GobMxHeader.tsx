import React, { useEffect, useMemo, useState } from "react";
import { Linking, Platform, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const WebViewComp: any = Platform.OS === "web" ? null : require("react-native-webview").WebView;

export default function GobMxHeader({
  ambiente = process.env.EXPO_PUBLIC_GOBMX_ENV === "qa" ? "qa" : "prod"
}: any) {
  const [alto, setAlto] = useState(86.6);

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
              function selectHeader(){
                return document.querySelector("header")
              }
              function selectFooter(){
                return document.querySelector("footer") ||
                      document.querySelector(".site-footer") ||
                      document.querySelector(".footer");
              }
              function kill(nodes){
                nodes.forEach(function(n){ if(n && n.parentNode){ n.parentNode.removeChild(n); } });
              }
              function onReady(){
                kill([document.querySelector("main.page"), selectFooter()]);
                var hd = selectHeader();
                if(!hd){ return; }
                try{
                  var ro = new ResizeObserver(function(){ setTimeout(sendHeight, 30); });
                  ro.observe(hd);
                }catch(e){}
                sendHeight();
                setTimeout(sendHeight, 120);
                setTimeout(sendHeight, 300);
                setTimeout(sendHeight, 800);
              }
              function waitGmx(n){
                if (window.$gmx && window.$gmx(document).ready) {
                  window.$gmx(document).ready(function(){
                    var hd = selectHeader();
                    if(hd){ onReady(); return; }
                    var mo = new MutationObserver(function(){
                      if(selectHeader()){ mo.disconnect(); onReady(); }
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

  // WEB (iframe con srcDoc)
  if (Platform.OS === "web") {
    useEffect(() => {
      const handler = (ev: MessageEvent) => {
        const data = ev.data as any;
        if (data && typeof data.__headerHeight === "number") {
          const h = Math.max(86.6, Math.min(150, data.__headerHeight));
          setAlto(h);
        }
      };
      window.addEventListener("message", handler);
      return () => window.removeEventListener("message", handler);
    }, []);

    return (
      <div style={{ height: alto }}>
        <iframe
          title=""
          style={{ border: 0, width: "100%", height: "100%", background: "#611232" }}
          srcDoc={html}
          sandbox="allow-scripts allow-forms allow-popups"
        />
      </div>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={{ backgroundColor: "#611232", width: "100%" }}>
      <View style={{ height: alto }}>
        <WebViewComp
          originWhitelist={["*"]}
          source={{ html }}
          onMessage={(e: any) => {
          const h = parseInt(e.nativeEvent.data, 10);
          if (Number.isFinite(h)) {
            const clamped = Math.max(86.6, Math.min(150, h));
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
    </SafeAreaView>
  );
}
