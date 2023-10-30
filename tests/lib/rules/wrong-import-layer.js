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
const options = [
  {
    layerConfigs: [
      { layer: 1, pattern: 'lib/**' },
      { layer: 2, pattern: 'components/*' },
      { layer: 2.1, pattern: 'components/ui/**' },
      { layer: 2.2, pattern: 'components/design/**' },
      { layer: 2.3, pattern: 'components/util/**' },
      { layer: 2.9, pattern: 'components/**' },
      { layer: 3, pattern: 'pages/**' },
    ]
  },
  { currentFilePath: 'components/design/foo.js' }
]

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  }
});
ruleTester.run("wrong-import-layer", rule, {
  valid: [
    {
      code: 'import A from "../../lib/foo"',
      options,
    },
    {
      code: 'import A from "@/lib/foo"',
      options,
    },
    {
      code: 'import A from "#/axios/foo"',
      options,
    },
    {
      code: 'import A from "./RuleSetting.vue"',
      options,
    },
    {
      code: 'import A from "../ui/Modal.ts"',
    },
  ],
  invalid: [
    {
      code: 'import A from "../../pages/foo"',
      options,
      errors: [{
        message: 'Cannot import modules at "pages/**" (layer 3) from a file at "components/design/**" (layer 2.2).',
      }],
    },
    {
      code: 'import A from "@/pages/foo"',
      options,
      errors: [{
        message: 'Cannot import modules at "pages/**" (layer 3) from a file at "components/design/**" (layer 2.2).',
      }],
    },
    {
      code: 'import A from "@/components/util/utils.ts"',
      options,
      errors: [{
        message: 'Cannot import modules at "components/util/**" (layer 2.3) from a file at "components/design/**" (layer 2.2).',
      }],
    },
    {
      code: 'import A from "@/components/foo/bar.ts"',
      options,
      errors: [{
        message: 'Cannot import modules at "components/**" (layer 2.9) from a file at "components/design/**" (layer 2.2).',
      }],
    },
  ],
});
