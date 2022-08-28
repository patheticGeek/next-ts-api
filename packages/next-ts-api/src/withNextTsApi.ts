import { NextConfig } from "next";
import { Configuration } from "webpack";
import { ClientLoaderOptions } from "./loader-client";

export const withNextTsAPI = (given: NextConfig = {}): NextConfig => {
  const capturedExtensions = ['rq']

  const pageExtensions = (
    given.pageExtensions ?? ["js", "jsx", "ts", "tsx"]
  ).flatMap((value) => {
    return [
      value,
      ...capturedExtensions.map((extension) => {
        return `${extension}.${value}`;
      }),
    ];
  });

  const escapedCapturedExtensions = capturedExtensions
    .map((extension) => extension.replace(/\./g, "\\."))
    .join("|");
  const escapedPageExtensions = pageExtensions
    .map((x) => x.replace(/\\./g, "\\."))
    .join("|");

  const testRegex = new RegExp(
    `\\.(${escapedCapturedExtensions})\\.(${escapedPageExtensions})$`
  );

  return {
    ...given,
    webpack(config: Configuration, context) {
      config.module?.rules?.unshift({
        test: testRegex,
        issuerLayer: ["api"],
        use: [
          {
            loader: 'next-ts-api/loader-api',
          },
          context.defaultLoaders.babel,
        ],
      });

      const clientLoaderOptions: ClientLoaderOptions = {
        projectDir: context.dir,
        pageExtensionsRegex: testRegex,
        basePath: context.config.basePath,
      };

      config.module?.rules?.unshift({
        test: testRegex,
        issuerLayer: { not: { or: ["api", "middleware"] } },
        use: [
          {
            loader: 'next-ts-api/loader-client',
            options: clientLoaderOptions,
          },
          context.defaultLoaders.babel,
        ],
      });

      return given.webpack ? given.webpack(config, context) : config;
    },
    pageExtensions,
  };
}
