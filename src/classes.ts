import parser from "any-date-parser";
import HTMLParser from "node-html-parser";

export class Pathway {
  name: string;
  start: number;
  end: number;
  cost: number | undefined;

  //altType
  constructor(element: HTMLParser.HTMLElement, altType: boolean) {
    element.removeWhitespace();
    if (!altType) {
      //current paths

      let main: HTMLParser.HTMLElement | undefined = element.firstElementChild;
      //first element has the name of the path, and the dates
      let child1 = main?.firstElementChild;
      this.name = child1?.firstElementChild?.text.trim() ?? "error";
      console.log("Name of pathway: ", this.name);

      let datesArea = child1?.lastElementChild;
      // console.log("dates: ", datesArea?.children);
      //console.log("len: ", datesArea?.children.length);
      let startDate = datesArea?.children[0].getAttribute("title") ?? "";
      let endDate = datesArea?.children[2].getAttribute("title") ?? "";

      this.start = parser.fromString(startDate).getTime();
      this.end = parser.fromString(endDate).getTime();

      let child2 = main?.lastElementChild;
      //why is this under 3 different things??
      let unlockButton = child2?.lastElementChild?.firstElementChild;
      if (
        unlockButton?.firstElementChild?.classNames.includes(
          "cursor-not-allowed!",
        )
      )
        unlockButton = unlockButton.firstElementChild;
      //this text is either,
      //"spent #h"
      //"you need #h"
      //"???? #h"
      //to make this fool proof, ill make it split into parts then take the last and remove the h
      //idk why im typing all of this
      let costText = unlockButton?.children[1]?.text;
      if (costText !== undefined) {
        let hoursText = costText
          .split(RegExp(/[\s]+/g))
          .findLast((str) => str.endsWith("h"));
        let hoursStr = hoursText?.substring(0, hoursText.length - 1);
        console.log(hoursStr);
        this.cost = Number(hoursStr);
      }
    } else {
      //current paths (past)
      //console.log(element)
      let nameParent = element.firstElementChild;
      this.name = nameParent?.firstElementChild?.text ?? "error";
      console.log("Name of pathway: ", this.name);
      let datesArea = element.children[1];
      //console.log("name parent: ", nameParent);
      //console.log("dates: ", datesArea?.children);
      let startDate = datesArea?.children[0].getAttribute("title") ?? "";
      let endDate = datesArea?.children[2].getAttribute("title") ?? "";
      this.start = parser.fromString(startDate).getTime();
      this.end = parser.fromString(endDate).getTime();

      let costText = element?.children[2]?.text;
      //console.log(costText)
      if (costText !== undefined) {
        let hoursText = costText
          .split(/[\s]+/g)
          .findLast((str) => str.endsWith("h"));
        let hoursStr = hoursText?.substring(0, hoursText.length - 1);
        console.log(hoursStr);
        this.cost = Number(hoursStr);
      }
    }
  }
}

export class Pathways {
  currentPaths: Pathway[];
  pastPaths: Pathway[];
  constructor(currentPaths: Pathway[], pastPaths: Pathway[]) {
    this.currentPaths = currentPaths;
    this.pastPaths = pastPaths;
  }
}
