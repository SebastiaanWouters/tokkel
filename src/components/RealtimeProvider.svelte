<script lang="ts">
  import { createMutation, useQueryClient } from "@tanstack/svelte-query";
  import { decryptRealtime, expandMessage, fetchMessages } from "../lib/api";
  import { authStore, pb } from "../lib/pocketbase";
  import type { MessageRecord, Message, ChatPartner } from "../lib/types";

  const queryClient = useQueryClient();

  pb.collection("messages").subscribe("*", async function (e) {
    console.log("New realtime update: " + e.record);
    const enc = await expandMessage(e.record as MessageRecord);
    const dec = await decryptRealtime(enc);
    if (dec.from.id !== $authStore.id) {
      $mutIn.mutate(dec as Message);
    } else {
      $mutOut.mutate(dec as Message);
    }
  });

  //TODO: update partner data with new content and timestamp

  const mutOut = createMutation(updateMessagesWithOutgoing);

  const mutIn = createMutation(updateMessagesWithIncoming);

  async function updateMessagesWithIncoming(msg: Message) {
    queryClient.setQueryData([$authStore.id, "messages"], (oldMsg: Message[]) =>
      oldMsg ? [...oldMsg, msg] : [msg]
    );
    queryClient.setQueryData(
      [$authStore.id, "partners"],
      (oldPartners: ChatPartner[]) => updatePartnersIncoming(oldPartners, msg)
    );
  }

  async function updateMessagesWithOutgoing(msg: Message) {
    queryClient.setQueryData([$authStore.id, "messages"], (oldMsg: Message[]) =>
      oldMsg ? [...oldMsg, msg] : [msg]
    );
    queryClient.setQueryData(
      [$authStore.id, "partners"],
      (oldPartners: ChatPartner[]) => updatePartnersOutgoing(oldPartners, msg)
    );
  }

  function updatePartnersIncoming(
    oldPartners: ChatPartner[],
    msg: Message
  ): ChatPartner[] {
    const existingPartner = oldPartners.find(
      (partner) => partner.user.id === msg.from.id
    );

    const newPartners = [...oldPartners];

    if (existingPartner) {
      existingPartner.content = msg.content;
      existingPartner.latest = msg.created;
    } else {
      newPartners.push({
        user: msg.from,
        content: msg.content,
        latest: msg.created,
      });
    }

    // Sort the array based on the 'latest' field
    newPartners.sort(
      (a, b) => new Date(b.latest).getTime() - new Date(a.latest).getTime()
    );

    return newPartners;
  }

  function updatePartnersOutgoing(
    oldPartners: ChatPartner[],
    msg: Message
  ): ChatPartner[] {
    const existingPartner = oldPartners.find(
      (partner) => partner.user.id === msg.to.id
    );

    const newPartners = [...oldPartners];

    if (existingPartner) {
      existingPartner.content = msg.content;
      existingPartner.latest = msg.created;
    } else {
      newPartners.push({
        user: msg.to,
        content: msg.content,
        latest: msg.created,
      });
    }

    // Sort the array based on the 'latest' field
    newPartners.sort(
      (a, b) => new Date(b.latest).getTime() - new Date(a.latest).getTime()
    );

    return newPartners;
  }
</script>

<slot />
