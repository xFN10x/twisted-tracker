import { App } from "@slack/bolt";
import { config } from "dotenv";
import { BlockCollection, Blocks, Elements } from "slack-block-builder";
import type { ChatPostMessageArguments } from "@slack/web-api/dist/types/request/chat";
import twistedGetDocument from "./scraper";

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

async function sendMsg(args: ChatPostMessageArguments) {
  let chat = SApp.client.chat;
  chat.postMessage(args);
}

async function onStart() {
  await sendMsg({
    channel: process.env.CHANNEL_ID ?? "",
    text: "test?",
    blocks: BlockCollection(
      Blocks.Section({
        text: "Hey! I was restarted! Maybe I died or something...",
      }),
      Blocks.Actions().elements(
        Elements.Button({ text: "Damn", actionId: "cliked" }),
      ),
    ),
  });
}

SApp.action("cliked", async ({ action, ack }) => {
  await ack();
  //console.log(action)

  await sendMsg({
    channel: process.env.CHANNEL_ID ?? "",
    text: "test???",
    blocks: BlockCollection(Blocks.Section({ text: `"Damn!"` })),
  });
  const testDoc = await twistedGetDocument("dashboard/frame/pathways/");
  console.log(testDoc?.querySelectorAll(".shadow-sm"));
});

(async () => {
  await SApp.start();
  await onStart();
  console.log("App running...");
})();
