import ky from "ky";
import HTMLParser from "node-html-parser"

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

    return HTMLParser.parse(response)
  } catch (error) {
    console.log(`Failed to get web-page from ${resolved}. `, error);
    return undefined;
  }
}

export async function getPaths() {
    
}