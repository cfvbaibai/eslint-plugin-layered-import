/**
 * @fileoverview Wrong import layer
 * @author Tony Nie
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem', // `problem`, `suggestion`, or `layout`
    docs: {
      description: "Wrong import layer",
      recommended: true,
      url: null, // URL to the documentation page for this rule
    },
    fixable: null, // Or `code` or `whitespace`
    schema: [{
      type: 'object',
      properties: {
        defaultLayer: {
          type: 'number',
        },
        layerConfigs: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              layer: {
                type: 'number',
              },
              path: {
                type: 'string',
              },
            },
            required: ['layer', 'path'],
          },
        },
      },
      additionalProperties: false,
    }, {
      type: 'object',
      properties: {
        physicalFilename: {
          type: 'string'
        },
      },
    }],
    messages: {
      wrongImportLayer: 'Cannot import modules at {{importPath}} (layer {{importFileLayer}}) from a file at {{currentPath}} (layer {{currentFileLayer}}).',
    },
  },

  create(context) {
    console.log('options', JSON.stringify(context.options))

    // variables should be defined here
    const layerOption = context.options[0] || {}
    const testOption = context.options[1] || {}

    // The smaller the layer, the more basic it is
    // Usually, layer of `src/lib` is smaller than `src/lib/components`
    const defaultLayer = layerOption.defaultLayer || 0

    // { layer: 1, path: 'src/**/lib' }[]
    const layerConfigs = (layerOption.layerConfigs || []).map(layerConfig => ({
      ...layerConfig,
      pattern: new RegExp(layerConfig.path.replace('**', '[^/]*'))
    }))

    console.log(layerConfigs)
    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------
    function getLayerByPath(targetPath) {
      for (const { layer, path, pattern } of layerConfigs) {
        const match = pattern.test(targetPath)
        if (match) {
          return { layer, path }
        }
      }
      return { layer: defaultLayer, path: '**' }
    }

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      // visitor functions for different types of nodes
      ImportDeclaration(node) {
        const source = node.source.value
        const physicalFilename = testOption.physicalFilename || context.physicalFilename
        const { layer: currentFileLayer, path: currentPath } = getLayerByPath(physicalFilename)
        const { layer: importFileLayer, path: importPath } = getLayerByPath(source)

        if (currentFileLayer < importFileLayer) {
          context.report({
            node,
            messageId: 'wrongImportLayer',
            data: {
              importPath,
              importFileLayer,
              currentPath,
              currentFileLayer,
            }
          })
        }
      }
    };
  },
};
