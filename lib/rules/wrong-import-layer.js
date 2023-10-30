/**
 * @fileoverview Wrong import layer
 * @author Tony Nie
 */
"use strict";

const MAX_LAYER = 9999999999

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
        filename: {
          type: 'string'
        },
      },
    }],
    messages: {
      wrongImportLayer: 'Cannot import modules at "{{importPath}}" (layer {{importFileLayer}}) from a file at "{{currentPath}}" (layer {{currentFileLayer}}).',
    },
  },

  create(context) {
    // variables should be defined here
    const layerOption = context.options[0] || {}
    const testOption = context.options[1] || {}
    const rawPhysicalFilename = testOption.physicalFilename || context.getPhysicalFilename()
    const physicalFilename = rawPhysicalFilename.replaceAll('\\', '/')

    // The smaller the layer, the more basic it is
    // Usually, layer of `src/lib` is smaller than `src/lib/components`
    const defaultLayer = layerOption.defaultLayer || 0

    // { layer: 1, path: 'src/**/lib' }[]
    const layerConfigs = (layerOption.layerConfigs || []).map(layerConfig => ({
      ...layerConfig,
      pattern: new RegExp(layerConfig.path.replace('**', '[^/]*'))
    }))

    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------
    function getLayerByPath(targetPath, defaultLayer) {
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
        const { layer: currentFileLayer, path: currentPath } = getLayerByPath(physicalFilename, MAX_LAYER)
        const { layer: importFileLayer, path: importPath } = getLayerByPath(source, defaultLayer)

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
