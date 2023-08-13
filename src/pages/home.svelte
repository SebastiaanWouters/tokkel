<script>
  import {
    Page,
    Navbar,
    NavTitle,
    Link,
    f7,
    Sheet,
    PageContent,
    Block,
    NavTitleLarge,
    BlockTitle,
  } from "framework7-svelte";
  import { Button } from "konsta/svelte";
  import { authStore } from "../lib/pocketbase";
  import { onMount } from "svelte";
  import { app } from "framework7-svelte";
  import NewChatSheet from "../components/NewChatSheet.svelte";
  import { logoutUser } from "../lib/api";

  export let f7router;
  let ready = false;
  let opened = false;

  onMount(async () => {
    if (!$authStore) {
      await setTimeout(() => {}, 2);
      f7router.navigate("/login");
    } else {
      ready = true;
    }
  });

  $: if (!$authStore && ready) {
    f7router.navigate("/login");
    console.log("going to login");
  }
</script>

<Page id="page" name="home">
  {#if ready}
    <!-- Top Navbar -->
    <Navbar translucent slot="fixed" sliding={true}>
      <NavTitle class="" sliding>Messages</NavTitle>
    </Navbar>
    <!-- Toolbar -->

    <!-- Page content -->
    <div class="p-8">
      <Block>
        <BlockTitle>Welcome {$authStore?.username ?? "N00B"}</BlockTitle>
      </Block>
      <Button
        large
        onClick={() => {
          logoutUser();
        }}>Logout</Button
      >
      <NewChatSheet bind:opened />
    </div>
  {/if}
</Page>
