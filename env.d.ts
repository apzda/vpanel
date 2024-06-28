/// <reference types="vite/client" />

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
