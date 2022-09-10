import { ReplaceSource, type Source } from 'webpack-sources'

export type Region =
  | { type: 'replace'; region: [start: number, end: number]; content?: string }
  | { type: 'insert'; at: number; content: string }

export function processRegions(
  input: Source,
  regionsToRemove: Region[]
): ReplaceSource {
  const source = new ReplaceSource(input)
  for (const region of regionsToRemove) {
    switch (region.type) {
      case 'insert':
        source.insert(region.at, region.content)
        break
      case 'replace':
        source.replace(region.region[0], region.region[1], region.content || '')
        break
    }
  }
  return source
}
