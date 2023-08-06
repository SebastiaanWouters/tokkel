<script lang="ts">
  import { Capacitor } from "@capacitor/core";
  import { pb, currentUser } from "./lib/pocketbase";
  import { path, resolve, params, match, goto, searchParams } from "elegua";
  import Login from "./screens/Login.svelte";
  import Register from "./screens/Register.svelte";
  import Chat from "./screens/Chat.svelte";
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { OnMount } from "fractils";
  import MobileContainer from "./lib/components/MobileContainer.svelte";
  import NavLayout from "./screens/NavLayout.svelte";
  import NavBar from "./lib/components/NavBar.svelte";
  import Chats from "./screens/Chats.svelte";
  import Settings from "./screens/Settings.svelte";
  import { publicRoutes } from "./lib/utils";
  import { QueryClientProvider, QueryClient } from "@sveltestack/svelte-query";
  import RealtimeProvider from "./lib/components/RealtimeProvider.svelte";
  import ChatProvider from "./lib/components/ChatProvider.svelte";

  const queryClient = new QueryClient();

  let platform = Capacitor.getPlatform();

  onMount(() => {
    console.log("current user: " + $currentUser.id);
    if (
      ($path.endsWith("/login") || $path.endsWith("/register")) &&
      $currentUser
    ) {
      goto("/chat");
    }
  });

  $: if ($currentUser) {
    if ($path.includes(publicRoutes[0]) || $path.includes(publicRoutes[1])) {
      goto("/chat");
    }
  } else {
    if (!($path.includes(publicRoutes[0]) || $path.includes(publicRoutes[1]))) {
      goto("/login");
    }
  }
</script>

<main
  class="bg-gray-50 dark:bg-neutral-900 mx-auto flex justify-center items-center min-h-screen h-screen"
>
  <QueryClientProvider client={queryClient}>
    <OnMount>
      <MobileContainer>
        {#if !$currentUser}
          <div class="fill" in:fade>
            {#if $path === "/register"}
              <div class="fill" in:fade><Register /></div>
            {:else if resolve($path, "/login")}
              <div class="fill" in:fade>
                <Login message={$searchParams.get("message")} />
              </div>
            {/if}
          </div>
        {/if}

        {#if $currentUser}
          <ChatProvider>
            <RealtimeProvider>
              <div class="fill" in:fade>
                {#if resolve($path, "/chat")}
                  <div class="fill">
                    <NavLayout
                      ><div slot="topNav" />
                      <div slot="middle" class="fill"><Chats /></div>
                      <NavBar slot="bottomNav" />
                    </NavLayout>
                  </div>
                {:else if resolve($path, "/chat/:user")}
                  <div class="fill">
                    <NavLayout
                      ><div slot="topNav" />
                      <div slot="middle" class="fill"><Chat /></div>
                    </NavLayout>
                  </div>
                {:else if resolve($path, "/settings")}
                  <div class="fill">
                    <NavLayout
                      ><div slot="topNav" />
                      <div slot="middle" class="fill"><Settings /></div>
                      <NavBar slot="bottomNav" /></NavLayout
                    >
                  </div>
                {:else}
                  <h1>404</h1>
                  <p>Not found: {$path}</p>
                {/if}
              </div>
            </RealtimeProvider>
          </ChatProvider>
        {/if}
      </MobileContainer>
    </OnMount>
  </QueryClientProvider>
</main>

<style>
</style>
