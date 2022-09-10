import type { LoaderDefinition } from 'webpack'
import { simple } from 'acorn-walk'
import { parse } from 'acorn'
import path from 'path'

export type ClientLoaderOptions = {
  projectDir: string
  pageExtensionsRegex: RegExp
  basePath: string
}

const loader: LoaderDefinition<ClientLoaderOptions> = function (
  content,
  _sourcemaps,
  _additionalData
) {
  let varName = ''
  let queries: string[] = []
  let mutations: string[] = []
  let regionToRemove = { start: 0, end: 0 }
  let argPos = { start: 0, end: 0 }
  let imports: string[] = []

  const isServer = this._compiler?.name === 'server'

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

      regionToRemove = { start: node.start, end: node.end }
      argPos = createDeclaration.init.arguments[0]

      // get the export name from the declaration
      varName = createDeclaration.id.name

      // get the keys of queries and mutations
      createDeclaration.init.arguments[0].properties.forEach(
        (property: any) => {
          if (property.key.name === 'queries') {
            queries = property.value.properties.map(
              (property: any) => property.key.name
            )
          }
          if (property.key.name === 'mutations') {
            mutations = property.value.properties.map(
              (property: any) => property.key.name
            )
          }
        }
      )
    },
    ImportDeclaration(node: any) {
      if (
        node.type === 'ImportDeclaration' &&
        node.source.value !== 'next-ts-api'
      ) {
        imports.push(content.slice(node.start, node.end))
      }
    }
  })

  const capitalize = (text: string) =>
    text.slice(0, 1).toUpperCase() + text.slice(1)

  const getQueryName = (key: string) => `use${capitalize(key)}Query`
  const getMutationName = (key: string) => `use${capitalize(key)}Mutation`

  const output = `
  import { createUseQuery, createUseMutation ${
    isServer ? ', createServerFuncs' : ''
  } } from 'next-ts-api/client';

  ${isServer ? imports.join('\n') : ''}

  const API_ROUTE = "${apiRoute}";

  const ${varName} = {
    client: {
      ${queries
        .map(
          (key) => `${getQueryName(key)}: createUseQuery(API_ROUTE, "${key}")`
        )
        .join(',\n')},
      ${mutations
        .map(
          (key) =>
            `${getMutationName(key)}: createUseMutation(API_ROUTE, "${key}")`
        )
        .join(',\n')},
    },
    server: ${
      isServer
        ? `createServerFuncs(${content.slice(argPos.start, argPos.end)})`
        : '{}'
    }
  };

  ${content.slice(regionToRemove.end)}
  `

  return output
}

export default loader
