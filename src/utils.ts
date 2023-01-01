import process from 'node:process'

export function applyTemplate(templateString: string, templateLiteral: string, replacement: string): string {
  return templateString.replaceAll(`{{${templateLiteral}}}`, replacement)
}

export function applyTemplates(templateString: string, templatingMap: Map<string, string>): string {
  let result: string = templateString

  for (const [key, value] of templatingMap) {
    result = applyTemplate(result, key, value)
  }

  return result
}

export function getPlatformString(): string {
  if (process.platform === 'win32') {
    return 'windows'
  } else {
    return process.platform
  }
}
