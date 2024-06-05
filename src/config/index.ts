import type { Route, Settings, Handlers } from '@/@types'

const defineRouter = (routes: Route[]): Route[] => routes

const defineSetting = (settings: Settings): Settings => {
  settings.whiteList = settings.whiteList || []

  for (const key in settings) {
    if (key.endsWith('Url')) {
      settings.whiteList.push(settings[key])
    }
  }

  return settings
}

const defineHandler = (handlers: Handlers): Handlers => handlers

export { defineRouter, defineSetting, defineHandler }
