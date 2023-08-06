<script lang="ts">
  import { useQuery, useQueryClient } from "@sveltestack/svelte-query";
  import {
    fetchChatPartners,
    type ChatPartner,
    currentUser,
    type Message,
    fetchAllMessages,
  } from "../pocketbase";
  import { convertStringMapToList } from "../utils";

  const queryClient = useQueryClient();

  // Use a query for fetching partners
  const partnersQuery = useQuery<ChatPartner[]>(
    [$currentUser.id, "partners"],
    () => {
      return fetchPartners();
    },
    {
      staleTime: Infinity,
      refetchOnMount: false,
    }
  );

  const messagesQuery = useQuery<Message[]>(
    [$currentUser.id, "messages"],
    () => {
      return fetchAllMessages();
    },
    {
      staleTime: Infinity,
      refetchOnMount: false,
    }
  );

  async function fetchPartners(): Promise<ChatPartner[]> {
    console.log("fetching partners for this user: " + $currentUser.id);
    const partners = await fetchChatPartners();

    console.log("finished getting partners: " + JSON.stringify(partners));
    const partnersArray = convertStringMapToList(
      partners,
      "latest"
    ) as ChatPartner[];
    console.log(
      "finished converting partners to array with length: " +
        partnersArray.length
    );
    return partnersArray;
  }
</script>

{#await $partnersQuery then}
  <slot />
{:catch error}
  <p>Error loading partners.</p>
{/await}
