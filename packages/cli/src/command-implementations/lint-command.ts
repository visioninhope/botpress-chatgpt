import { IntegrationDefinition } from '@botpress/sdk'
import { prepareCreateIntegrationBody } from '../api/integration-body'
import type commandDefinitions from '../command-definitions'
import * as errors from '../errors'
import { IntegrationLinter } from '../linter/integration-linter'
import { ProjectCommand } from './project-command'

export type LintCommandDefinition = typeof commandDefinitions.lint
export class LintCommand extends ProjectCommand<LintCommandDefinition> {
  public async run(): Promise<void> {
    const projectDef = await this.readProjectDefinitionFromFS()

    switch (projectDef.type) {
      case 'integration':
        return this._runLintForIntegration(projectDef.definition)
      case 'bot':
        throw new errors.BotpressCLIError('Bot linting is not yet implemented')
      case 'interface':
        throw new errors.BotpressCLIError('Interface linting is not yet implemented')
      default:
        throw new errors.BotpressCLIError('Unsupported project type')
    }
  }

  private async _runLintForIntegration(definition: IntegrationDefinition): Promise<void> {
    const strippedDefinition = this._stripAutoGeneratedContentFromIntegration(definition)
    const parsedIntegrationDefinition = await prepareCreateIntegrationBody(strippedDefinition, { dereference: true })
    const linter = new IntegrationLinter(parsedIntegrationDefinition)

    await linter.lint()
    linter.logResults(this.logger)
  }

  private _stripAutoGeneratedContentFromIntegration(definition: IntegrationDefinition) {
    const { actionNames, eventNames } = this._getAutoGeneratedContentOfIntegration(definition)

    return {
      ...definition,
      actions: Object.fromEntries(Object.entries(definition.actions ?? {}).filter(([key]) => !actionNames.has(key))),
      events: Object.fromEntries(Object.entries(definition.events ?? {}).filter(([key]) => !eventNames.has(key))),
    } as IntegrationDefinition
  }

  private _getAutoGeneratedContentOfIntegration(definition: IntegrationDefinition) {
    const actionNames = new Set<string>()
    const eventNames = new Set<string>()

    for (const iface of Object.values(definition.interfaces)) {
      for (const actionDefinition of Object.values(iface.actions)) {
        actionNames.add(actionDefinition.name)
      }
      for (const eventDefinition of Object.values(iface.events)) {
        eventNames.add(eventDefinition.name)
      }
    }

    return { actionNames, eventNames } as const
  }
}
