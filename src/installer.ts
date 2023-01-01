import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as io from '@actions/io'
import * as tc from '@actions/tool-cache'
import path from 'node:path'
import process from 'node:process'
import {chmod} from 'node:fs/promises'

export class Installer {
  async install(downloadUrl: string, toolName: string, toolVersion: string): Promise<void> {
    core.info(`Checking if '${toolName}@${toolVersion}' is available in tool-cache`)
    const toolCacheHit = this.findCache(toolName, toolVersion)

    if (!toolCacheHit) {
      core.info('Encountered tool-cache miss. Proceeding with download and setup ...')
      const toolPath = await this.setup(downloadUrl, toolName, toolVersion)
      core.debug(`Setup tool in '${toolPath}' and added to $PATH`)
    } else {
      core.info('Encountered tool-cache hit. Tool setup was successful!')
      core.debug(`Setup tool in '${toolCacheHit}' and added to $PATH`)
    }
  }

  async runSmokeTest(smokeCmd: string): Promise<void> {
    await exec.exec(smokeCmd)
  }

  findCache(toolName: string, toolVersion: string): boolean {
    const toolPath = tc.find(toolName, toolVersion)
    if (toolPath) {
      core.addPath(toolPath)
      return true
    }
    return false
  }

  private async setup(downloadUrl: string, toolName: string, toolVersion: string): Promise<string> {
    const installPath = this.determineInstallPath(toolName, toolVersion)
    core.info(`Using '${installPath}' as install target location`)

    if (this.isCompressed(downloadUrl)) {
      return this.setupCompressedTool(installPath, downloadUrl, toolName, toolVersion)
    } else {
      return this.setupSingleFileTool(installPath, downloadUrl, toolName, toolVersion)
    }
  }

  private determineInstallPath(toolName: string, toolVersion: string): string {
    switch (process.platform) {
      case 'win32':
        return path.join(`${process.env['PROGRAMFILES']}`, toolName, toolVersion)
      case 'linux':
      case 'freebsd':
        return `/usr/share/${toolName}/${toolVersion}`;
      case 'darwin':
        return path.join(`${process.env['HOME']}`, `.${toolName}`, toolVersion)
      default:
        throw Error(`The detected platform '${process.platform}' is not supported`)
    }
  }

  private isCompressed(fileName: string): boolean {
    return fileName.endsWith('zip') || fileName.endsWith('7z') || fileName.endsWith('tar.gz')
  }

  private async setupCompressedTool(
    installPath: string,
    downloadUrl: string,
    toolName: string,
    toolVersion: string
  ): Promise<string> {
    const toolDownloadPath = await tc.downloadTool(downloadUrl)

    let toolExtractPath = ''
    if (downloadUrl.endsWith('zip')) {
      toolExtractPath = await tc.extractZip(toolDownloadPath, installPath)
    } else if (downloadUrl.endsWith('7z')) {
      toolExtractPath = await tc.extract7z(toolDownloadPath, installPath)
    } else if (downloadUrl.endsWith('tar.gz')) {
      toolExtractPath = await tc.extractTar(toolDownloadPath, installPath)
    }

    const cachedPath = await tc.cacheDir(toolExtractPath, toolName, toolVersion)
    core.addPath(cachedPath)

    return cachedPath
  }

  private async setupSingleFileTool(
    installPath: string,
    downloadUrl: string,
    toolName: string,
    toolVersion: string
  ): Promise<string> {
    const toolExecutablePath = `${installPath}/${toolName}`
    const toolDownloadPath = await tc.downloadTool(downloadUrl)

    await io.mkdirP(installPath)
    await io.mv(toolDownloadPath, toolExecutablePath)
    await chmod(toolExecutablePath, 0o775)

    const cachedPath = await tc.cacheDir(installPath, toolName, toolVersion)
    core.addPath(cachedPath)

    return cachedPath
  }
}
