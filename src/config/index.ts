import { type NavigationGuardNext } from 'vue-router'
import { AxiosError } from 'axios'
import type { Route, Settings, CommonResponse } from '@/@types'

const defineRouter = (routes: Route[]): Route[] => routes
const defineSetting = (settings: Settings): Settings => settings
const defineHandler = (handlers: {
  [event: string]: (event: {
    url?: string
    next?: NavigationGuardNext
    data?: CommonResponse
    error?: AxiosError
  }) => void
}): any => handlers

export { defineRouter, defineSetting, defineHandler }
