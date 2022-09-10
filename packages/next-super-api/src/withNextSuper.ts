import { NextConfig } from 'next'
import { Configuration } from 'webpack'
import { PACKAGE_LOADER_PAGE } from './consts'
import { ClientLoaderOptions } from './loader-page'

export const withNextSuper = (given: NextConfig = {}): NextConfig => {
  const testRegex = new RegExp('.(js|jsx|ts|tsx)$')

  return {
    ...given,
    webpack(config: Configuration, context) {
      const clientLoaderOptions: ClientLoaderOptions = {
        projectDir: context.dir,
        pageExtensionsRegex: testRegex,
        basePath: context.config.basePath
      }

      config.module?.rules?.unshift({
        test: testRegex,
        issuerLayer: { not: { or: ['api', 'middleware'] } },
        use: [
          {
            loader: PACKAGE_LOADER_PAGE,
            options: clientLoaderOptions
          }
        ]
      })

      return given.webpack ? given.webpack(config, context) : config
    }
  }
}
