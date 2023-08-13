<script>
  import {
    Block,
    BlockTitle,
    Navbar,
    Page,
    ListInput,
    List,
    Button,
  } from "konsta/svelte";
  import { PersonStanding, LockIcon, UserPlus } from "lucide-svelte";
</script>

<Page class="w-full h-full overflow-hidden">
  <div class="h-full flex flex-col justify-center items-center px-4">
    <h1
      class="material:px-4 text-left font-semibold w-full max-w-2xl text-3xl leading-6"
    >
      Register
    </h1>
    <List class="w-full max-w-2xl" strongIos insetIos>
      <ListInput
        class="w-full bg-transparent"
        label="Username"
        type="text"
        placeholder="Your name"
        info="Your public name used by others to find you"
        value={""}
        error={false ? "Please specify your name" : ""}
        onInput={() => {}}
      >
        <PersonStanding slot="media" />
      </ListInput>
      <ListInput
        class="w-full"
        label="Password"
        type="text"
        placeholder="Your Password"
        info="This password is used to encrypt your messages, make sure it is safe"
        value={""}
        error={false ? "Please specify your name" : ""}
        onInput={() => {}}
      >
        <LockIcon slot="media" />
      </ListInput>
      <ListInput
        class="w-full"
        label="Confirm password"
        type="text"
        placeholder="Your Password Again"
        info="Repeat your password"
        value={""}
        error={false ? "Please specify your name" : ""}
        onInput={() => {}}
      >
        <LockIcon slot="media" />
      </ListInput>
    </List>
    <div
      class="w-full max-w-2xl material:px-4 flex flex-col gap-3 justify-center"
    >
      <Button large
        ><div class="flex items-center">
          {"Register "}<UserPlus class="ml-1 h-5 w-7 mt-[0.1rem]" />
        </div></Button
      >
      <p class="text-zinc-400">
        Do you have an account? <a class="text-primary" href="/login">Login</a>
      </p>
    </div>
  </div>
</Page>
