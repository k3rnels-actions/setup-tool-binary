import * as core from '@actions/core'
import {Input} from './inputs'
import {Installer} from './installer'

async function run(): Promise<void> {
  try {
    const inputConfig = new Input()
    const toolInstaller = new Installer()

    core.startGroup('Inputs Config')
    core.info(inputConfig.toString())
    core.endGroup()

    core.startGroup('Install Tool')
    await toolInstaller.install(inputConfig.downloadUrl, inputConfig.toolName, inputConfig.toolVersion)
    core.endGroup()

    core.startGroup('Run Smoke Test')
    if (inputConfig.smokeTest) {
      await toolInstaller.runSmokeTest(inputConfig.smokeTest)
    } else {
      core.info('No smoke test configured.')
    }
    core.endGroup()
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
