<script>
  import { App, Page } from "konsta/svelte";
  import Chats from "./screens/chats.svelte";
  import Router from "./lib/components/Router.svelte";
</script>

<!-- App component ideally should be the main root component -->
<App theme="ios" safeAreas>
  <!-- rest of Konsta UI components -->
  <Router />
</App>
