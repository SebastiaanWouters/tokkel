<script lang="ts">
  import { X, UserPlus } from "lucide-svelte";
  import type { User } from "../pocketbase";
  import { getUserByName } from "../pocketbase";
  import debounce from "just-debounce-it";
  import Avatar from "./Avatar.svelte";
  import { goto } from "elegua";
  import { fade, fly } from "svelte/transition";

  export let open: boolean;
  let user: Promise<User> = null;

  const handleInput = debounce((event) => {
    user = getUserByName(event.target.value);
  }, 200);
</script>

<div
  class="flex flex-col gap-2 drawer absolute px-4 w-full h-[60%] bottom-0 left-0 bg-neutral-800 border-t-2 border-neutral-600/40 z-50 transition-all rounded-t-2xl shadow-2xl"
  class:active={open}
>
  <input
    type="text"
    id="first_name"
    on:input={handleInput}
    class="my-4 bg-gray-50 border border-gray-300 text-neutral-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-neutral-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
    placeholder="Username"
  />
  <div class="w-full">
    {#await user}
      <p class="p-3 bg-primary-600/40 rounded-lg text-center">No user found</p>
    {:then user}
      {#if user}
        <div
          class="p-3 flex justify-between items-center bg-neutral-600/60 hover:bg-neutral-500/60 rounded-lg transition-all"
        >
          <div class="flex gap-2 items-center"><Avatar />{user.username}</div>
          <button
            on:click={() => {
              goto(`/chat/${user.id}`);
            }}><UserPlus /></button
          >
        </div>
      {:else}
        <p class="p-3 bg-primary-600/40 rounded-lg text-center">
          No user found
        </p>
      {/if}
    {/await}
  </div>
</div>

<style>
  .drawer {
    transform: translateY(100%);
  }
  .active {
    transform: translateY(0%);
  }
</style>
