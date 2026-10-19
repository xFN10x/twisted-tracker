import ky, { HTTPError, NetworkError } from "ky";
import HTMLParser from "node-html-parser";
import { Pathway, Pathways } from "./classes";
import { sendMsg, sendMsgDebug, sendMsgMrkDwn } from ".";
import { BlockCollection, Blocks, Context, Elements, Header, Section } from "slack-block-builder";
import { createFile, existsSync, readJson, writeJSON } from "fs-extra";
import path from "node:path";
import { Block } from "@minecraft/server";
import parser from "any-date-parser";

var saveLoc = "storage/"
var pathwaysSaveLoc = saveLoc + "latest_paths.json"

export async function wj(pth: string, obj: Object) {
	await createFile(pth)
	await writeJSON(pth, obj)
}

export async function twistedGetDocument(
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
			sendMsgDebug(
				"Returned main site when not requesting it? Update session-id?",
			);
			throw Error(
				"Returned main site when not requesting it? Update session-id?",
			);
		}
		return html;
	} catch (error) {
		if (error instanceof NetworkError) await sendMsgMrkDwn("_Oof! Failed to get webpage!_")
		console.log(`Failed to get web-page from ${resolved}. `, error);
		return undefined;
	}
}

export async function getPathways(): Promise<Pathways | null> {
	try {
		const pathsPage = await twistedGetDocument("dashboard/frame/pathways/");
		//console.log(pathsPage)
		const pathGrids = pathsPage?.querySelectorAll(".grid");
		//0 is current paths
		//1 is past
		if (pathGrids === undefined) return null;
		//console.log(pathGrids)

		const currentPathsAry = Array();
		for (const pathElement of pathGrids[0].children) {
			let path = new Pathway(pathElement, false);
			/*sendMsgDebug(
				`_**yo yo yooo!! look at this pathway**_ i scraped!!\n\nname: \`${path.name}\`\nstarted: \'${path.start.toDateString()}\'\nends: \'${path.end.toDateString()}\'\ncosts: \`${path.cost}\``,
			);*/
			currentPathsAry.push(path);
		}

		const pastPathsAry = Array();
		for (const pathElement of pathGrids[1].children) {
			let path = new Pathway(pathElement, true);
			/*sendMsgDebug(
				`_**yo yo yooo!! look at this (past) pathway i scraped!!**_\n\nname: \`${path.name}\`\nstarted: \'${path.start.toDateString()}\'\nends: \'${path.end.toDateString()}\'\ncosts: \`${path.cost}\``,
			);*/
			pastPathsAry.push(path);
		}
		const pathways = new Pathways(currentPathsAry, pastPathsAry);

		wj(pathwaysSaveLoc, pathways)
		return pathways
	} catch (e) {
		console.log("failed to get paths: ", e);
		sendMsgDebug("Failed to get pathways!");
		return null;
	}
}

export async function checkPathways() {
	try {
		if (!existsSync(pathwaysSaveLoc)) {
			await getPathways()
			return;
		}
		const lastCheck: Pathways = await readJson(pathwaysSaveLoc) as Pathways;
		const currentCheck: Pathways | null = await getPathways();
		if (currentCheck == null) return;

		//check if any have ended
		//check last current paths, if they are in the past in the current, it ended.
		for (const path of lastCheck.currentPaths) {
			for (const currentPath of currentCheck.pastPaths) {
				if (currentPath.name === path.name) {
					//it ended.
					sendMsg({
						channel: process.env.CHANNEL_ID ?? "",
						text: `${path.name} path has ended!`,
						blocks: BlockCollection(
							Header({ text: `${path.name} Pathway has ended!` }),
							Section({ text: `${path.name} ended on ${path.end.toLocaleString()}. (${(new Date(path.end).getUTCMilliseconds() - Date.now()) / 86400000} days ago.)` }),
							Context().elements("hey! @channel! this is important!")
						)
					})
				}
			}
		}

		//10 minutes
		setTimeout(() => checkPathways(), 1000 * 60 * 10)
	} catch (e) {
		sendMsgDebug("Failed to check pathways for updates!")
		console.log("Failed to check paths, ", e)
	}
}