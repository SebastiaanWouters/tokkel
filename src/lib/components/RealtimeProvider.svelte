<script lang="ts">
  import { useMutation, useQueryClient } from "@sveltestack/svelte-query";
  import {
    pb,
    type MessageRecord,
    type Message,
    decryptRealtime,
    currentUser,
    expandMessage,
    fetchMessages,
    type ChatPartner,
  } from "../pocketbase";

  const queryClient = useQueryClient();

  pb.collection("messages").subscribe("*", async function (e) {
    console.log("New realtime update: " + e.record);
    const enc = await expandMessage(e.record as MessageRecord);
    const dec = await decryptRealtime(enc);
    if (dec.from.id !== $currentUser.id) {
      $mutIn.mutate(dec as Message);
    } else {
      $mutOut.mutate(dec as Message);
    }
  });

  //TODO: update partner data with new content and timestamp

  const mutOut = useMutation(updateMessagesWithOutgoing);

  const mutIn = useMutation(updateMessagesWithIncoming);

  async function updateMessagesWithIncoming(msg: Message) {
    queryClient.setQueryData(
      [$currentUser.id, "messages"],
      (oldMsg: Message[]) => (oldMsg ? [msg, ...oldMsg] : [msg])
    );
    queryClient.setQueryData(
      [$currentUser.id, "partners"],
      (oldPartners: ChatPartner[]) => updatePartnersIncoming(oldPartners, msg)
    );
  }

  async function updateMessagesWithOutgoing(msg: Message) {
    queryClient.setQueryData(
      [$currentUser.id, "messages"],
      (oldMsg: Message[]) => (oldMsg ? [msg, ...oldMsg] : [msg])
    );
    queryClient.setQueryData(
      [$currentUser.id, "partners"],
      (oldPartners: ChatPartner[]) => updatePartnersOutgoing(oldPartners, msg)
    );
  }

  function updatePartnersIncoming(
    oldPartners: ChatPartner[],
    msg: Message
  ): ChatPartner[] {
    let found = false;

    if (!oldPartners) {
      return [{ user: msg.from, content: msg.content, latest: msg.created }];
    } else {
      for (let i = 0; i < oldPartners.length; i++) {
        if (oldPartners[i].user.id === msg.from.id) {
          oldPartners[i] = {
            user: msg.from,
            content: msg.content,
            latest: msg.created,
          };
          found = true;
          break; // this will stop the loop
        }
      }
      // If no existing partner was found, add the new one.
      if (!found) {
        oldPartners.push({
          user: msg.from,
          content: msg.content,
          latest: msg.created,
        });
      }
    }

    // Sort the array based on the 'latest' field
    oldPartners.sort((a, b) => {
      return new Date(b.latest).getTime() - new Date(a.latest).getTime();
    });

    return oldPartners;
  }

  function updatePartnersOutgoing(
    oldPartners: ChatPartner[],
    msg: Message
  ): ChatPartner[] {
    let found = false;

    if (!oldPartners) {
      return [{ user: msg.to, content: msg.content, latest: msg.created }];
    } else {
      for (let i = 0; i < oldPartners.length; i++) {
        if (oldPartners[i].user.id === msg.to.id) {
          oldPartners[i] = {
            user: msg.to,
            content: msg.content,
            latest: msg.created,
          };
          found = true;
          break; // this will stop the loop
        }
      }
      // If no existing partner was found, add the new one.
      if (!found) {
        oldPartners.push({
          user: msg.to,
          content: msg.content,
          latest: msg.created,
        });
      }
    }

    // Sort the array based on the 'latest' field
    oldPartners.sort((a, b) => {
      return new Date(b.latest).getTime() - new Date(a.latest).getTime();
    });

    return oldPartners;
  }
</script>

<slot />
