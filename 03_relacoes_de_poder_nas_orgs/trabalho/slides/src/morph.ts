import gsap from "gsap";
import type { RevealApi } from "reveal.js";
import { getCustomAnimations } from "./customAnimations";

export function subMorphShapes(deck: RevealApi) {
  deck.on("slidechanged", (evt: unknown) => {
    let { previousSlide, currentSlide } = evt as SlideChangedEvent;

    if (!previousSlide || !currentSlide) {
      console.error("No prev or currSlide", previousSlide, currentSlide);
      return;
    }

    let shapePairs = mapByIds(previousSlide, currentSlide);
    let customAnimations = getCustomAnimations(currentSlide.id);

    for (let shapes of shapePairs) {
      gsap.killTweensOf(shapes.curr);

      let duration = customAnimations?.duration || DEFAULT_DURATION;

      if (customAnimations?.apply(shapes, shapePairs, document)) {
        console.log(`Custom animation applied in slide:`, shapes);
      } else {
        console.log(`Default animation applied in slide:`, shapes);

        gsap.from(shapes.curr, {
          duration: duration,
          morphSVG: shapes.prev,
          ease: "power2.inOut",
        });
      }
    }
  });
}

function mapByIds(prevSlide: HTMLElement, currSlide: HTMLElement): ShapePair[] {
  let pairs: ShapePair[] = [];
  currSlide.querySelectorAll(".dot").forEach((currSvg) => {
    let dataId = currSvg.getAttribute("data-id");
    if (!dataId) {
      console.error("Could not find data-id on SVG", currSvg);
      throw "Could not find data-id on SVG";
    }

    let prevSvg = prevSlide.querySelector(`.dot[data-id="${dataId}"]`);
    if (!prevSvg) {
      console.error("Could not find pair for on prev slide", dataId);
      throw "Could not find pair for on prev slide";
    }

    let currShape = currSvg.querySelector(".shape") as SVGPathElement;
    let prevShape = prevSvg.querySelector(".shape") as SVGPathElement;

    if (!currShape || !prevShape) {
      console.error("Could not find .shape on one of the SVGs", currSvg, prevSvg);
      throw "Could not find .shape on one of the SVGs";
    }
    pairs.push({ id: dataId, prev: prevShape, curr: currShape });
  });

  return pairs;
}

export type ShapePair = {
  id: string;
  prev: SVGPathElement;
  curr: SVGPathElement;
};

type SlideChangedEvent = {
  previousSlide: HTMLElement;
  currentSlide: HTMLElement;
};

const DEFAULT_DURATION = 1.0;
