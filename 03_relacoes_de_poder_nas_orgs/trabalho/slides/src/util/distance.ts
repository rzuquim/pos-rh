import { type RevealApi } from "reveal.js";

export type Anchor =
  | "TOP_LEFT"
  | "TOP_CENTER"
  | "TOP_RIGHT"
  | "CENTER_LEFT"
  | "CENTER"
  | "CENTER_RIGHT"
  | "BOTTOM_LEFT"
  | "BOTTOM_CENTER"
  | "BOTTOM_RIGHT";

export type Axis = "x" | "y";

export type ElementTarget = Element | [Element, Anchor];

/**
 * Calculates the exact X and Y travel distance required to move the anchor
 * of the starting element to exactly overlap the anchor of the target element.
 * **NOTE**: it applies reveal.js scale factor
 */
export function travelDistance(reveal: RevealApi, start: ElementTarget, target: ElementTarget): [number, number] {
  let [startEl, startAnchor] = Array.isArray(start) ? start : [start, "CENTER" as Anchor];
  let [targetEl, targetAnchor] = Array.isArray(target) ? target : [target, "CENTER" as Anchor];

  let startPoint = getAnchorPoint(startEl, startAnchor);
  let targetPoint = getAnchorPoint(targetEl, targetAnchor);

  let scale = reveal.getScale() || 1;

  return [(targetPoint.x - startPoint.x) / scale, (targetPoint.y - startPoint.y) / scale];
}

function getAnchorPoint(el: Element, anchor: Anchor): { x: number; y: number } {
  let rect = el.getBoundingClientRect();
  let x = 0;
  let y = 0;

  if (anchor.includes("LEFT")) {
    x = rect.left;
  } else if (anchor.includes("RIGHT")) {
    x = rect.right;
  } else {
    x = rect.left + rect.width / 2; // CENTER
  }

  if (anchor.includes("TOP")) {
    y = rect.top;
  } else if (anchor.includes("BOTTOM")) {
    y = rect.bottom;
  } else {
    y = rect.top + rect.height / 2; // CENTER
  }

  return { x, y };
}

export function toSvgUnits(value: number, svg: SVGSVGElement, axis: Axis = "x") {
  let viewBoxWidth = axis === "x" ? svg.viewBox.baseVal.width : svg.viewBox.baseVal.height;
  let cssWidth = axis === "x" ? svg.clientWidth : svg.clientHeight;
  let svgUnitRatio = viewBoxWidth / cssWidth;

  return value * svgUnitRatio;
}
