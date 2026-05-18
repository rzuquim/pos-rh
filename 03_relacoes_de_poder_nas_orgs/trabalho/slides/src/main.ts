import gsap from "gsap";

import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";

import "reveal.js/reveal.css";
import "reveal.js/theme/black.css";

import "./styles/style.css";
import "./styles/cover.css";

import "./morph.ts";

import Reveal from "reveal.js";
import Markdown from "reveal.js/plugin/markdown";
import { subMorphShapes } from "./morph.ts";

let slidesDOM = document.querySelector(".slides");
if (!slidesDOM) {
  console.error("Could not find slides container.");
}

let slideModules = import.meta.glob("../slides/*.html", {
  query: "?raw",
  import: "default",
  eager: true,
});

let sortedSlidePaths = Object.keys(slideModules).sort();

let allSlidesHTML = "";
for (const path of sortedSlidePaths) {
  allSlidesHTML += slideModules[path] as string;
}

slidesDOM.innerHTML = allSlidesHTML;

let deck = new Reveal({
  plugins: [Markdown],
});

gsap.registerPlugin(MorphSVGPlugin);
MorphSVGPlugin.convertToPath("circle, rect, polygon");

subMorphShapes(deck);
deck.initialize();
