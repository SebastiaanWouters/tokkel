<script lang="ts">
  import {
    Block,
    BlockTitle,
    Navbar,
    ListInput,
    List,
    Button,
  } from "konsta/svelte";
  import { Link, Page } from "framework7-svelte";
  import { PersonStanding, LockIcon, UserPlus, Loader2 } from "lucide-svelte";
  import { z } from "zod";
  import { createUser } from "../lib/api";

  export let f7router;
  let loading = false;
  let error: null | string = null;
  let username = { value: "", changed: false, error: "" };
  let password = { value: "", changed: false, error: "" };
  let confirm = { value: "", changed: false, error: "" };

  const onNameChange = (e) => {
    username = { ...username, value: e.target.value, changed: true };
    validateUserName();
  };
  const onPassChange = (e) => {
    password = { ...password, value: e.target.value, changed: true };
    validatePassword();
    validateConfirmPassword(confirm.value);
  };
  const onPassConfirmChange = (e) => {
    validateConfirmPassword(e.target.value);
    confirm = { ...confirm, value: e.target.value, changed: true };
  };

  const schema = z.object({
    username: z.string().min(5).max(16),
    password: z.string().min(8).max(32),
  });

  const validateUserName = (): boolean => {
    try {
      schema.shape.username.parse(username.value);
      username.error = "";
      return true;
    } catch {
      username.error = "Please enter a valid/unique username";
      return false;
    }
  };

  const validatePassword = (): boolean => {
    try {
      schema.shape.password.parse(password.value);
      password.error = "";
      return true;
    } catch {
      password.error = "Please enter a valid password";
      return false;
    }
  };

  const validateConfirmPassword = (confirmPass: string): boolean => {
    if (password.value === confirmPass) {
      confirm.error = "";
      return true;
    } else {
      confirm.error = "Passwords do not match";
      return false;
    }
  };

  async function attemptRegister() {
    loading = true;
    if (
      validateConfirmPassword(confirm.value) &&
      validatePassword() &&
      validateUserName()
    ) {
      const res = await createUser(
        username.value,
        password.value,
        confirm.value
      );
      if (res.error) {
        error = "username might be taken, please try again";
        loading = false;
        return;
      }
      f7router.navigate("/login", { props: { newHere: true } });
      loading = false;
    } else {
      loading = false;
      return;
    }
  }
</script>

<Page name="register" class="w-full h-full overflow-hidden">
  <div class="h-full flex flex-col justify-center items-center px-4">
    <h1
      class="material:px-4 text-left font-semibold w-full max-w-2xl text-3xl leading-10"
    >
      Register
    </h1>
    {#if error}
      <p class="w-full max-w-2xl text-primary mt-1">{error}</p>
    {/if}
    <List class="w-full max-w-2xl mt-6" strongIos insetIos>
      <ListInput
        class="w-full bg-transparent"
        label="Username"
        type="text"
        placeholder="Your desired username"
        info="this name is used by others to find you"
        value={username.value}
        error={username.error}
        onInput={onNameChange}
      >
        <PersonStanding slot="media" />
      </ListInput>
      <ListInput
        class="w-full"
        label="Password"
        type="password"
        placeholder="Your Password"
        info="This password is used to encrypt your messages, make sure it is safe"
        value={password.value}
        error={password.error}
        onInput={onPassChange}
      >
        <LockIcon slot="media" />
      </ListInput>
      <ListInput
        class="w-full"
        label="Confirm password"
        type="password"
        placeholder="Your Password Again"
        info="Repeat your password"
        value={confirm.value}
        error={confirm.error}
        onInput={onPassConfirmChange}
      >
        <LockIcon slot="media" />
      </ListInput>
    </List>
    <div
      class="w-full max-w-2xl material:px-4 flex flex-col gap-3 justify-center"
    >
      <Button large onClick={attemptRegister}
        ><div class="flex items-center">
          {"Register "}
          {#if !loading}
            <PersonStanding class="ml-1 h-5 w-7" />
          {:else}
            <Loader2 class="animate-spin ml-1 h-5 w-7" />
          {/if}
        </div></Button
      >

      <p class="text-zinc-400">
        Do you have an account? <Link class="text-primary" href="/login">
          Login</Link
        >
      </p>
    </div>
  </div>
</Page>
