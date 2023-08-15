<script lang="ts">
  import {
    Page,
    Navbar,
    NavTitle,
    Link,
    f7,
    PageContent,
    Block,
    NavTitleLarge,
    Toolbar,
    BlockTitle,
    Button,
    Popup,
    NavRight,
    Subnavbar,
    Searchbar,
    List,
    ListItem,
  } from "framework7-svelte";
  import { authStore } from "../lib/pocketbase";
  import { onMount } from "svelte";
  import { MailPlus, X, ChevronRightSquare } from "lucide-svelte";
  import { fetchAllUsers, fetchChatPartners, logoutUser } from "../lib/api";
  import type { ChatPartner, User } from "../lib/types";
  import { createQuery } from "@tanstack/svelte-query";
  import Avatar from "../components/Avatar.svelte";

  export let f7router;
  let ready = false;
  let newChatOpened = false;
  let searchedUser = null;
  let searchedUsers: null | User[] = null;

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
  }

  const users = createQuery<User[] | null>({
    queryKey: [$authStore?.id, "users"],
    queryFn: () => fetchAllUsers(),
    enabled: $authStore ? true : false,
  });

  const partners = createQuery<ChatPartner[] | null>({
    queryKey: [$authStore?.id, "partners"],
    queryFn: () => fetchChatPartners(),
    enabled: $authStore ? true : false,
  });
</script>

<Page id="page" name="home">
  {#if ready}
    <!-- Top Navbar -->
    <Navbar class="p-6" sliding={true}>
      <NavTitle class="">Messages</NavTitle>
      <NavRight class="mx-2"
        ><Link popupOpen=".popup"><MailPlus /></Link></NavRight
      >
    </Navbar>
    <!-- Toolbar -->

    <!-- Page content -->

    <List mediaList dividersIos class="mt-0">
      {#if $partners.isSuccess}
        {#each $partners.data as partner}
          <ListItem
            class="py-1"
            title={partner.user.username}
            subtitle={partner.content}
          >
            <Avatar slot="media" />
            <Link
              slot="content-end"
              class="h-full flex flex-col justify-center mx-4"
              ><ChevronRightSquare /></Link
            >
          </ListItem>
        {/each}
      {/if}
    </List>
    <Button
      fill
      large
      class="mx-8 absolute bottom-4 left-0 right-0"
      onClick={() => {
        logoutUser();
      }}
      >Logout
    </Button>

    <Popup class="popup" opened={newChatOpened}>
      <Page>
        <Navbar class="bg-black" title="New Chat">
          <NavRight><Link popupClose=".popup"><X /></Link></NavRight>
          <Subnavbar inner={false}>
            <Searchbar searchContainer=".search-list" searchIn=".item-title" />
          </Subnavbar>
        </Navbar>

        <List
          strongIos
          outlineIos
          dividersIos
          class="searchbar-not-found !mt-11 !mb-0"
        >
          <ListItem title="Nothing found" />
        </List>
        <List
          dividersIos
          class="search-list searchbar-found mt-11 mb-0 scroll-mt-11"
        >
          {#if $users.isSuccess}
            {#each $users.data as user}
              <ListItem title={user.username} />
            {/each}
          {/if}
        </List>
      </Page>
    </Popup>
  {/if}
</Page>
