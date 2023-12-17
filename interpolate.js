// This Alpine plugin adds the x-interpolate directive that enables
// interpolation of JavaScript expressions in text content.
// See the README file for details.

// These characters must be escaped with a backslash in regular expressions.
const escapes = "^.?*+[]()\\$";

function getRegExp(delimiters) {
  let escaped = "";
  for (const char of delimiters) {
    if (escapes.includes(char)) escaped += "\\";
    escaped += char;
  }
  let len = escaped.length;
  if (len % 2 !== 0) {
    throw new Error(`x-interpolate invalid delimiters: ${delimiters}`);
  }
  len /= 2;
  const start = escaped.slice(0, len);
  const end = escaped.slice(len);
  // The ? in the regular expression makes it lazy (non-greedy).
  return new RegExp(`${start}(.+?)${end}`, "g");
}

function updateText(re, el) {
  for (const child of el.childNodes) {
    const { nodeType } = child;
    if (nodeType === Node.TEXT_NODE) {
      const text = child.nodeValue;
      let lastIndex = 0;
      const newElements = [];
      for (const match of text.matchAll(re)) {
        const { 0: captureWithDelimiters, 1: capture, index } = match;
        if (index > lastIndex) {
          const subtext = text.slice(lastIndex, index);
          newElements.push(subtext);
        }
        const span = document.createElement("span");
        span.setAttribute("x-text", capture);
        newElements.push(span);
        lastIndex = index + captureWithDelimiters.length;
      }
      if (lastIndex < text.length - 1) {
        const subtext = text.slice(lastIndex);
        newElements.push(subtext);
      }

      child.replaceWith(...newElements);
    } else if (nodeType === Node.ELEMENT_NODE) {
      if (child.nodeName === "TEMPLATE") {
        for (const templateChild of child.content.childNodes) {
          updateText(re, templateChild); // recursive call
        }
      } else {
        updateText(re, child); // recursive call
      }
    }
  }
}

document.addEventListener("alpine:init", () => {
  if (typeof alpineInterpolateDelimiters === "undefined") {
    alpineInterpolateDelimiters = "{}";
  }
  Alpine.directive("interpolate", (el, {}, {}) => {
    const re = getRegExp(alpineInterpolateDelimiters);
    updateText(re, el);
  });
});
