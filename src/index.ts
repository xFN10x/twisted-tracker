import { App } from "@slack/bolt";
import { config } from "dotenv";
import { BlockCollection, Blocks, Elements } from "slack-block-builder";
import type { ChatPostMessageArguments } from "@slack/web-api/dist/types/request/chat";
import twistedGetDocument, { getPathways } from "./scraper";

config();

const SApp = new App({
  token: process.env.BOT_TOKEN,
  appToken: process.env.APP_TOKEN,
  socketMode: true,
});
if (process.env.CHANNEL_ID === undefined) {
  console.log("Channel ID is undefined!");
  process.exit(1);
}

export async function sendMsgDebug(mardown: string) {
	await sendMsg({
        channel: process.env.CHANNEL_ID ?? "",
        text: mardown,
        blocks: BlockCollection(
          Blocks.Context().elements(
            mardown,
          ),
        ),
      });
}

export async function sendMsgMrkDwn(markdown: string) {
  await sendMsg({
    channel: process.env.CHANNEL_ID ?? "",
    markdown_text: markdown,
  });
}
export async function sendMsg(args: ChatPostMessageArguments) {
  let chat = SApp.client.chat;
  chat.postMessage(args);
}

async function onStart() {
  await sendMsgMrkDwn("Hey! I was restarted! Maybe I died or something...")
}

SApp.command("/tt-update", async ({ payload, say, ack }) => {
  await ack();
  if (payload.user_id == process.env.OWNER_ID) {
    config();
    getPathways();
    sendMsgDebug("Updated.");
  }
});

(async () => {
  console.log("App starting...");
  await SApp.start();
  await onStart();
  console.log("App running...");
})();
