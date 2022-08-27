import type { LoaderDefinition } from "webpack";
import { simple } from 'acorn-walk';
import { parse } from 'acorn'
import path from "path";

export type ClientLoaderOptions = {
  projectDir: string;
  pageExtensionsRegex: RegExp;
  basePath: string;
};

const loader: LoaderDefinition<ClientLoaderOptions> = function (
  content,
  _sourcemaps,
  _additionalData
) {
  let hooksName = ''
  let queries: string[] = []
  let mutations: string[]  = []

  const { projectDir, pageExtensionsRegex, basePath } =
    this.getOptions();

  const resource = path
    .relative(projectDir, this.resourcePath)
    .replace(/^(src\/)?pages\//, "")
    .replace(pageExtensionsRegex, "");
  const apiPage = `${basePath}/${resource}`;

  const ast = parse(content, { ecmaVersion: "latest", sourceType: "module" });

  simple(ast, {
    ExportNamedDeclaration(node: any) {
      // Find the declaration which is calling our func
      const createDeclaration = node?.declaration?.declarations?.find((declaration: any) => {
        return declaration?.init?.callee?.name.includes('createApi')
      })
      if(!createDeclaration) return;

      // get the export name from the declaration
      hooksName = createDeclaration.id.name
  
      // get the keys of queries and mutations
      createDeclaration.init.arguments[0].properties.forEach((property: any) => {
        if(property.key.name === 'queries') {
          queries = property.value.properties.map((property: any) => property.key.name)
        }
        if(property.key.name === 'mutations') {
          mutations = property.value.properties.map((property: any) => property.key.name)
        }
      })
    }
  })

  const output = `
  import { createHooks } from 'next-ts-api/client';
  export const ${hooksName} = createHooks("${apiPage}", [${queries.map(name => `"${name}"`).join(',')}], [${mutations.map(name => `"${name}"`).join(',')}]);
  `

  return output;
};

export default loader;
