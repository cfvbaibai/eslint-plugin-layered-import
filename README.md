# eslint-plugin-layered-import

Enforced layered architecture by checking import statements

In a typical project, the source code is organized into various layers, such as components and pages. It's considered good practice for code under the pages folder (high-level modules) to depend on code under the components folder (low-level modules), but not the other way around.

This ESLint plugin offers an easy way to enforce this layered architecture within a single repository.

## Installation

You'll first need to install [ESLint](https://eslint.org/):

```sh
npm i eslint --save-dev
```

Next, install `eslint-plugin-layered-import`:

```sh
npm install eslint-plugin-layered-import --save-dev
```

## Usage

Add `layered-import` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
  "plugins": [
    "layered-import"
  ]
}
```

Then configure the rules you want to use under the rules section.

```json
{
  "rules": {
    "layered-import/wrong-import-layer": [
      "warn",
      {
        "layerConfigs": [
          { "layer": 1, "pattern": "components/**" },
          { "layer": 2, "pattern": "pages/**" },
        ],
      },
    ],
  }
}
```

## Rules

<!-- begin auto-generated rules list -->

| Name                                                   | Description        |
| :----------------------------------------------------- | :----------------- |
| [wrong-import-layer](docs/rules/wrong-import-layer.md) | Wrong import layer |

<!-- end auto-generated rules list -->


