<script lang="ts">
  import { Capacitor } from "@capacitor/core";
  import {
    pb,
    currentUser,
    currentKey,
    isAuthenticated,
  } from "./lib/pocketbase";
  import { path, resolve, params, match, goto, searchParams } from "elegua";
  import Login from "./screens/Login.svelte";
  import Register from "./screens/Register.svelte";
  import Chat from "./screens/Chat.svelte";
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { OnMount } from "fractils";
  import MobileContainer from "./lib/components/MobileContainer.svelte";
  import NavLayout from "./screens/NavLayout.svelte";
  import NavBar from "./lib/components/NavBar.svelte";
  import Chats from "./screens/Chats.svelte";
  import Settings from "./screens/Settings.svelte";
  import { publicRoutes } from "./lib/utils";

  let platform = Capacitor.getPlatform();

  onMount(() => {
    console.log($currentUser);
    if (
      ($path.endsWith("/login") || $path.endsWith("/register")) &&
      $currentUser &&
      $currentKey
    ) {
      goto("/home");
    }
  });

  $: if ($isAuthenticated) {
    if ($path.includes(publicRoutes[0]) || $path.includes(publicRoutes[1])) {
      goto("/home");
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
  <OnMount>
    <MobileContainer>
      {#if $path === "/register"}
        <div class="fill" in:fade><Register /></div>
      {:else if resolve($path, "/home")}
        <div class="fill" in:fade>
          <NavLayout
            ><div slot="topNav" />
            <div slot="middle" class="fill"><Chats /></div>
            <NavBar slot="bottomNav" /></NavLayout
          >
        </div>
      {:else if resolve($path, "/chat/:user")}
        <div class="fill">
          <NavLayout
            ><div slot="topNav" />
            <div slot="middle" class="fill"><Chat /></div>
            <div slot="bottomNav" /></NavLayout
          >
        </div>
      {:else if resolve($path, "/settings")}
        <div class="fill" in:fade>
          <NavLayout
            ><div slot="topNav" />
            <div slot="middle" class="fill"><Settings /></div>
            <NavBar slot="bottomNav" /></NavLayout
          >
        </div>
      {:else if resolve($path, "/login")}
        <div class="fill" in:fade>
          <Login message={$searchParams.get("message")} />
        </div>
      {:else}
        <h1>404</h1>
        <p>Not found: {$path}</p>
      {/if}
    </MobileContainer>
  </OnMount>
</main>

<style>
</style>
