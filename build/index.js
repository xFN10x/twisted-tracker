"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bolt_1 = require("@slack/bolt");
const dotenv_1 = require("dotenv");
const slack_block_builder_1 = require("slack-block-builder");
const scraper_1 = __importDefault(require("./scraper"));
(0, dotenv_1.config)();
const SApp = new bolt_1.App({
    token: process.env.BOT_TOKEN,
    appToken: process.env.APP_TOKEN,
    socketMode: true,
});
if (process.env.CHANNEL_ID === undefined) {
    console.log("Channel ID is undefined!");
    process.exit(1);
}
async function sendMsg(args) {
    let chat = SApp.client.chat;
    chat.postMessage(args);
}
async function onStart() {
    await sendMsg({
        channel: process.env.CHANNEL_ID ?? "",
        text: "test?",
        blocks: (0, slack_block_builder_1.BlockCollection)(slack_block_builder_1.Blocks.Section({
            text: "Hey! I was restarted! Maybe I died or something...",
        }), slack_block_builder_1.Blocks.Actions().elements(slack_block_builder_1.Elements.Button({ text: "Damn", actionId: "cliked" }))),
    });
}
SApp.action("cliked", async ({ action, ack }) => {
    await ack();
    //console.log(action)
    await sendMsg({
        channel: process.env.CHANNEL_ID ?? "",
        text: "test???",
        blocks: (0, slack_block_builder_1.BlockCollection)(slack_block_builder_1.Blocks.Section({ text: `"Damn!"` })),
    });
    const testDoc = await (0, scraper_1.default)("dashboard/frame/pathways/");
    console.log(testDoc?.querySelectorAll(".shadow-sm"));
});
(async () => {
    await SApp.start();
    await onStart();
    console.log("App running...");
})();
