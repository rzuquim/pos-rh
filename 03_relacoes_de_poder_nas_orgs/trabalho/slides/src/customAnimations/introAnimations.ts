import gsap from "gsap";
import { declareCustomAnimations } from ".";
import type { ShapePair } from "../morph";
import type { TweenStep } from "../main";

export default function () {
  declareCustomAnimations({
    slideId: "intro",
    duration: DURATION,
    apply(shape, _, document) {
      if (shape.id != "dot4") {
        return false;
      }

      let tl = gsap.timeline();

      let moveToRight = 0.33 * DURATION;
      let bringBackAndUnderline = 0.67 * DURATION;

      transformShape(shape, tl, DURATION);
      moveToFarRight(shape, tl, { duration: moveToRight });
      bringBackToTitle(shape, tl, { duration: bringBackAndUnderline, startAt: moveToRight });
      animateUnderline(document, tl, { duration: bringBackAndUnderline, startAt: moveToRight });

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

function moveToFarRight(shape: ShapePair, tl: gsap.core.Timeline, step: TweenStep) {
  tl.fromTo(shape.curr, { x: 0 }, { x: 400, duration: step.duration, ease: "power2.out" }, 0);
}

function bringBackToTitle(shape: ShapePair, tl: gsap.core.Timeline, step: TweenStep) {
  tl.to(
    shape.curr,
    {
      x: 50,
      duration: step.duration,
      ease: "power2.inOut",
    },
    step.startAt,
  );
}

function animateUnderline(document: HTMLDocument, tl: gsap.core.Timeline, step: TweenStep) {
  let underline = document.querySelector(".title-underline");
  if (!underline) {
    return;
  }

  gsap.killTweensOf(underline);
  tl.fromTo(underline, { scaleX: 0 }, { scaleX: 1, duration: step.duration, ease: "power2.inOut" }, step.startAt);
}

const DURATION = 1.5;
