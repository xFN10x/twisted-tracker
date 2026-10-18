import ky, { HTTPError } from "ky";
import HTMLParser from "node-html-parser";
import { Pathway, Pathways } from "./classes";
import { sendMsg, sendMsgDebug, sendMsgMrkDwn } from ".";
import { BlockCollection, Blocks, Elements } from "slack-block-builder";

export default async function twistedGetDocument(
  path: string,
): Promise<HTMLParser.HTMLElement | undefined> {
  const resolved = `${process.env.TWISTED_URL}${path}`;
  try {
    const response = await ky(resolved, {
      headers: {
        Cookie: process.env.TWISTED_COOKIE,
      },
    }).text();
    const html = HTMLParser.parse(response).removeWhitespace();
    if (html.querySelector(".flag-wave") !== null && path != "/") {
      sendMsgDebug("Returned main site when not requesting it? Update session-id?")
      throw Error(
        "Returned main site when not requesting it? Update session-id?",
      );
    }
    return html;
  } catch (error) {
    console.log(`Failed to get web-page from ${resolved}. `, error);
    return undefined;
  }
}

export async function getPathways(): Promise<Pathways | undefined> {
  try {
    const pathsPage = await twistedGetDocument("dashboard/frame/pathways/");
  //console.log(pathsPage)
  const pathGrids = pathsPage?.querySelectorAll(".grid");
  //0 is current paths
  //1 is past
  if (pathGrids === undefined) return undefined;
  //console.log(pathGrids)

  const currentPathsAry = Array();
  for (const pathElement of pathGrids[0].children) {
    let path = new Pathway(pathElement, false);
    sendMsgDebug(
      `_**yo yo yooo!! look at this pathway**_ i scraped!!\n\nname: \`${path.name}\`\nstarted: \'${path.start.toDateString()}\'\nends: \'${path.end.toDateString()}\'\ncosts: \`${path.cost}\``,
    );
    currentPathsAry.push(path);
  }

  const pastPathsAry = Array();
  for (const pathElement of pathGrids[1].children) {
    let path = new Pathway(pathElement, true);
    sendMsgDebug(
      `_**yo yo yooo!! look at this (past) pathway i scraped!!**_\n\nname: \`${path.name}\`\nstarted: \'${path.start.toDateString()}\'\nends: \'${path.end.toDateString()}\'\ncosts: \`${path.cost}\``,
    );
    pastPathsAry.push(path);
  }
  } catch (e) {
    console.log("failed to get paths: ", e)
    sendMsgDebug("Failed to get pathways!")
  }
}
