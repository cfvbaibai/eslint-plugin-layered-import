# Wrong import layer (`layered-import/wrong-import-layer`)

<!-- end auto-generated rule header -->

## Rule Details

This rule aims to prevent develops from importing high-level modules from low-level modules.

Usually, we would divide the source codes of a project into several layers. Typically, the `components` and the `pages`.

As a good practice, code under `pages` folder, which contains the high-level modules, could depend on those under `components` folder, which we consider low-level modules, but not the vice versa.

This eslint plugin provides an easy way for develops to enforce the layered architecture in a single repo.

Sample usage:

```json

    "layered-import/wrong-import-layer": [
      "warn",
      {
        "layerConfigs": [
          { "layer": 1, "pattern": "lib/**" },
          { "layer": 2, "pattern": "api/**" },
          { "layer": 3, "pattern": "components/**" },
          { "layer": 4, "pattern": "templates/**" },
          { "layer": 5, "pattern": "views/**" },
        ],
      },
    ],

```

### Options

| Name                           | Description                                                                                         | Type   | Required |
| :----------------------------- | :-------------------------------------------------------------------------------------------------- | :----- | :------- |
| `currentFilePath`              | Override the path of the current file. Only used in tests.                                          | String |          |
| `defaultLayer`                 | The default layer for imports that are not matched by any layerConfig.                              | Number |          |
| `layerConfigs`                 | Define the matching behavior of each layer. It constains two properties: layer & pattern. See below | Array  |          |
| `layerConfigs.layer`           | The layer number. The smaller the layer, the more basic it is.                                      | Number | Yes      |
| `layerConfigs.pattern`         | The glob pattern for the layer.                                                                     | String | Yes      |

## When Not To Use It

When your project is very small and it is even not worthy separating codes into layers
