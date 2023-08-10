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
  import {
    SendHorizonal,
    Paperclip,
    PlaySquare,
    CheckCircle,
  } from "lucide-svelte";
  import Compressor from "compressorjs";
  import { clickoutside } from "@svelte-put/clickoutside";
  import { fetchGIFs } from "../lib/tenor";
  import { fade } from "svelte/transition";
  import { primaryColors } from "../lib/utils";

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

  const scrollToBottom = async (node) => {
    node.scroll({ top: node.scrollHeight, behavior: "smooth" });
  };

  $: if (currentMessages && scrollContainer) {
    scrollToBottom(scrollContainer);
  }

  let scrollContainer;

  async function sendMessage(
    msg: string,
    image?: string,
    gif?: string
  ): Promise<void> {
    let sentMsg = null;
    if (gif) {
      msg = null;
      sentMsg = await postMessage(gif, $currentUser, $currentChatPartner.data);
    }
    if (image) {
      sentMsg = await postMessage(
        image,
        $currentUser,
        $currentChatPartner.data
      );
    }
    if (msg) {
      sentMsg = await postMessage(msg, $currentUser, $currentChatPartner.data);
    }
    if (sentMsg) {
      message = null;
      imgBase64 = null;
      selectedgifIndex = null;
    }
  }

  async function handleKeyDown(e) {
    switch (e.keyCode) {
      case 13:
        sendMessage(message, imgBase64, gifToSend);
    }
  }

  let message = null;
  let imgBase64: string = null;
  let modalOpen = false;
  let src = "";
  let gifOpen = false;
  let gifs = [];
  let selectedgifIndex = null;

  $: gifToSend =
    selectedgifIndex !== null
      ? gifs[selectedgifIndex]?.media_formats?.mediumgif?.url
      : null;

  $: console.log(gifToSend);

  let debounceTimeout; // Initialize a variable to track the debounce timeout
  let previousMessage = "init";
  let previousGifOpen = false;

  $: {
    // This code block will run whenever message or gifOpen changes

    // Check if message or gifOpen has changed
    if (message !== previousMessage || gifOpen !== previousGifOpen) {
      // Clear any previous debounce timeout
      clearTimeout(debounceTimeout);

      // Set a new debounce timeout
      debounceTimeout = setTimeout(() => {
        if (gifOpen) {
          selectedgifIndex = null;
          if (message) {
            fetchGIFs(message).then((res) => {
              gifs = res.results;
            });
          } else {
            fetchGIFs("trending").then((res) => {
              gifs = res.results;
            });
          }
        } else {
          gifs = [];
          selectedgifIndex = null;
        }
      }, 500); // Adjust the debounce delay as needed (e.g., 300 milliseconds)

      // Update previousMessage and previousGifOpen
      previousMessage = message;
      previousGifOpen = gifOpen;
    }
  }

  function toggleGif() {
    gifOpen = !gifOpen;
  }

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

<div class="max-w-md w-full h-screen max-h-screen flex flex-col">
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
    class="absolute left-0 top-0 w-full h-full bg-surface-90 z-[1000] grid place-content-center"
    class:hidden={!modalOpen}
  >
    <img
      alt="full screen modal"
      {src}
      use:clickoutside
      on:clickoutside={() => {
        modalOpen = false;
      }}
      class="shadow-xl rounded-sm w-full object-fit"
    />
  </div>
  <div
    bind:this={scrollContainer}
    class="px-4 flex-col-reverse overflow-auto h-full flex gap-5 no-scrollbar py-20"
  >
    {#if $messages.isLoading}
      <span>Loading...</span>
    {:else if $messages.error}
      <span>An error has occurred</span>
    {:else}
      {#each currentMessages as message (message)}
        <ChatBubble bind:src bind:modalOpen {message} />
      {/each}
    {/if}
  </div>
  {#if gifOpen}
    <div
      transition:fade={{ duration: 100 }}
      class="h-48 max-h-48 min-h-[12rem] w-full flex items-center overflow-x-auto gap-2"
    >
      {#each gifs as gif, index}
        <button
          class="relative h-full cursor-pointer overflow-hidden rounded-xl flex flex-shrink-0 items-center"
          on:click={() => {
            selectedgifIndex = index;
          }}
        >
          {#if index === selectedgifIndex}
            <div class="absolute right-3 top-3">
              <CheckCircle color="#eee" />
            </div>
          {/if}
          <img
            alt="gif"
            class="h-full rounded-xl w-fit"
            class:border-4={index === selectedgifIndex}
            class:border-primary-700={index === selectedgifIndex}
            src={gif.media_formats.mediumgif.url}
          />
        </button>
      {/each}
    </div>
  {/if}
  <div
    class="transition-all fixed flex gap-4 justify-between p-4 h-fit bg-surface/50 backdrop-blur-xl"
    class:bottom-[12rem]={gifOpen}
    class:bottom-0={!gifOpen}
    style=" width:inherit;
    max-width:inherit;"
  >
    <input
      on:keydown={(e) => handleKeyDown(e)}
      id="text-input"
      class="bg-transparent text-md backdrop-blur-lg w-full outline-none focus:ring-primary-600 focus:border-primary-600 rounded"
      type="text"
      bind:value={message}
    />
    <div class="flex items-center gap-2">
      <button
        class="cursor-pointer"
        on:click={() => {
          toggleGif();
        }}><PlaySquare /></button
      >

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
            <Paperclip color="var(--primary-500)" />
          {:else}
            <Paperclip color="var(--text-color)" />
          {/if}
        </label>
      </div>
      <button
        id="send-button"
        on:click={() => {
          sendMessage(message, imgBase64, gifToSend);
        }}><SendHorizonal color="var(--text-color)" /></button
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
