/// <reference types="vite/client" />
import 'vue-router'
import type { Route } from '@/@types'
import type { RouteLocationNormalized } from 'vue-router'

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string
  readonly VITE_ENC_KEY: string;
  readonly VITE_ENC_IV: string;
  readonly VITE_ENC_ALG: 'aes' | 'des' | 'sm4';
  readonly VITE_GTW_DEFAULT_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'vue-router' {
  interface RouteMeta {
    title?: string | ((arg: {
      context: RouteLocationNormalized,
      ts: (text: string, defaultString?: string, args?: any) => string
    }) => string)
    name?: string | ((arg: {
      context: Route,
      ts: (text: string, defaultString?: string, args?: any) => string
    }) => string)
    click?: (arg: { context: Route }) => any
    login?: false
    header?: false
    tip?: string
  }
}

declare global {

}