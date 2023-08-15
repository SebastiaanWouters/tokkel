<script lang="ts">
  import { onMount } from "svelte";
  import { getDevice } from "framework7/lite-bundle";
  import {
    f7,
    f7ready,
    App,
    Panel,
    Views,
    View,
    Popup,
    Page,
    Navbar,
    Toolbar,
    NavRight,
    Link,
    Block,
    BlockTitle,
    LoginScreen,
    LoginScreenTitle,
    List,
    ListItem,
    ListInput,
    ListButton,
    BlockFooter,
  } from "framework7-svelte";
  import { KonstaProvider } from "konsta/svelte";
  import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query";
  import capacitorApp from "../js/capacitor-app";
  import routes from "../js/routes";

  const device = getDevice();
  // Framework7 Parameters
  let f7params = {
    name: "Tokkel", // App name
    theme: "ios", // Automatic theme detection
    colors: {
      primary: "#ff6b22",
    },
    darkMode: true,

    // App routes
    routes: routes,

    // Register service worker (only on production build)
    serviceWorker:
      process.env.NODE_ENV === "production"
        ? {
            path: "/service-worker.js",
          }
        : {},
    // Input settings
    input: {
      scrollIntoViewOnFocus: device.capacitor,
      scrollIntoViewCentered: device.capacitor,
    },
    // Capacitor Statusbar settings
    statusbar: {
      iosOverlaysWebView: true,
      androidOverlaysWebView: false,
    },
  };

  onMount(() => {
    f7ready(() => {
      // Init capacitor APIs (see capacitor-app.js)
      if (f7.device.capacitor) {
        capacitorApp.init(f7);
      }
      // Call F7 APIs here
    });
  });

  const queryClient = new QueryClient();
</script>

<KonstaProvider dark theme="parent">
  <QueryClientProvider client={queryClient}>
    <App {...f7params}>
      <!-- Your main view, should have "view-main" class -->
      <View main class="safe-areas" url="/" />
    </App>
  </QueryClientProvider>
</KonstaProvider>
