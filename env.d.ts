/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface ApiResponse {
  errCode: number
  errMsg?: string
  data?: {
    [field: string]: any
  }
}

interface GtwOptions {
  baseURL?: string
  timeout?: number
  withCredentials?: boolean
  responseType?: 'arraybuffer' | 'document' | 'json' | 'text' | 'stream'
  headers?: {
    [h: string]: string
  }
  responseEncoding?: string
  xsrfCookieName?: string
  xsrfHeaderName?: string
}

interface Settings {
  [index: string]: any
  loginUrl: string
  refreshTokenApi?: string
  fromArg?: string
  transformResponse?: (response: any) => any
  tokenHeaderName?: string
  tokenBearer?: string
  whiteList: string[]
  gtw: {
    [gtw: string]: string | GtwOptions
    default: string | GtwOptions
  }
  language?: string
  languages: {
    [lang: string]: {
      name: string
      flag?: string
    }
  }
}
