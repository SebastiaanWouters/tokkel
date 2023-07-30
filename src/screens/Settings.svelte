<script>
  import { logoutUser } from "../lib/pocketbase";
</script>

<div class="fill grid grid-rows-[auto_1fr]">
  <div class="w-full p-3 font-semibold text-gray-300 border-white/5 border-b">
    Settings
  </div>
  <div class="flex flex-col gap-4 p-8">
    <button
      class="bg-primary-800 hover:bg-primary-600 p-4 rounded uppercase"
      on:click={logoutUser}>Logout</button
    >
  </div>
</div>
