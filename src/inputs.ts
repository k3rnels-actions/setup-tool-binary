import * as core from '@actions/core'
import {applyTemplate, applyTemplates, getPlatformString} from './utils'

export class Input {
  toolName: string
  toolRepository: string
  toolVersion: string
  downloadUrl: string
  smokeTest: string

  constructor() {
    const urlTemplate: string = core.getInput('urlTemplate', {required: true})
    const smokeTestTemplate: string = core.getInput('smokeTestTemplate')

    this.toolName = core.getInput('toolName', {required: true})
    this.toolVersion = core.getInput('toolVersion', {required: true})
    this.toolRepository = core.getInput('toolRepository')

    if (urlTemplate.includes('{{toolRepository}}') && !this.toolRepository) {
      throw Error('Missing conditionally required "toolRepository" parameter')
    }

    this.downloadUrl = applyTemplates(
      urlTemplate,
      new Map([
        ['toolRepository', this.toolRepository],
        ['toolName', this.toolName],
        ['toolVersion', this.toolVersion],
        ['platform', getPlatformString()]
      ])
    )
    this.smokeTest = applyTemplate(smokeTestTemplate, 'toolName', this.toolName)
  }
}
