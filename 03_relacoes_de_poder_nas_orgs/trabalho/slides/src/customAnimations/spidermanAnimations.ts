import gsap from "gsap";
import { declareCustomAnimations } from ".";
import type { ShapePair } from "../morph";
import type { TweenStep } from "../main";
import { travelDistance, toSvgUnits, type PointInSpace } from "../util";
import type { RevealApi } from "reveal.js";

const DURATION = 1;

export default function () {
  declareCustomAnimations({
    slideId: "cunhado",
    duration: DURATION,
    apply(shape, _, document, reveal, idx) {
      let targetLi = document.querySelector(`#cunhado ul li:nth-child(${idx + 1})`) as HTMLElement;
      let header = document.querySelector("#cunhado .title-underline") as HTMLElement;

      if (!targetLi) {
        console.error("Could not find target element for:", shape);
        return false;
      }
      let [travelPxX, travelPxY] = travelDistance(reveal, shape.curr, [targetLi, "CENTER_LEFT"]);
      let target = { x: toSvgUnits(travelPxX, shape.currSvgEl), y: toSvgUnits(travelPxY, shape.currSvgEl) };
      let swingApex = { x: target.x / 2, y: target.y - 30 };

      let fallPercent = 0.4;
      let swingUpPercent = 0.2;
      let flightDuration = 1 - (fallPercent + swingUpPercent);

      gsap.killTweensOf(shape.curr);

      let tl = gsap.timeline();
      transformIntoBall(shape, tl, DURATION);
      let web = createWeb(shape, reveal, header);

      let fallDuration = fallPercent * DURATION;
      let dipY = target.y * 0.66;
      fall(tl, web, dipY, { duration: fallDuration, startAt: 0 });
      castWeb(tl, web, { duration: 0.1, startAt: fallDuration * 0.6 });

      let swingDuration = swingUpPercent * DURATION;
      swingUp(tl, { x: 0, y: dipY }, swingApex, web, { duration: swingDuration, startAt: fallDuration });
      releaseWeb(tl, web, { duration: 0.05, startAt: fallDuration + swingDuration });

      let airStartAt = fallDuration + swingDuration;

      morphIntoSmallBall(tl, shape, { duration: flightDuration, startAt: airStartAt });
      freeFlight(tl, web, target, shape.currSvgEl, swingApex, { duration: flightDuration, startAt: airStartAt });

      tl.play();
      return true;
    },
  });
}

function transformIntoBall({ curr, prev }: ShapePair, tl: gsap.core.Timeline, duration: number) {
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

function castWeb(tl: gsap.core.Timeline, web: Web, step: TweenStep) {
  tl.to(
    web.pathEl,
    {
      opacity: 1,
      duration: step.duration,
      ease: "power4.out",
    },
    step.startAt,
  );
}

function releaseWeb(tl: gsap.core.Timeline, web: Web, step: TweenStep) {
  tl.to(
    web.pathEl,
    {
      opacity: 0,
      duration: step.duration,
      ease: "power4.out",
      onComplete: () => {
        web.pathEl.remove();
      },
    },
    step.startAt,
  );
}

function fall(tl: gsap.core.Timeline, web: Web, dipY: number, step: TweenStep) {
  tl.to(
    web.currBoundPos,
    {
      y: dipY,
      duration: step.duration,
      ease: "power2.in",
      onUpdate: web.renderFn,
    },
    step.startAt,
  );
}

function createWeb(shape: ShapePair, reveal: RevealApi, header: HTMLElement): Web {
  let web = document.createElementNS("http://www.w3.org/2000/svg", "line");
  web.setAttribute("stroke", "#d1d5db"); // Light gray web color
  web.setAttribute("stroke-width", "0.3");
  web.setAttribute("stroke-dasharray", "1, 0.5");
  web.setAttribute("opacity", "0");

  let [anchorPxX, anchorPxY] = travelDistance(reveal, shape.curr, [header, "BOTTOM_CENTER"]);
  let anchorSvgX = toSvgUnits(anchorPxX, shape.currSvgEl);
  let anchorSvgY = toSvgUnits(anchorPxY, shape.currSvgEl);

  web.setAttribute("x1", String(anchorSvgX));
  web.setAttribute("y1", String(anchorSvgY));

  shape.currSvgEl.insertBefore(web, shape.curr);

  let pos = { x: 0, y: 0, rotation: 0 };
  return {
    pathEl: web,
    currBoundPos: pos,
    pivot: { x: anchorSvgX, y: anchorSvgY },
    renderFn: () => {
      gsap.set(shape.curr, {
        x: pos.x,
        y: pos.y,
        rotation: pos.rotation,
        transformOrigin: "50% 50%",
      });

      web.setAttribute("x2", String(DOT_RADIUS + pos.x));
      web.setAttribute("y2", String(DOT_RADIUS + pos.y));
    },
  };
}

function swingUp(tl: gsap.core.Timeline, dipPos: PointInSpace, targetPos: PointInSpace, web: Web, step: TweenStep) {
  let { x: startX, y: startY } = dipPos;
  let { x: pivotX, y: pivotY } = web.pivot;

  let startAngle = Math.atan2(startY - pivotY, startX - pivotX);
  let startRadius = Math.hypot(startX - pivotX, startY - pivotY);

  let endAngle = Math.atan2(targetPos.y - pivotY, targetPos.x - pivotX);
  let endRadius = Math.hypot(targetPos.x - pivotX, targetPos.y - pivotY);

  if (endAngle - startAngle > Math.PI) {
    endAngle -= Math.PI * 2;
  }
  if (startAngle - endAngle > Math.PI) {
    endAngle += Math.PI * 2;
  }

  let polar = { angle: startAngle, r: startRadius };

  tl.to(
    polar,
    {
      angle: endAngle,
      r: endRadius,
      duration: step.duration,
      // NOTE: sine.out is mathematically perfect for pendulum motion approaching an apex,
      //       simulating gravity slowing it down until velocity is 0.
      ease: "sine.out",
      onUpdate: () => {
        web.currBoundPos.x = pivotX + polar.r * Math.cos(polar.angle);
        web.currBoundPos.y = pivotY + polar.r * Math.sin(polar.angle);

        web.renderFn();
      },
    },
    step.startAt,
  );
}

function morphIntoSmallBall(tl: gsap.core.Timeline, shape: ShapePair, step: TweenStep) {
  tl.to(
    shape.curr,
    {
      duration: step.duration,
      scale: 0.3,
      ease: "power3.in",
    },
    step.startAt,
  );
}

function freeFlight(
  tl: gsap.core.Timeline,
  web: Web,
  target: PointInSpace,
  svgEl: SVGSVGElement,
  swingApex: PointInSpace,
  step: TweenStep,
) {
  let apexY = swingApex.y - 15;

  tl.to(
    web.currBoundPos,
    {
      x: target.x,
      ease: "power1.out",
      duration: step.duration,
      onUpdate: web.renderFn,
      onComplete: () => {
        gsap.to(web.currBoundPos, {
          x: target.x - 5.4,
          y: target.y + 0.5,
          duration: 0.15,
          ease: "back.out(2)",
          onUpdate: web.renderFn,
        });

        svgEl.classList.add("landed");
      },
    },
    step.startAt,
  );

  let upDuration = step.duration * 0.4;
  tl.to(
    web.currBoundPos,
    {
      y: apexY,
      ease: "power2.out",
      duration: upDuration,
    },
    step.startAt,
  );

  tl.to(
    web.currBoundPos,
    {
      y: target.y,
      ease: "power2.in",
      duration: step.duration - upDuration,
    },
    step.startAt + upDuration,
  );
}

type Web = {
  renderFn: () => void;
  currBoundPos: PointInSpace;
  pivot: PointInSpace;
  pathEl: SVGPathElement;
};

const DOT_RADIUS = 5;
