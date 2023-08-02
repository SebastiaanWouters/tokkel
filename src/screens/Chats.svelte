<script lang="ts">
  import {
    useQuery,
    useQueryClient,
    type QueryKey,
  } from "@sveltestack/svelte-query";
  import {
    convertStringMapToList,
    mapDataToListOfMessages,
    minutesAgoFromTimestamp,
  } from "../lib/utils";
  import ChatPreview from "../lib/components/ChatPreview.svelte";
  import {
    currentUser,
    fetchChatPartners,
    type ChatPartner,
    type Message,
    fetchAllMessages,
  } from "../lib/pocketbase";

  const queryClient = useQueryClient();

  const partners = useQuery<ChatPartner[]>([$currentUser], fetchPartners, {
    staleTime: Infinity,
    refetchOnMount: false,
  });

  async function fetchPartners(): Promise<ChatPartner[]> {
    const partners = await fetchChatPartners();
    const partnersArray = convertStringMapToList(
      partners,
      "latest"
    ) as ChatPartner[];
    return partnersArray;
  }
</script>

<div class="fill grid grid-rows-[auto_1fr]">
  <div class="w-full p-3 font-semibold text-gray-300 border-white/5 border-b">
    Chats
  </div>
  <div class="flex flex-col gap-2">
    {#if $partners.status === "success"}
      {#each $partners.data as partner}
        <ChatPreview
          user={partner.user}
          content={partner.content}
          date={minutesAgoFromTimestamp(partner.latest)}
        />
      {/each}
    {/if}
  </div>
</div>
