import type { LoaderDefinition } from 'webpack'
import { simple } from 'acorn-walk'
import { parse } from 'acorn'
import path from 'path'
import { PACKAGE_CLIENT } from './consts'
import { processRegions, Region } from './utils'
import { SourceMapSource } from 'webpack-sources'

export type ClientLoaderOptions = {
  projectDir: string
  pageExtensionsRegex: RegExp
  basePath: string
}

const clientImport = `import { createApiClient } from '${PACKAGE_CLIENT}';`

const loader: LoaderDefinition<ClientLoaderOptions> = function (
  content,
  sourcemaps,
  _additionalData
) {
  const isServer = this._compiler!.name === 'server'

  const importAdditions = new Set<string>()
  const clientOnlyRegions: Region[] = []
  const regions: Region[] = []

  const { projectDir, pageExtensionsRegex, basePath } = this.getOptions()

  const resource = path
    .relative(projectDir, this.resourcePath)
    .replace(/^(src\/)?pages\//, '')
    .replace(pageExtensionsRegex, '')
  const apiRoute = `${basePath}/${resource}`

  const ast = parse(content, { ecmaVersion: 'latest', sourceType: 'module' })

  simple(ast, {
    VariableDeclaration(node: any) {
      // Find the declaration which is calling our func
      const createDeclaration = node?.declarations?.find((declaration: any) => {
        return declaration?.init?.callee?.name === 'createApi'
      })
      if (!createDeclaration) return

      if (isServer) {
        /**
         * In server add the route path as 2nd param to createApi call
         * export const getQuery = createApi(..., "apiRoute")
         */
        regions.push({
          type: 'insert',
          at: createDeclaration.end - 1,
          content: `, "${apiRoute}"`
        })
      } else {
        // Add the client package import to source
        importAdditions.add(clientImport)
        // Replace the createApi call with createApiClient in the client code
        regions.push({
          type: 'replace',
          region: [createDeclaration.init.start, createDeclaration.init.end],
          content: `createApiClient("${apiRoute}");`
        })
      }
    },
    ImportDeclaration(node: any) {
      if (isServer) return
      // Remove all imports other than 'next-super-api/client'
      if (
        node.type === 'ImportDeclaration' &&
        node.source.value !== 'next-super-api/client'
      ) {
        clientOnlyRegions.push({
          type: 'replace',
          region: [node.start, node.end]
        })
      }
    }
  })

  // Not a file we need to worry about
  if (regions.length === 0) {
    return content
  }

  // apply the regions on the source code
  const replacedSource = processRegions(
    new SourceMapSource(
      content,
      this.resourcePath,
      typeof sourcemaps === 'string' ? JSON.parse(sourcemaps) : sourcemaps
    ),
    !isServer ? [...regions, ...clientOnlyRegions] : regions
  )

  // add any imports needed
  const finalSource = `
  ${[...importAdditions].join('\n')}
  ${replacedSource.source()}
  `.trim()

  return finalSource
}

export default loader
