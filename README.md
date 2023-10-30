# eslint-plugin-layered-import

Enforced layered architecture by checking import statements

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
        "layered-import/rule-name": 2
    }
}
```

## Rules

<!-- begin auto-generated rules list -->

| Name                                                   | Description        |
| :----------------------------------------------------- | :----------------- |
| [wrong-import-layer](docs/rules/wrong-import-layer.md) | Wrong import layer |

<!-- end auto-generated rules list -->


