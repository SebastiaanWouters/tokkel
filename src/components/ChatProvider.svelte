<script lang="ts">
  import {
    QueryCache,
    QueryClient,
    createQuery,
    getQueryClientContext,
    useQueryClient,
  } from "@tanstack/svelte-query";
  import type { ChatPartner, Message, User } from "../lib/types";
  import {
    fetchAllMessages,
    fetchAllUsers,
    fetchChatPartnersFromMessages,
  } from "../lib/api";
  import { authStore } from "../lib/pocketbase";

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

<slot />
