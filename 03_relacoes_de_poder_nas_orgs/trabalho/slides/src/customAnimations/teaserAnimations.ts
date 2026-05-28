import gsap from "gsap";
import { declareCustomAnimations } from ".";
import type { ShapePair } from "../morph";
import type { TweenStep } from "../main";
import { travelDistance, toSvgUnits } from "../util";

export default function () {
  declareCustomAnimations({
    slideId: "teaser",
    duration: DURATION,
    apply(shape, _, document, reveal) {
      if (shape.id != "dot4") {
        return false;
      }

      let underline = document.querySelector(".title-underline") as HTMLElement;
      let header = document.querySelector("#teaser .header") as HTMLElement;

      if (!underline || !header) {
        throw "Could not find underline or slidesBound";
      }
      gsap.killTweensOf(underline);

      let tl = gsap.timeline();

      // TODO: TweenStep.durationPercent
      // NOTE: animation phases
      let moveToRight = 0.33;
      let sitStill = 0.1;
      let bringBackAndUnderline = 1 - moveToRight - sitStill;

      let [headerElementEdgePx] = travelDistance(reveal, shape.curr, [header, "BOTTOM_RIGHT"]);
      let headerElementeEdgeSvgUnits = toSvgUnits(headerElementEdgePx, shape.currSvgEl);

      transformShape(shape, tl, DURATION);
      moveToHeaderRightEdge(shape, headerElementeEdgeSvgUnits, tl, { duration: moveToRight * DURATION });
      bringBackToTitle(shape, tl, {
        duration: bringBackAndUnderline * DURATION,
        startAt: (moveToRight + sitStill) * DURATION,
      });
      animateUnderline(underline, tl, {
        duration: bringBackAndUnderline * DURATION,
        startAt: moveToRight * DURATION + 0.3,
      });

      tl.play();

      return true;
    },
  });
}

function transformShape({ curr, prev }: ShapePair, tl: gsap.core.Timeline, duration: number) {
  tl.from(
    curr,
    {
      duration,
      morphSVG: prev,
      ease: "power2.inOut",
    },
    0,
  );
}

function moveToHeaderRightEdge(shape: ShapePair, underlineRightEdge: number, tl: gsap.core.Timeline, step: TweenStep) {
  tl.to(shape.curr, { x: underlineRightEdge, duration: step.duration, ease: "power2.out" }, 0);
}

function bringBackToTitle(shape: ShapePair, tl: gsap.core.Timeline, step: TweenStep) {
  tl.to(
    shape.curr,
    {
      x: 0,
      duration: step.duration,
      ease: "power2.inOut",
    },
    step.startAt,
  );
}

function animateUnderline(underline: Element, tl: gsap.core.Timeline, step: TweenStep) {
  tl.fromTo(
    underline,
    { scaleX: 0 },
    {
      scaleX: 1,
      duration: step.duration,
      ease: "power2.inOut",
    },
    step.startAt,
  );
}

const DURATION = 1.5;
