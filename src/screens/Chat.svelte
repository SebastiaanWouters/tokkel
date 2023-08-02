<script lang="ts">
  import { goto, params } from "elegua";
  import {
    postMessage,
    currentUser,
    fetchMessages,
    type Message,
    getUserById,
    pb,
    type User,
    type MessageRecord,
    decryptIncoming,
  } from "../lib/pocketbase";
  import {
    useQuery,
    useMutation,
    useQueryClient,
  } from "@sveltestack/svelte-query";
  import ChatBubble from "../lib/components/ChatBubble.svelte";

  const messages = useQuery<Message[]>(
    [$params["user"], $currentUser.id, "messages"],
    () => fetchMessages($params["user"]),
    {
      staleTime: Infinity,
      refetchOnMount: false,
    }
  );

  const currentChatPartner = useQuery<User>(
    [$params["user"], $currentUser.id, "currentPartner"],
    () => getUserById($params["user"]),
    {
      staleTime: Infinity,
      refetchOnMount: false,
    }
  );

  let message = "";

  const queryClient = useQueryClient();

  pb.collection("messages").subscribe("*", function (e) {
    console.log(e.action);
    if (e.record.from !== $currentUser.id || true) {
      $mutIn.mutate(e.record as MessageRecord);
    }
  });

  const mut = useMutation(sendMessage, {
    onSuccess: (data) => {
      queryClient.setQueryData(
        [$params["user"], data.from.id, "messages"],
        (oldMsg: Message[]) => [data, ...oldMsg]
      );
    },
  });

  const mutIn = useMutation(processIncoming, {
    onSuccess: (data) => {
      queryClient.setQueryData(
        [$params["user"], data.from.id, "messages"],
        (oldMsg: Message[]) => [data, ...oldMsg]
      );
    },
  });

  async function processIncoming(msg: MessageRecord): Promise<Message> {
    const processed = await decryptIncoming(
      msg,
      $currentUser,
      $currentChatPartner.data
    );
    if (processed) {
      return processed;
    }
  }

  async function sendMessage(msg: string): Promise<Message> {
    const sentMsg = await postMessage(
      msg,
      $currentUser,
      $currentChatPartner.data
    );
    if (sentMsg) {
      return { ...sentMsg, content: msg };
    }
  }
</script>

<div class="fill max-h-screen grid grid-rows-[auto_1fr_auto]">
  <div
    class="h-12 w-full flex justify-between items-center px-4 border-white/5 border-b"
  >
    <button on:click={() => goto("/home")}>{"<"}</button>
    {#if $currentChatPartner.isLoading}
      <span>Loading...</span>
    {:else if $currentChatPartner.error}
      <span>An error has occurred</span>
    {:else}
      <p>{$currentChatPartner.data.username}</p>
    {/if}
  </div>
  <div class="p-4 flex-col-reverse overflow-auto flex gap-2">
    {#if $messages.isLoading}
      <span>Loading...</span>
    {:else if $messages.error}
      <span>An error has occurred</span>
    {:else}
      {#each $messages.data as message}
        <ChatBubble {message} />
      {/each}
    {/if}
  </div>
  <div class="flex gap-4 justify-between p-4 h-fit w-full">
    <input class="bg-transparent w-full" type="text" bind:value={message} />
    <button on:click={() => $mut.mutate(message)}>Send</button>
  </div>
</div>
