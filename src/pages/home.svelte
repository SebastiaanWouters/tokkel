<script lang="ts">
  import {
    Page,
    Navbar,
    NavTitle,
    Link,
    Button,
    Popup,
    NavRight,
    Subnavbar,
    Searchbar,
    List,
    ListItem,
    NavLeft,
  } from "framework7-svelte";
  import { authStore } from "../lib/pocketbase";
  import { onMount } from "svelte";
  import { MailPlus, X, ChevronRight, LogOut } from "lucide-svelte";
  import { fetchAllUsers, fetchChatPartners, logoutUser } from "../lib/api";
  import type { ChatPartner, User } from "../lib/types";
  import { createQuery } from "@tanstack/svelte-query";
  import Avatar from "../components/Avatar.svelte";
  import RealtimeProvider from "../components/RealtimeProvider.svelte";

  export let f7router;
  let ready = false;
  let newChatOpened = false;

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

    <Navbar title="Messages" class="" sliding={true}>
      <NavLeft slot="left"
        ><Link
          on:click={() => {
            logoutUser();
          }}><LogOut /></Link
        ></NavLeft
      >

      <NavRight slot="right" class=""
        ><Link popupOpen=".popup"><MailPlus /></Link></NavRight
      >
    </Navbar>
    <!-- Toolbar -->

    <!-- Page content -->

    <List mediaList dividersIos class="mt-0">
      {#if $partners.isSuccess}
        {#each $partners.data as partner}
          <Link href={`/${partner.user.id}`} class="w-full ">
            <ListItem
              class="py-1 w-full"
              title={partner.user.username}
              subtitle={partner.content}
            >
              <Avatar slot="media" />
              <div
                slot="content-end"
                class="h-full flex flex-col justify-center mx-4"
              >
                <ChevronRight class="text-zinc-200" />
              </div>
            </ListItem>
          </Link>
        {/each}
      {/if}
    </List>

    <Popup class="popup border border-white/20" opened={newChatOpened}>
      <Page>
        <Navbar class="bg-black" title="New Chat">
          <NavRight><Link popupClose=".popup"><X /></Link></NavRight>
          <Subnavbar inner={false}>
            <Searchbar
              searchContainer=".search-list"
              class="!bg-black"
              searchIn=".item-title"
            />
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
              <Link
                popupClose=".popup"
                style="width: 100%; display: flex; justify-content: start"
                href={`/${user.id}`}
              >
                <ListItem title={user.username} />
              </Link>
            {/each}
          {/if}
        </List>
      </Page>
    </Popup>
  {/if}
</Page>
