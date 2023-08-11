<script lang="ts">
  import { createUser } from "../lib/pocketbase";
  import { createForm } from "felte";
  import { validator } from "@felte/validator-zod";
  import { goto } from "elegua";
  import * as zod from "zod";
  import Spinner from "../lib/components/spinner.svelte";

  const schema = zod
    .object({
      username: zod.string().min(5).max(16),
      password: zod.string().min(8).max(32),
      confirm: zod.string(),
    })
    .superRefine(({ confirm, password }, ctx) => {
      if (confirm !== password) {
        ctx.addIssue({
          code: "custom",
          message: "The passwords do not match",
          path: ["confirm"],
        });
      }
    });

  let loading = false;
  let error = null;

  const { form, errors, warnings, data } = createForm({
    extend: [
      validator({ schema }),
      validator({ schema: schema, level: "warning" }),
    ], // OR `extend: [validator],`
    onSubmit: async (values) => {
      try {
        await createUser(values.username, values.password, values.confirm);
        goto("/login?message=account");
      } catch (e) {
        error = e;
      }
      loading = false;
    },
  });
</script>

<section class="bg-gray-50 dark:bg-neutral-900 fill px-6">
  <div class="flex flex-col items-center justify-center py-8 mx-auto h-full">
    <div
      class="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white"
    >
      <img class="w-20 h-20" src="logo_dark.png" alt="logo" />
    </div>
    <div class="w-full light:bg-white rounded-lg xl:p-0">
      <div class="space-y-4">
        <h1
          class="text-xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white"
        >
          Create Account
        </h1>
        {#if error}
          <p class="text-white/60">Something went wrong, please try again</p>
        {/if}

        <form class="space-y-4" use:form>
          <div>
            <label
              for="username"
              class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >Your username</label
            >
            <input
              type="text"
              name="username"
              id="username"
              class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              placeholder="johndoe96"
              required={true}
            />
            <p
              class="h-0.5 flex justify-end mr-1 text-xs text-primary-500 m-0 p-0 mt-[0.18rem] pb-[8px]"
            >
              {$data.username && $warnings?.username
                ? $warnings.username[0]
                : ""}
            </p>
          </div>
          <div>
            <label
              for="password"
              class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >Password</label
            >
            <input
              type="password"
              name="password"
              id="password"
              placeholder="••••••••"
              class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              required={true}
            />
            <p
              class="h-0.5 flex justify-end mr-1 text-xs text-primary-500 m-0 p-0 mt-[0.18rem] pb-[8px]"
            >
              {$data.password && $warnings?.password
                ? $warnings.password[0]
                : ""}
            </p>
          </div>
          <div>
            <label
              for="confirm"
              class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >Confirm password</label
            >
            <input
              type="password"
              name="confirm"
              id="confirm"
              placeholder="••••••••"
              class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              required={true}
            />
            <p
              class="h-0.5 flex justify-end mr-1 text-xs text-primary-500 m-0 p-0 mt-[0.18rem] pb-[20px]"
            >
              {$data.password && $warnings?.confirm ? $warnings.confirm[0] : ""}
            </p>
          </div>

          {#if !loading}<button
              type="submit"
              class="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
              >Create an account</button
            >
          {:else}
            <button
              type="submit"
              class="flex justify-center items-center w-full"
              ><Spinner /></button
            >
          {/if}
          <p class="text-sm font-light text-gray-500 dark:text-gray-400">
            Already have an account? <a
              on:click={() => goto("login")}
              class="cursor-pointer font-medium text-primary-600 hover:underline dark:text-primary-500"
              >Login here
            </a>
          </p>
        </form>
      </div>
    </div>
  </div>
</section>
