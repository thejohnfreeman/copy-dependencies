# copy-dependencies

As of 2019-03-10, [Eleventy](https://www.11ty.io/) does not seem to let me
include files from `node_modules` while I'm using a custom input directory
(which I do to scope my templates away from metadata files like `README.md`).
I wrote this tool to let me automate the process of copying files from my
dependencies to arbitrarily-nested paths in my project, creating any missing
parent directories on the way (which `cp` and `rsync` alone do not do), all
with a simple configuration that fits into `package.json`.

## Install

```
yarn add -D @thejohnfreeman/copy-dependencies
```

## Use

```js
// package.json
{
  ...
  "scripts": {
    "install": "copy-dependencies"
  },
  "copyDependencies": {
    "node_modules/prismjs/themes/prism-tomorrow.css": "src/css/theme.css"
  },
  ...
}
```
