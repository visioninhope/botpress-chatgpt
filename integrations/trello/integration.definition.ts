import { IntegrationDefinition } from '@botpress/sdk'

import { sentry as sentryHelpers } from '@botpress/sdk-addons'
import { configuration, states, user, actions } from './src/definitions'

export default new IntegrationDefinition({
  name: 'trello',
  version: '0.2.0',
  readme: 'hub.md',
  icon: 'icon.svg',
  configuration,
  user,
  actions,
  events: {},
  channels: {},
  states,
  secrets: [...sentryHelpers.COMMON_SECRET_NAMES],
})