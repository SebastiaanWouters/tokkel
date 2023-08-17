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
    PageContent,
  } from "framework7-svelte";
  import { authStore } from "../lib/pocketbase";
  import { onMount } from "svelte";
  import { MailPlus, X, ChevronRight, LogOut } from "lucide-svelte";
  import { LucideClipboardType } from "lucide-svelte";

  import {
    fetchAllMessages,
    fetchAllUsers,
    fetchChatPartners,
    fetchChatPartnersFromMessages,
    logoutUser,
  } from "../lib/api";
  import type { ChatPartner, Message, User } from "../lib/types";
  import { createQuery, useQueryClient } from "@tanstack/svelte-query";
  import Avatar from "../components/Avatar.svelte";
  import RealtimeProvider from "../components/RealtimeProvider.svelte";
  import { minutesAgoFromTimestamp } from "../lib/utils";

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

  $: users = createQuery<User[] | null>({
    queryKey: ["users"],
    queryFn: () => fetchAllUsers(),
    enabled: $authStore ? true : false,
    staleTime: Infinity,
  });

  $: messages = createQuery<Message[]>({
    queryKey: [$authStore?.id, "messages"],
    queryFn: () => fetchAllMessages(),
    enabled: $authStore ? true : false,
    staleTime: Infinity,
  });

  $: partners = createQuery<ChatPartner[] | null>({
    queryKey: [$authStore?.id, "partners"],
    queryFn: () => fetchChatPartnersFromMessages($messages.data),
    enabled: $messages.isSuccess,
    staleTime: Infinity,
  });
</script>

<Page id="page" class="no-scrollbar" name="home">
  {#if ready}
    <!-- Top Navbar -->

    <Navbar class="h-[3.75rem]" title="Messages" sliding={true}>
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
    <PageContent class="pt-3 p-0 m-0 no-scrollbar bg-zinc-950">
      <List mediaList dividersIos class="mt-0">
        {#if $partners.isSuccess}
          {#each $partners.data as partner}
            <Link href={`/${partner.user.id}`} class="w-full ">
              <ListItem
                class="py-1 w-full hover:bg-zinc-900 active:bg-zinc-950 transition-all duration-100"
                title={partner.user.username}
                subtitle={partner.content}
              >
                <Avatar seed={partner.user.id} lg slot="media" />
                <div
                  slot="content-end"
                  class="flex items-start justify-center mx-4"
                >
                  <p class="whitespace-nowrap text-sm text-zinc-400">
                    {minutesAgoFromTimestamp(partner.latest)}
                  </p>
                  <ChevronRight
                    class="text-zinc-400 align-middle text-center"
                  />
                </div>
              </ListItem>
            </Link>
          {/each}
        {/if}
      </List>
    </PageContent>
    <Popup class="popup border border-white/20" opened={newChatOpened}>
      <Page>
        <Navbar class="h-[3.75rem] bg-zinc-950" title="New Chat">
          <NavRight><Link popupClose=".popup"><X /></Link></NavRight>
          <Subnavbar inner={false}>
            <Searchbar
              searchContainer=".search-list"
              class="!bg-zinc-900"
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
          class="search-list searchbar-found mt-15 mb-0 scroll-mt-15"
        >
          {#if $users.isSuccess}
            {#each $users.data as user}
              <Link
                popupClose=".popup"
                style="width: 100%; display: flex; justify-content: start"
                href={`/${user.id}`}
              >
                <ListItem
                  class="py-1 w-full hover:bg-zinc-900 active:bg-zinc-950 transition-all duration-100"
                  title={user.username}
                >
                  <Avatar seed={user.id} slot="media" />
                  <div
                    slot="content-end"
                    class="flex items-start justify-center mx-4"
                  >
                    <ChevronRight
                      class="text-zinc-400 align-middle text-center"
                    />
                  </div>
                </ListItem>
              </Link>
            {/each}
          {/if}
        </List>
      </Page>
    </Popup>
  {/if}
</Page>
