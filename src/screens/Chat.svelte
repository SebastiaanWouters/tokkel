<script lang="ts">
  import { goto, params, oldUrl } from "elegua";
  import {
    postMessage,
    currentUser,
    type Message,
    getUserById,
    type User,
    fetchAllMessages,
  } from "../lib/pocketbase";
  import { useQuery } from "@sveltestack/svelte-query";
  import ChatBubble from "../lib/components/ChatBubble.svelte";
  import { ChevronLeftCircle } from "lucide-svelte";
  import TopBar from "../lib/components/TopBar.svelte";
  import Avatar from "../lib/components/Avatar.svelte";
  import { SendHorizonal, Paperclip } from "lucide-svelte";
  import Compressor from "compressorjs";
  import { clickoutside } from "@svelte-put/clickoutside";

  const messages = useQuery<Message[]>(
    [$currentUser.id, "messages"],
    () => {
      return fetchAllMessages();
    },
    {
      staleTime: Infinity,
      refetchOnMount: false,
    }
  );

  const currentChatPartner = useQuery<User>(
    [$params["user"], "currentPartner"],
    () => getUserById($params["user"]),
    {
      staleTime: Infinity,
      refetchOnMount: false,
    }
  );

  $: currentMessages = $messages.data?.filter((msg) => {
    return (
      (msg.from.id === $currentUser.id || msg.to.id === $currentUser.id) &&
      (msg.from.id === $params["user"] || msg.to.id === $params["user"])
    );
  });

  async function sendMessage(
    msg: string,
    image: string = undefined
  ): Promise<Message> {
    console.log(image);
    if (msg) {
      const sentMsg = await postMessage(
        msg,
        $currentUser,
        $currentChatPartner.data,
        image
      );
      if (sentMsg) {
        message = "";
        return { ...sentMsg, content: msg };
      }
    }
  }

  async function handleKeyDown(e) {
    switch (e.keyCode) {
      case 13:
        sendMessage(message, imgBase64);
    }
  }

  let message = "";
  let imgBase64: string = undefined;
  let open = false;
  let src = "";

  async function toBase64(e: Event) {
    if (!(<HTMLInputElement>e.target).files[0]) {
      imgBase64 = undefined;
    }
    const file = (<HTMLInputElement>e.target).files[0];

    new Compressor(file, {
      quality: 1,
      maxWidth: 400,
      // The compression process is asynchronous,
      // which means you have to access the `result` in the `success` hook function.
      success(result) {
        const reader = new FileReader();
        reader.onloadend = () => {
          imgBase64 = reader.result.toString();
        };
        reader.readAsDataURL(result);
      },
      error(err) {
        imgBase64 = undefined;
        console.log(err.message);
      },
    });
  }
</script>

<div class="max-w-md fill max-h-screen flex flex-col">
  <TopBar>
    <button on:click={() => goto("/chat")}
      ><ChevronLeftCircle strokeWidth={1.7} /></button
    >
    {#if $currentChatPartner.isLoading}
      <span>Loading...</span>
    {:else if $currentChatPartner.error}
      <span>An error has occurred</span>
    {:else}
      <div class="flex items-center gap-2">
        <p>{$currentChatPartner.data.username}</p>
        <Avatar />
      </div>
    {/if}
  </TopBar>
  <div
    class="absolute left-0 top-0 w-full h-full bg-neutral-900/90 z-[1000] grid place-content-center"
    class:hidden={!open}
  >
    <img
      alt="full screen modal"
      {src}
      use:clickoutside
      on:clickoutside={() => {
        open = false;
      }}
      class="shadow-xl rounded-sm w-full object-fit"
    />
  </div>
  <div
    class="p-4 flex-col-reverse overflow-auto h-full flex gap-5 no-scrollbar pb-20"
  >
    {#if $messages.isLoading}
      <span>Loading...</span>
    {:else if $messages.error}
      <span>An error has occurred</span>
    {:else}
      {#each currentMessages as message (message)}
        <ChatBubble bind:src bind:open {message} />
      {/each}
    {/if}
  </div>
  <div
    class="fixed bottom-0 flex gap-4 justify-between p-4 h-fit bg-transparent backdrop-blur-lg"
    style=" width:inherit;
    max-width:inherit;"
  >
    <input
      on:keydown={(e) => handleKeyDown(e)}
      id="text-input"
      class="bg-transparent backdrop-blur-lg w-full outline-none focus:ring-primary-600 focus:border-primary-600 rounded"
      type="text"
      bind:value={message}
    />
    <div class="flex items-center gap-2">
      <div class="">
        <input
          type="file"
          accept=".png,.jpg,.jpeg"
          id="file-btn"
          on:change={(e) => toBase64(e)}
          hidden
        />
        <!--our custom file upload button-->
        <label class="relative cursor-pointer" for="file-btn">
          {#if imgBase64}
            <Paperclip color="purple" />
          {:else}
            <Paperclip color="#fff" />
          {/if}
        </label>
      </div>
      <button
        id="send-button bg-transparent"
        on:click={() => sendMessage(message, imgBase64)}
        ><SendHorizonal /></button
      >
    </div>
  </div>
</div>

<style>
  /* Hide scrollbar for Chrome, Safari and Opera */
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }

  /* Hide scrollbar for IE, Edge and Firefox */
  .no-scrollbar {
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
  }
</style>
