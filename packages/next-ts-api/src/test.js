const {parse} = require('acorn')
const {simple} = require('acorn-walk')

const content = `
import { create } from "next-ts-api";

export const [userHooks, userQueries, userMutation] = create({
  getContext: () => ({ hello: 'hello' }),
  queries: {
    get: () => {},
    search: () => {}
  },
  mutations: {
    create: () => {},
    login: () => {}
  }
})
`

let hooksName = ''
let queriesName = ''
let mutationName = ''
let queries = []
let mutations = []
let argPos = { start: 0, end: 0 }
let imports = []
let route = '/api/todo' // TODO

const createFnName = 'create'

const ast = parse(content, { ecmaVersion: "latest", sourceType: "module" });

simple(ast, {
  ExportNamedDeclaration(node) {
    // Find the declaration which is calling our func
    const createDeclaration = node.declaration.declarations.find(declaration => {
      return declaration.init.callee.name === createFnName
    })
    if(!createDeclaration) return;

    // get the export names from the declaration array `[hooks, queries, mutations]`
    [hooksName, queriesName, mutationName] = createDeclaration.id.elements.map(val => val.name)

    // get the keys of queries and mutations
    createDeclaration.init.arguments[0].properties.forEach((property) => {
      if(property.key.name === 'queries') {
        queries = property.value.properties.map(property => property.key.name)
      }
      if(property.key.name === 'mutations') {
        mutations = property.value.properties.map(property => property.key.name)
      }
    })

    // get the argument obj so we can pass it to create api handler
    argPos = createDeclaration.init.arguments[0]
  },
  ImportDeclaration(node) {
    if(node.type === 'ImportDeclaration' && node.source.value !== 'next-ts-api') {
      imports.push(content.slice(node.start, node.end))
    }
  }
})

console.log('names', [hooksName, queriesName, mutationName])
console.log('queries', queries)
console.log('mutations', mutations)

const clientCode = `
import { createHooks } from 'next-ts-api/client';
export const ${hooksName} = createHooks(${route}, [${queries.map(name => `"${name}"`).join(',')}], [${mutations.map(name => `"${name}"`).join(',')}]);
`

console.log(clientCode)

const serverCode = `
import { createApiHandler } from 'next-ts-api/server';
${imports.join('\n')}
export default createApiHandler(${content.slice(argPos.start, argPos.end)});
`

console.log(serverCode)
