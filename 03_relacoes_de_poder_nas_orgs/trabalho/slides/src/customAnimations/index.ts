import type { RevealApi } from "reveal.js";
import type { ShapePair } from "../morph";
import teaser from "./teaserAnimations";

let customAnimations: { [slideId: string]: CustomAnimations } = {};

export function declareCustomAnimations(animations: CustomAnimations) {
  customAnimations[animations.slideId] = animations;
}

export function getCustomAnimations(slideId: string): CustomAnimations | undefined {
  return customAnimations[slideId];
}

export type CustomAnimations = {
  slideId: string;
  duration: number;
  apply(currShape: ShapePair, allShapes: ShapePair[], document: HTMLDocument, reveal: RevealApi): boolean;
};

teaser();
