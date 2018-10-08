let lastElement;
let height;
let width;
let bounds;
let anchoredBounds;
let horizontalRuler;
let horizontalRuler2;
let horizontalRulerText;
let horizontalRulerText2;
let verticalRuler;
let verticalRuler2;
let verticalRulerText;
let verticalRulerText2;
let anchor;
let prevDocumentOnClick;
const HOVER_CLASS = "chrome-extension-inspect-invision-hover";

function hide(list) {
  list.forEach(el => {
    el.attributeStyleMap.set("display", new CSSKeywordValue("none"));
  });
}

function remove(list) {
  list.forEach(el => {
    el.remove();
  });
}

function setRulerText(
  ruler,
  max,
  min,
  side,
  size,
  offset = 0,
  forceOffset = false
) {
  const number = max - min;
  const text = number === parseInt(number) ? number : number.toFixed(2);

  ruler.textContent = `${text}px`;
  ruler.attributeStyleMap.set(size, CSS.px(max - min));

  if (side === "top") {
    if (!forceOffset) {
      ruler.attributeStyleMap.set(side, CSS.px(min + (max - min) / 2 + offset));
    } else {
      ruler.attributeStyleMap.set(side, CSS.px(max - 6));
    }
  } else {
    ruler.attributeStyleMap.set(side, CSS.px(min + offset));
  }
  ruler.attributeStyleMap.set("display", new CSSKeywordValue("flex"));
}

function setDistanceRuler(ruler, min, max, side, size) {
  ruler.attributeStyleMap.set(side, CSS.px(min));
  ruler.attributeStyleMap.set(size, CSS.px(max - min));
  ruler.attributeStyleMap.set("display", new CSSKeywordValue("block"));
}

function drawDistanceRulers() {
  let side;
  let min;
  let max;
  anchoredBounds = anchor.getBoundingClientRect();

  if (
    bounds.left > anchoredBounds.right ||
    bounds.right < anchoredBounds.left
  ) {
    min =
      bounds.left > anchoredBounds.right ? anchoredBounds.right : bounds.right;
    max =
      bounds.left > anchoredBounds.right ? bounds.left : anchoredBounds.left;

    setDistanceRuler(horizontalRuler, min, max, "left", "width");
    setRulerText(horizontalRulerText, max, min, "left", "width");

    hide([horizontalRuler2, horizontalRulerText2]);
  } else {
    side = "left";
    min =
      bounds[side] < anchoredBounds[side] ? bounds[side] : anchoredBounds[side];
    max =
      bounds[side] > anchoredBounds[side] ? bounds[side] : anchoredBounds[side];

    setDistanceRuler(horizontalRuler, min, max, "left", "width");
    setRulerText(horizontalRulerText, max, min, "left", "width");

    side = "right";
    min =
      bounds[side] < anchoredBounds[side] ? bounds[side] : anchoredBounds[side];
    max =
      bounds[side] > anchoredBounds[side] ? bounds[side] : anchoredBounds[side];

    setDistanceRuler(horizontalRuler2, min, max, "left", "width");
    setRulerText(horizontalRulerText2, max, min, "left", "width");
  }

  if (
    bounds.top > anchoredBounds.bottom ||
    bounds.bottom < anchoredBounds.top
  ) {
    min =
      bounds.bottom < anchoredBounds.top
        ? bounds.bottom
        : anchoredBounds.bottom;
    max = bounds.bottom < anchoredBounds.top ? anchoredBounds.top : bounds.top;

    min += window.scrollY;
    max += window.scrollY;

    setDistanceRuler(verticalRuler, min, max, "top", "height");
    setRulerText(
      verticalRulerText,
      max,
      min,
      "top",
      "height",
      window.scrollY,
      true
    );

    hide([verticalRuler2, verticalRulerText2]);
  } else {
    side = "top";
    min =
      bounds[side] < anchoredBounds[side] ? bounds[side] : anchoredBounds[side];
    max =
      bounds[side] > anchoredBounds[side] ? bounds[side] : anchoredBounds[side];

    min += window.scrollY;
    max += window.scrollY;

    setDistanceRuler(verticalRuler, min, max, "top", "height");
    setRulerText(verticalRulerText, max, min, "top", "height");

    side = "bottom";
    min =
      bounds[side] < anchoredBounds[side] ? bounds[side] : anchoredBounds[side];
    max =
      bounds[side] > anchoredBounds[side] ? bounds[side] : anchoredBounds[side];

    min += window.scrollY;
    max += window.scrollY;

    setDistanceRuler(verticalRuler2, min, max, "top", "height");
    setRulerText(verticalRulerText2, max, min, "top", "height");
  }
}

function drawSizeRulers() {
  hide([horizontalRuler2, horizontalRulerText2]);
  hide([verticalRuler2, verticalRulerText2]);

  horizontalRuler.attributeStyleMap.set("left", CSS.px(bounds.left));
  horizontalRuler.attributeStyleMap.set(
    "width",
    CSS.px(bounds.right - bounds.left)
  );
  horizontalRuler.attributeStyleMap.set(
    "display",
    new CSSKeywordValue("block")
  );

  setRulerText(horizontalRulerText, bounds.right, bounds.left, "left", "width");

  verticalRuler.attributeStyleMap.set(
    "top",
    CSS.px(bounds.top + window.scrollY)
  );
  verticalRuler.attributeStyleMap.set(
    "height",
    CSS.px(bounds.bottom - bounds.top)
  );
  verticalRuler.attributeStyleMap.set("display", new CSSKeywordValue("block"));

  setRulerText(
    verticalRulerText,
    bounds.bottom,
    bounds.top,
    "top",
    "height",
    window.scrollY
  );
}

function handleHover(e) {
  const [x, y] = [e.clientX, e.clientY];
  const element = document.elementFromPoint(x, y);

  if (lastElement) {
    lastElement.classList.remove(HOVER_CLASS);
  }

  element.classList.add(HOVER_CLASS);
  lastElement = element;
  height = element.clientHeight;
  width = element.clientWidth;
  bounds = element.getBoundingClientRect();

  if (!anchor) {
    drawSizeRulers();
  } else {
    drawDistanceRulers();
  }
}

function handleClick(e) {
  e.preventDefault();
  e.stopPropagation();

  if (e.target === anchor) {
    e.target.classList.remove("chrome-extension-inspect-invision-active");
    anchor = null;
  } else {
    if (anchor) {
      anchor.classList.remove("chrome-extension-inspect-invision-active");
    }
    e.target.classList.add("chrome-extension-inspect-invision-active");
    anchor = e.target;
  }

  if (prevDocumentOnClick) {
    prevDocumentOnClick();
  }
}

function init() {
  if (
    !document.body.classList.contains(
      "chrome-extension-inspect-invision-cursor"
    )
  ) {
    horizontalRuler = document.createElement("div");
    horizontalRuler.classList.add(
      "chrome-extension-inspect-invision-horizontal-ruler"
    );

    horizontalRulerText = document.createElement("div");
    horizontalRulerText.classList.add(
      "chrome-extension-inspect-invision-horizontal-ruler-text"
    );

    horizontalRuler2 = document.createElement("div");
    horizontalRuler2.classList.add(
      "chrome-extension-inspect-invision-horizontal-ruler"
    );

    horizontalRulerText = document.createElement("div");
    horizontalRulerText.classList.add(
      "chrome-extension-inspect-invision-horizontal-ruler-text"
    );

    horizontalRulerText2 = document.createElement("div");
    horizontalRulerText2.classList.add(
      "chrome-extension-inspect-invision-horizontal-ruler-text"
    );

    verticalRuler = document.createElement("div");
    verticalRuler.classList.add(
      "chrome-extension-inspect-invision-vertical-ruler"
    );

    verticalRulerText = document.createElement("div");
    verticalRulerText.classList.add(
      "chrome-extension-inspect-invision-vertical-ruler-text"
    );

    verticalRuler2 = document.createElement("div");
    verticalRuler2.classList.add(
      "chrome-extension-inspect-invision-vertical-ruler"
    );

    verticalRulerText2 = document.createElement("div");
    verticalRulerText2.classList.add(
      "chrome-extension-inspect-invision-vertical-ruler-text"
    );

    document.body.appendChild(horizontalRuler);
    document.body.appendChild(horizontalRulerText);

    document.body.appendChild(horizontalRuler2);
    document.body.appendChild(horizontalRulerText2);

    document.body.appendChild(verticalRuler);
    document.body.appendChild(verticalRulerText);

    document.body.appendChild(verticalRuler2);
    document.body.appendChild(verticalRulerText2);

    document.body.classList.add("chrome-extension-inspect-invision-cursor");

    prevDocumentOnClick = document.body.onclick;
    document.body.onclick = handleClick;
  }

  document.removeEventListener("mouseover", handleHover);
  document.addEventListener("mouseover", handleHover);
}

function destroy() {
  document.removeEventListener("mouseover", handleHover);
  document.body.classList.remove("chrome-extension-inspect-invision-cursor");
  document.body.onclick = prevDocumentOnClick;
  lastElement.classList.remove(HOVER_CLASS);
  remove([
    horizontalRuler,
    horizontalRuler2,
    horizontalRulerText,
    horizontalRulerText2,
    verticalRuler,
    verticalRuler2,
    verticalRulerText,
    verticalRulerText2
  ]);
  
  if (anchor) {
    anchor.classList.remove("chrome-extension-inspect-invision-active");
    anchor = null;
  }
}

chrome.runtime.onMessage.addListener(function(request) {
  if (request.type === "stop") {
    destroy();
  } else if (request.type === "start") {
    init();
  }
});

init();
