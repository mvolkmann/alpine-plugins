# alpine-plugins

This is a collection of custom plugins for Alpine.js.

## x-interp

This plugin simplifies inserting the values of JavaScript expressions into text content.

Without this plugin, one might write the following:

```html
<span x-text="some-expression"></span>
```

With this plugin, you can write the following instead:

```html
{some-expression}
```

In order for this to work:

1. Add the following `script` tag before the one for alpinejs:

   ```html
   <script
     defer
     src="https://cdn.jsdelivr.net/gh/mvolkmann/alpine-plugins@main/interpolate.js"
   ></script>
   ```

1. Add the `x-interp` directive to any element
   whose contents should be processed.

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

A work around is to continue using `x-text` as follows:

```html
<template x-for="dog in dogs">
  <div x-text="`${dog.name} is a ${dog.breed}.`"></div>
</template>
```
