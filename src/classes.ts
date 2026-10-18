import parser from "any-date-parser";
import HTMLParser from "node-html-parser";

export class Pathway {
  name: string;
  start: Date;
  end: Date;
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

      this.start = parser.fromString(startDate);
      this.end = parser.fromString(endDate);

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
          .split(RegExp("[\s]+"))
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
      this.start = parser.fromString(startDate);
      this.end = parser.fromString(endDate);

      let costText = element?.children[2]?.text;
      console.log(costText)
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

/*

                    
                        
<div class="bg-background border border-primary p-3 sm:p-4 shadow-sm"> 0
    <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"> 0
        <div class="flex-1 min-w-0"> 0
            <h2 class="text-xl sm:text-2xl font-bold truncate">
                Headphones
            </h2>
            <div class="text-sm text-muted-foreground mt-1">
                
                Started
                
                <span class="underline decoration-dotted" title="Oct. 11, 2026, 4 p.m.">
                    6 days ago
                </span>
                <span class="mx-1">•</span>
                Ends
                <span class="underline decoration-dotted" title="Oct. 21, 2026, 4 p.m.">
                    3 days from now
                </span>
            </div>
        </div>
        <div class="flex gap-2">
            <div class="group grow bg-secondary border border-border px-3 py-2 text-center shrink-0 transition-colors hover:bg-primary hover:text-primary-foreground active:translate-y-px active:bg-accent active:text-accent-foreground">
                <button onclick="createWindow('shop', this.dataset.url)" data-url="/dashboard/frame/shop/?pathway=4" type="button" class="w-full h-full cursor-pointer">
                    <div class="my-auto">
                        <div class="text-lg sm:text-xl font-bold">view shop</div>
                        
                        <div class="text-xs text-muted-foreground group-hover:text-primary-foreground/80 group-active:text-accent-foreground/80">0 golden twists</div>
                        
                    </div>
                </button>
            </div>
            
            <div class="grow">
                
                <div class="bg-success/40 border border-border px-3 py-2 text-center shrink-0 h-full">
                    <div class="text-lg sm:text-xl font-bold">unlocked</div>
                    <div class="text-xs text-muted-foreground">spent 2h</div>
                </div>
                
            </div>
            
        </div>
    </div>
</div>
*/

export class Pathways {
  currentPaths: Pathway[];
  pastPaths: Pathway[];
  constructor(currentPaths: Pathway[], pastPaths: Pathway[]) {
    this.currentPaths = currentPaths;
    this.pastPaths = pastPaths;
  }
}
