/**
 * @fileoverview Wrong import layer
 * @author Tony Nie
 */
"use strict";

const path = require('path')
const fs = require('fs');

const MAX_LAYER = 9999999999
const SRC = 'src'
const DEBUG = false

function findProjectRoot(currentDirectory) {
  const potentialPackageJson = path.join(currentDirectory, 'package.json');

  if (fs.existsSync(potentialPackageJson)) {
    return currentDirectory;
  } else {
    const parentDirectory = path.dirname(currentDirectory);
    if (parentDirectory === currentDirectory) {
      // We've reached the file system root, and we haven't found a package.json
      return null
    } else {
      // Recursively check the parent directory
      return findProjectRoot(parentDirectory);
    }
  }
}

function getLinuxPath(windowsPath) {
  let linuxPath = ''
  if (windowsPath[1] === ':') {
    linuxPath += '/' + windowsPath[0].toLowerCase()
    linuxPath += windowsPath.substring(2)
    return linuxPath.replaceAll('\\', '/')
  } else {
    return windowsPath.replaceAll('\\', '/')
  }
}

function getLinuxRelativePath(base, full) {
  return getLinuxPath(path.relative(base, full))
}

function log(...args) {
  if (DEBUG) {
    console.log(...args)
  }
}
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
          description: 'The default layer for imports that are not matched by any layerConfig.',
        },
        layerConfigs: {
          type: 'array',
          description: 'Define the matching behavior of each layer. It constains two properties: layer & pattern.',
          items: {
            type: 'object',
            properties: {
              layer: {
                type: 'number',
                description: 'The layer number. The smaller the layer, the more basic it is.',
              },
              pattern: {
                type: 'string',
                description: 'The glob pattern for the layer.',
              },
            },
            required: ['layer', 'pattern'],
          },
        },
      },
      additionalProperties: false,
    }, {
      type: 'object',
      properties: {
        currentFilePath: {
          type: 'string',
          description: 'Override the path of the current file. Only used in tests.'
        },
      },
    }],
    messages: {
      wrongImportLayer: 'Cannot import modules at "{{importSourcePattern}}" (layer {{importSourceLayer}}) from a file at "{{currentFilePattern}}" (layer {{currentFileLayer}}).',
    }
  },

  create(context) {
    // variables should be defined here
    const layerOption = context.options[0] || {}
    const testOption = context.options[1] || {}
    const currentFilePath = testOption.currentFilePath
      ? path.join(context.cwd, SRC, testOption.currentFilePath)
      : context.getPhysicalFilename()
    const currentFileLinuxPath = getLinuxPath(currentFilePath)
    log('currentFileLinuxPath', currentFileLinuxPath)

    const projectRoot = findProjectRoot(currentFilePath) || context.cwd
    const projectSrcRootLinux = getLinuxPath(path.join(projectRoot, SRC))
    log('projectSrcRootLinux', projectSrcRootLinux)

    // The smaller the layer, the more basic it is
    // Usually, layer of `src/lib` is smaller than `src/lib/components`
    const defaultLayer = layerOption.defaultLayer || 0

    // { layer: 1, path: 'src/**/lib' }[]
    const layerConfigs = (layerOption.layerConfigs || []).map(layerConfig => ({
      ...layerConfig,
      regex: new RegExp('^' + layerConfig.pattern.replaceAll('**', '.+').replaceAll('*', '[^/]+') + '$')
    }))

    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------
    function getLayerForCurrentFile(filePath, defaultLayer) {
      const currentFileSrcPath = getLinuxRelativePath(projectSrcRootLinux, filePath)
      log('currentFileSrcPath', currentFileSrcPath)
      for (const { layer, pattern, regex } of layerConfigs) {
        const match = regex.test(currentFileSrcPath)
        if (match) {
          return { layer, pattern }
        }
      }
      return { layer: defaultLayer, pattern: '**' }
    }

    function getLayerForImportSource(importSourcePath, defaultLayer) {
      const isSharpImport = importSourcePath.startsWith('#/')
      const isRelativeImport = importSourcePath.startsWith('.')
      const isProjectSrcImport = importSourcePath.startsWith('@/')
      if (isSharpImport) {
        return { layer: defaultLayer, pattern: importSourcePath }
      }
      if (!isRelativeImport && !isProjectSrcImport) {
        return { layer: defaultLayer, pattern: importSourcePath }
      }
      const importSourceSrcPath = (() => {
        if (isRelativeImport) {
          const concatedImportSourcePath = getLinuxPath(path.join(path.dirname(currentFileLinuxPath), importSourcePath))
          log('concatedImportSourcePath', concatedImportSourcePath)
          return getLinuxRelativePath(projectSrcRootLinux, concatedImportSourcePath)
        }
        if (isProjectSrcImport) {
          return importSourcePath.substring(2)
        }
        throw new Error('should not reach here: ' + importSourcePath)
      })()
      log('importSourceSrcPath', importSourceSrcPath)
      for (const { layer, pattern, regex } of layerConfigs) {
        const match = regex.test(importSourceSrcPath)
        if (match) {
          return { layer, pattern }
        }
      }
      return { layer: defaultLayer, pattern: '**' }
    }

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    const { layer: currentFileLayer, pattern: currentFilePattern } = getLayerForCurrentFile(currentFileLinuxPath, MAX_LAYER)
    log('currentFileLayer', currentFileLayer)
    log('currentFilePattern', currentFilePattern)

    return {
      // visitor functions for different types of nodes
      ImportDeclaration(node) {
        const importSource = node.source.value
        const { layer: importSourceLayer, pattern: importSourcePattern } = getLayerForImportSource(importSource, defaultLayer)
        log('importSourceLayer', importSourceLayer)
        log('importSourcePattern', importSourcePattern)

        if (currentFileLayer < importSourceLayer) {
          context.report({
            node,
            messageId: 'wrongImportLayer',
            data: {
              importSourcePattern,
              importSourceLayer,
              currentFilePattern,
              currentFileLayer,
            }
          })
        }
      }
    };
  },
};
