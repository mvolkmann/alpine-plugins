// This Alpine plugin adds the x-include directive that enables
// including an Alpine "component" in an HTML file that uses Alpine.
// See the README file for details.

const { href } = location;
const lastSlashIndex = href.lastIndexOf("/");
const urlPrefix = href.substring(0, lastSlashIndex + 1);

const scriptStart = "<script>";
const scriptEnd = "</script>";

const _alpineIncludeCache = {};

function includeHTML() {
  const attribute = "x-include";
  // Find the first element that contains the include attribute.
  const element = document.querySelector(`[${attribute}]`);
  if (!element) return; // no more found

  const componentName = element.getAttribute(attribute);
  let content = _alpineIncludeCache[componentName] || "";
  if (content) {
    element.innerHTML = content;
    element.removeAttribute(attribute);

    // Make a recursive call to process remaining elements.
    includeHTML();
  } else {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      // HTML5 does not dynamically add script tags using the innerHTML property!
      let text = xhr.responseText;

      let index = 0;
      while (true) {
        // Look for a script tag.
        const startIndex = text.indexOf(scriptStart, index);

        // TODO: Check for src attribute on script tag.

        if (startIndex === -1) {
          content += text.substring(index);
          break;
        } else {
          const endIndex = text.indexOf(scriptEnd, startIndex);
          if (endIndex !== -1) {
            // Get the text before and in the script element.
            const prefix = text.substring(0, startIndex);
            const script = text.substring(
              startIndex + scriptStart.length,
              endIndex
            );

            // Create a script element and add it before the element.
            const scriptElement = document.createElement("script");
            scriptElement.appendChild(document.createTextNode(script));
            element.parentElement.insertBefore(scriptElement, element);

            content += prefix;

            index = endIndex + scriptEnd.length;
          } else {
            throw new Error("found script start tag, but not end tag");
          }
        }
      }

      _alpineIncludeCache[componentName] = content;

      // Replace the element text with all the non-script text.
      element.innerHTML = content;

      element.removeAttribute(attribute);

      // Make a recursive call to process remaining elements.
      includeHTML();
    };

    xhr.open("GET", `${urlPrefix}${componentName}.html`, true);
    xhr.send();
  }
}

window.onload = includeHTML;
