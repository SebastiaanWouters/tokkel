<script>
  import { logoutUser } from "../lib/pocketbase";
</script>

<div class="fill grid grid-rows-[auto_1fr]">
  <div
    class="h-16 w-full p-3 font-semibold text-font border-border border-b border-t items-center flex"
  >
    Settings
  </div>
  <div class="flex flex-col gap-4 p-8">
    <button
      class="transition-all bg-primary-600 hover:bg-primary-500 p-3 rounded-xl text-white dark:text-font uppercase"
      on:click={logoutUser}>Logout</button
    >
  </div>
</div>
