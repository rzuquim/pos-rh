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

    if (customAnimations?.globalApply) {
      let keepGoing = customAnimations.globalApply(shapePairs, document, deck);
      if (!keepGoing) {
        return;
      }
    }

    // TOOD: add into shape
    let idx = 0;
    for (let shapes of shapePairs) {
      gsap.killTweensOf(shapes.curr);

      let duration = customAnimations?.duration || DEFAULT_DURATION;

      if (customAnimations?.apply(shapes, shapePairs, document, deck, idx)) {
        // console.log(`Custom animation applied in slide:`, shapes);
      } else {
        // console.log(`Default animation applied in slide:`, shapes);
        gsap.from(shapes.curr, {
          duration: duration,
          morphSVG: shapes.prev,
          ease: "power2.inOut",
        });
      }

      idx++;
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

    let currShape = currSvg.querySelector(".shape") || currSvg.querySelector("path");
    let prevShape = prevSvg.querySelector(".shape") || prevSvg.querySelector("path");

    if (!currShape || !prevShape) {
      console.error("Could not find .shape on one of the SVGs", currSvg, prevSvg);
      throw "Could not find .shape on one of the SVGs";
    }
    pairs.push({
      id: dataId,
      prev: prevShape as SVGPathElement,
      curr: currShape as SVGPathElement,
      currSvgEl: currSvg as SVGSVGElement,
      prevSvgEl: prevSvg as SVGSVGElement,
    });
  });

  return pairs;
}

export type ShapePair = {
  // The shared data-id used to match the starting and ending elements across Reveal.js slides
  id: string;

  // --- THE ART (Target for Morphing) ---
  // We store the inner shapes specifically to feed into GSAP's morphSVG plugin.
  // CRUCIAL: Do NOT animate x/y on these! Doing so triggers the "ViewBox Trap",
  // where GSAP calculates movement in internal SVG units instead of actual screen pixels.
  prev: SVGPathElement;
  curr: SVGPathElement;

  // --- THE CONTAINER (Target for Movement) ---
  // We store the outer <svg> wrappers to handle physical layout animations (x, y, scale).
  // Because these wrappers exist in the standard DOM layout space, animating them
  // guarantees our pixel calculations (like distance formulas) remain 1:1 with CSS screen pixels.
  currSvgEl: SVGSVGElement;
  prevSvgEl: SVGSVGElement;
};

type SlideChangedEvent = {
  previousSlide: HTMLElement;
  currentSlide: HTMLElement;
};

const DEFAULT_DURATION = 1.0;
