export function loadSlidesIntoDOM(container: HTMLElement) {
  let slideModules = import.meta.glob("../../slides/*.html", {
    query: "?raw",
    import: "default",
    eager: true,
  });

  let partials = loadPartials();

  let sortedSlidePaths = Object.keys(slideModules).sort();

  var parser = new DOMParser();
  let allSlidesHTML = "";

  for (const path of sortedSlidePaths) {
    var rawSlideHTML = slideModules[path] as string;
    let doc = parser.parseFromString(rawSlideHTML, "text/html");
    for (const tagName in partials) {
      let partialHTML = partials[tagName];

      doc.querySelectorAll(tagName).forEach((el) => {
        el.outerHTML = partialHTML;
      });
    }

    allSlidesHTML += doc.body.innerHTML;
  }

  container.innerHTML = allSlidesHTML;
}

function loadPartials(): Record<string, string> {
  let partialPaths = import.meta.glob("../../partials/*.html", {
    query: "?raw",
    import: "default",
    eager: true,
  });

  let partials: Record<string, string> = {};
  for (const path in partialPaths) {
    let tagName = path.split("/").pop()?.replace(".html", "");
    if (tagName) {
      partials[tagName] = partialPaths[path] as string;
    } else {
      console.error("could not extract tag from partial name", path);
    }
  }
  return partials;
}
