/**
 * @fileoverview Wrong import layer
 * @author Tony Nie
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/wrong-import-layer"),
  RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  }
});
ruleTester.run("wrong-import-layer", rule, {
  valid: [
    {
      code: 'import A from "lib/foo"',
      options: [
        {
          layerConfigs: [
            { layer: 1, path: 'lib/**' },
            { layer: 2, path: 'components/**' },
            { layer: 3, path: 'pages/**' },
          ]
        },
        { physicalFilename: '/c/code/src/components/foo.js' }
      ],
    },
    {
      code: 'import A from "@/lib/foo"',
      options: [
        {
          layerConfigs: [
            { layer: 1, path: 'lib/**' },
            { layer: 2, path: 'components/**' },
            { layer: 3, path: 'pages/**' },
          ]
        },
        { physicalFilename: '/c/code/src/components/foo.js' }
      ],
    },
    {
      code: 'import A from "#/axios/foo"',
      options: [
        {
          layerConfigs: [
            { layer: 1, path: 'lib/**' },
            { layer: 2, path: 'components/**' },
            { layer: 3, path: 'pages/**' },
          ]
        },
        { physicalFilename: 'C:\\code\\src\\components\\foo.js' }
      ],
    },
  ],
  invalid: [
    {
      code: 'import A from "pages/foo"',
      options: [
        {
          layerConfigs: [
            { layer: 1, path: 'lib/**' },
            { layer: 2, path: 'components/**' },
            { layer: 3, path: 'pages/**' },
          ]
        },
        {
          physicalFilename: '/c/code/src/components/foo.js'
        },
      ],
      errors: [{
        message: 'Cannot import modules at "pages/**" (layer 3) from a file at "components/**" (layer 2).',
      }],
    },
    {
      code: 'import A from "@/pages/foo"',
      options: [
        {
          layerConfigs: [
            { layer: 1, path: 'lib/**' },
            { layer: 2, path: 'components/**' },
            { layer: 3, path: 'pages/**' },
          ]
        },
        { physicalFilename: 'C:\\code\\src\\components\\foo.js' }
      ],
      errors: [{
        message: 'Cannot import modules at "pages/**" (layer 3) from a file at "components/**" (layer 2).',
      }],
    },
  ],
});
