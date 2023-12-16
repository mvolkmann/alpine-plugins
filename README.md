# alpine-plugins

This is a collection of custom plugins for Alpine.js.

## x-include

This plugin adds the `x-include` directive that enables
including an Alpine "component" in an HTML file that uses Alpine.
Each component is defined in a separate HTML file.
They can be included any number of times as follows:

```html
<div x-include="component-name" x-data="{properties-to-pass}"></div>
```

There must be a file similar to the one below named `component-name.html`.
This inserts the HTML of the component and
makes the `x-data` properties available to it.

Here is an example of defining such a component
in the file `progress-bar.html`:

![x-include demo](/alpine-x-include.png)

```html
<!--
This component renders a progress bar.
Instances can specify the following x-data properties:

- min - minimum value; optional number; default 0
- max - maximum value; optional number; default 100
- value - value to display; required number
- bgColor - background color of bar; optional string; default gray
- color - foreground color of bar; optional string; default green
- low - optional number; no default
- lowColor - bar color if value <= low; optional string; no default
- high - optional number; no default
- highColor - bar color if value >= high; optional string; no default
-->

<!-- Using nested selector provides CSS scoping.
     Use the name of the component as the outer CSS class. -->
<style>
  .progress-bar {
    height: 2rem;
    position: relative;
    width: 20rem;

    & .bar {
      height: 100%;
    }

    & .value {
      color: white;
      font-family: sans-serif;
      /* centers text in .progress-bg */
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
</style>

<script>
  // Placing all the functions in one global object reduces name conflicts.
  const ProgressBar = {
    getBarStyle(data) {
      const { color, low, lowColor, high, highColor, value } = data;
      const barColor =
        typeof low !== "undefined" && lowColor && value <= low
          ? lowColor
          : typeof high !== "undefined" && highColor && value >= high
          ? highColor
          : typeof color === "undefined"
          ? "green"
          : color;
      return `background-color: ${barColor}; width: ${this.getPercent(data)}%`;
    },
    getPercent(data) {
      const { min, max, value } = data;
      const minimum = typeof min === "undefined" ? 0 : min;
      const maximum = typeof max === "undefined" ? 100 : max;
      return Math.round(((value - minimum) / (maximum - minimum)) * 100);
    },
    validate(data) {
      // Check for required properties.
      if (typeof data.value === "undefined") {
        throw new Error("progress-bar requires value");
      }
    },
  };
</script>

<!-- x-data inside a component like this is for component methods.
     The "props" are supplied by x-data on instances. -->
<div
  class="progress-bar"
  :style="`background-color: ${typeof bgColor === 'undefined' ? 'gray' : bgColor}`"
  x-init="ProgressBar.validate($data)"
  x-data
>
  <div class="bar" :style="ProgressBar.getBarStyle($data)"></div>
  <div class="value" x-text="ProgressBar.getPercent($data)"></div>
</div>
```

Here is an example of using the component defined above:

```html
<html lang="en">
  <head>
    <title>Alpine Component Demo</title>
    <style>
      .temperature {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-top: 1rem;
      }
    </style>
    <script
      defer
      src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"
    ></script>
    <script src="x-include.js"></script>
  </head>
  <body x-data="{show: true, temperature: 50}">
    <!-- "value" is a "getter" so it can use other state.
         x-data on instances like this is only for "props".  -->
    <div
      x-include="progress-bar"
      x-data="{
        get value() { return temperature; },
        low: 40,
        lowColor: 'blue',
        high: 80,
        highColor: 'red'
      }"
    ></div>

    <label class="temperature">
      Temperature
      <input type="range" min="0" max="100" x-model="temperature" />
      <span x-text="temperature"></span>
    </label>

    <div
      x-include="progress-bar"
      x-data="{
        min: 20,
        max: 80,
        value: 30,
        bgColor: 'coral',
        color: 'cornflowerblue',
      }"
    ></div>
  </body>
</html>
```

## x-interp

This plugin simplifies inserting the values of JavaScript expressions into text content.

Without this plugin, you might write the following:

```html
<span x-text="some-expression"></span>
```

With this plugin, you can write the following instead:

```html
{some-expression}
```

In order for this to work:

1. Add the following `script` tag before the one for `alpinejs`:

   ```html
   <script
     defer
     src="https://cdn.jsdelivr.net/gh/mvolkmann/alpine-plugins@main/interpolate.js"
   ></script>
   ```

1. Add the `x-interp` directive to any element
   whose contents should be searched for interpolations.

1. Optionally choose different delimiters.
   Any characters can be used as long as
   an even number of them are specified.
   For example, to use `{{some-expression}}`,
   add the following `script` tag:

   ```html
   <script defer>
     document.addEventListener("alpine:init", () => {
       Alpine.$interpolate.delimiters = "{{}}";
     });
   </script>
   ```

Note that `x-for` loop variables are not accessible inside interpolations.
For example, the following will not work:

```html
<div x-interp>
  <template x-for="dog in dogs">
    <div>{dog.name} is a {dog.breed}.</div>
  </template>
</div>
```

A workaround is to continue using `x-text` as follows:

```html
<template x-for="dog in dogs">
  <div x-text="`${dog.name} is a ${dog.breed}.`"></div>
</template>
```
