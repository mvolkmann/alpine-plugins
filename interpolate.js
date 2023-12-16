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

function updateText(re, el, evaluate) {
  for (const child of el.childNodes) {
    const { nodeType } = child;
    if (nodeType === Node.TEXT_NODE) {
      if (!child.originalValue) child.originalValue = child.nodeValue;
      child.nodeValue = child.originalValue.replaceAll(
        re,
        // evaluate doesn't throw an error if the expression is invalid.
        // It outputs an error message and returns undefined.
        (_, capture) => evaluate(capture) || capture
      );
    } else if (nodeType === Node.ELEMENT_NODE) {
      updateText(re, child, evaluate); // recursive call
    }
  }
}

document.addEventListener("alpine:init", () => {
  Alpine.directive("interpolate", (el, {}, { effect, evaluate }) => {
    const re = getRegExp(Alpine.$interpolate.delimiters);
    effect(() => updateText(re, el, evaluate));
  });
  Alpine.$interpolate = { delimiters: "{}" };
});
