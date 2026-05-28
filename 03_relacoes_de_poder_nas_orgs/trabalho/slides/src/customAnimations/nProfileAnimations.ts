import gsap from "gsap";
import { declareCustomAnimations } from ".";
import type { ShapePair } from "../morph";
import type { TweenStep } from "../main";

export default function () {
  declareCustomAnimations({
    slideId: "n-profile",
    duration: DURATION,
    apply(shape, _shapes, _doc, _reveal, idx) {
      let tl = gsap.timeline();

      let delay = idx * 0.3;
      let morphStep: TweenStep = { duration: DURATION + delay, startAt: delay };

      transformShape(shape, tl, morphStep);
      fitIntoFrame(shape, idx, tl, morphStep);

      tl.play();

      return true;
    },
  });
}

function transformShape({ curr, prev }: ShapePair, tl: gsap.core.Timeline, step: TweenStep) {
  tl.from(
    curr,
    {
      duration: step.duration * 0.9,
      morphSVG: prev,
      ease: "elastic.out(1, 0.75)",
    },
    step.startAt,
  );
}

function fitIntoFrame({ curr }: ShapePair, idx: number, tl: gsap.core.Timeline, step: TweenStep) {
  idx += 1;
  let dirX = idx % 2 === 0 ? -1 : 1;
  let dirY = idx < 3 ? -1 : 1;

  tl.fromTo(
    curr,
    {
      x: dirX * idx * 30,
      y: dirY * idx * 20,
      rotation: 75 * dirX * dirY * (5 - idx),
      transformOrigin: "50% 50%",
      scale: 1 + idx * 0.3,
    },
    {
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1,
      duration: step.duration,
      ease: "elastic.out(2, 0.5)",
    },
    step.startAt,
  );
}

const DURATION = 2;
