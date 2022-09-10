import type { LoaderDefinition } from 'webpack'
import { simple } from 'acorn-walk'
import { parse } from 'acorn'

const loader: LoaderDefinition = function (
  content,
  _sourcemaps,
  _additionalData
) {
  let argPos = { start: 0, end: 0 }
  let imports: string[] = []

  const ast = parse(content, { ecmaVersion: 'latest', sourceType: 'module' })

  simple(ast, {
    VariableDeclaration(node: any) {
      // Find the declaration which is calling our func
      const createDeclaration = node?.declarations?.find((declaration: any) => {
        return declaration?.init?.callee?.name === 'createApi'
      })
      if (!createDeclaration) return

      // get the argument obj so we can pass it to create api handler
      argPos = createDeclaration.init.arguments[0]
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

  const output = `
  import { createApiHandler } from 'next-ts-api/api';
  ${imports.join('\n')}
  export default createApiHandler(${content.slice(argPos.start, argPos.end)});
  `

  return output
}

export default loader
