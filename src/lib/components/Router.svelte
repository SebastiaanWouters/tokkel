<script lang="ts">
  import { path, params, resolve, goto } from "elegua";
  import Chats from "../../screens/chats.svelte";
  import Settings from "../../screens/settings.svelte";
  import { Icon, Navbar, Page, Tabbar, TabbarLink } from "konsta/svelte";
  import { Home, Settings2 } from "lucide-svelte";
  import Login from "../../screens/login.svelte";
  import Register from "../../screens/register.svelte";
  import { fly } from "svelte/transition";
</script>

{#if resolve($path, "/protected/:path")}
  <Page class="w-full h-full overflow-scroll no-scrollbar">
    <Navbar
      title={$params["path"] === "settings" ? "Settings" : "Messages"}
      large
      transparent
      centerTitle
    />

    <Tabbar class="m-1 p-1 left-0 bottom-0 fixed">
      <TabbarLink
        active={$params["path"] === "chats"}
        onClick={() => {
          goto("/protected/chats");
        }}
        label={"Chats"}
      >
        <Icon slot="icon" badgeColors={{ bg: "bg-green-500" }}>
          <Home slot="ios" class="w-5 h-5 transition-all" />
          <Home slot="material" class="w-5 h-5" />
        </Icon>
      </TabbarLink>
      <TabbarLink
        active={$params["path"] === "settings"}
        onClick={() => {
          goto("/protected/settings");
        }}
        label={"Settings"}
      >
        <svelte:fragment slot="icon"
          ><Icon slot="icon" badgeColors={{ bg: "bg-green-500" }}>
            <Settings2 slot="ios" class="w-5 h-5 transition-all" />
            <Settings2 slot="material" class="w-5 h-5" />
          </Icon></svelte:fragment
        ></TabbarLink
      >
    </Tabbar>
    {#key $path}
      <div transition:fly class="">
        {#if $params["path"] === "chats"}
          <Chats />
        {:else if $params["path"] === "settings"}
          <Settings />
        {/if}
      </div>
    {/key}
  </Page>
{:else if $path === "/login"}
  <Login />
{:else if $path === "/register"}
  <Register />
{:else}
  <h1>404</h1>
  <p>Not found: {$path}</p>
{/if}
