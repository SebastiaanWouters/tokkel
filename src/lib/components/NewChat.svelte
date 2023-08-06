<script lang="ts">
  import { X, UserPlus } from "lucide-svelte";
  import type { User } from "../pocketbase";
  import { getUserByName } from "../pocketbase";
  import debounce from "just-debounce-it";
  import Avatar from "./Avatar.svelte";
  import { goto } from "elegua";

  export let open: boolean;
  let user: Promise<User> = null;

  const handleInput = debounce((event) => {
    user = getUserByName(event.target.value);
  }, 200);
</script>

<div
  class="flex flex-col gap-4 drawer absolute px-4 w-full h-[80%] bottom-0 left-0 bg-neutral-800 border-t-2 border-neutral-600/40 z-50 transition-all rounded-t-lg shadow-2xl"
  class:active={open}
>
  <button
    on:click={() => {
      open = false;
    }}><X class="cursor-pointer absolute top-3 right-3 rounded-xl" /></button
  >
  <input
    type="text"
    on:input={handleInput}
    class="mt-8 py-4 px-2 w-full h-8 text-neutral-900 rounded-lg"
  />
  <div class="w-full h-32">
    {#await user}
      <p class="p-1">No user found</p>
    {:then user}
      {#if user}
        <div class="p-1 flex justify-between items-center">
          <div class="flex gap-2"><Avatar />{user.username}</div>
          <button
            on:click={() => {
              goto(`/chat/${user.id}`);
            }}><UserPlus /></button
          >
        </div>
      {:else}
        <p class="p-1">No user found</p>
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
