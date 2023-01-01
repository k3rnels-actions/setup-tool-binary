import {expect, describe, it} from '@jest/globals'
import {applyTemplate, applyTemplates} from '../src/utils'

describe('simple templates', () => {
  it.each([
    ['token', 'this-simple-template'],
    ['noToken', 'this-{{token}}-template']
  ])("when the templateLiteral is '%s'", (templateLiteral, expected) => {
    const template = 'this-{{token}}-template'
    expect(applyTemplate(template, templateLiteral, 'simple'))
      .toMatch(expected)
  })
})

describe('advanced templates', () => {
  it.each([
    ['linux', 'grype_0.54.0_linux_amd64.tar.gz'],
    ['windows', 'grype_0.54.0_windows_amd64.tar.gz'],
    ['darwin', 'grype_0.54.0_darwin_amd64.tar.gz']
  ])("when the platform literal is '%s'", (platform, expected) => {
    const template = '{{toolName}}_{{version}}_{{platform}}_amd64.tar.gz'
    const templateLiterals = new Map([
      ['toolName', 'grype'],
      ['version', '0.54.0'],
      ['platform', platform]
    ])
    expect(applyTemplates(template, templateLiterals)).toMatch(expected)
  })

  it('full url test', () => {
    const template = 'https://github.com/{{toolRepository}}/{{toolName}}/releases/download/v{{version}}/{{toolName}}_{{version}}_{{platform}}-64bit.tar.gz'
    const templateLiterals = new Map([
      ['toolRepository', 'aquasecurity'],
      ['toolName', 'trivy'],
      ['version', '0.36.0'],
      ['platform', 'linux']
    ])
    expect(applyTemplates(template, templateLiterals))
      .toMatch('https://github.com/aquasecurity/trivy/releases/download/v0.36.0/trivy_0.36.0_linux-64bit.tar.gz')
  })
})
