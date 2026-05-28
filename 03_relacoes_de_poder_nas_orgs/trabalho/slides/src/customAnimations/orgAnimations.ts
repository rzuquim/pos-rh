import gsap from "gsap";
import { declareCustomAnimations } from ".";
import type { TweenStep } from "../main";
import type { RevealApi } from "reveal.js";

export default function () {
  declareCustomAnimations({
    slideId: "org",
    duration: ORG_DURATION,
    globalApply(_shapes, doc, reveal) {
      hideOrgChart();

      let tl = gsap.timeline();

      let showNodesDur = 0.6;
      let showLinksDur = 1 - showNodesDur;

      showNodes(tl, doc, reveal, showNodesDur);
      showLinks(tl, showLinksDur);

      tl.play();

      return true;
    },
    apply(shape, _shapes, _doc, _reveal, idx) {
      let tl = gsap.timeline();
      let { curr } = shape;

      let waitForOrgAnimation = ORG_DURATION;

      // NOTE: the duration should match the `data-auto-animate-delay` on org.html
      shrink(tl, curr, idx, { duration: 0.3 });
      reveal(tl, curr, { duration: REVEAL_DURATION, startAt: waitForOrgAnimation });

      tl.play();

      return true;
    },
  });
}

const ORG_DURATION = 1;
const REVEAL_DURATION = 2;

function hideOrgChart() {
  gsap.set(".node", {
    opacity: 0,
    y: -40,
    scale: 0.8,
    transformOrigin: "center center",
  });

  gsap.set(".link", {
    opacity: 0,
  });
}

function showNodes(tl: gsap.core.Timeline, doc: HTMLDocument, reveal: RevealApi, durationPercent: number) {
  tl.to(
    ".node",
    {
      duration: durationPercent * ORG_DURATION,
      opacity: 1,
      y: 0,
      scale: 1,
      stagger: {
        each: 0.1,
        from: "start",
      },
      ease: "elastic.out(1, 1)",
    },
    0,
  );
}

function showLinks(tl: gsap.core.Timeline, durationPercent: number) {
  tl.to(
    ".link",
    {
      duration: durationPercent * ORG_DURATION,
      opacity: 1,
      stagger: 0.02,
      ease: "power2.inOut",
    },
    (1 - durationPercent) * ORG_DURATION,
  );
}

function shrink(tl: gsap.core.Timeline, curr: SVGPathElement, idx: number, step: TweenStep) {
  tl.fromTo(
    curr,
    {
      scale: 1,
      opacity: 1,
      transformOrigin: SHRINK_ORIGIN[idx],
    },
    {
      duration: step.duration,
      scale: 0,
      opacity: 0,
      ease: "power3.in",
    },
  );
}

function reveal(tl: gsap.core.Timeline, curr: SVGPathElement, step: TweenStep) {
  let snapDur = 0.95;
  let afterShockDur = 1 - snapDur;

  tl.to(
    curr,
    {
      scale: 1,
      opacity: 1,
      duration: snapDur * step.duration,
      ease: "elastic.out(1.1, 0.2)",
    },
    step.startAt,
  );

  tl.to(
    curr,
    {
      scale: 1.05,
      duration: afterShockDur * step.duration,
      yoyo: true,
      repeat: 1,
      ease: "sine.inOut",
    },
    step.startAt + afterShockDur * step.duration,
  );
}

const SHRINK_ORIGIN = ["right bottom", "left bottom", "right top", "left top"];
