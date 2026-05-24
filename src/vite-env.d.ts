/// <reference types="vite/client" />

declare interface ImportMetaEnv {
  readonly VITE_DISCORD_WIDGET_URL?: string;
  readonly VITE_DISCORD_COMBINED_ENDPOINT?: string;
  readonly VITE_DISCORD_COMBINED_FALLBACK?: string;
  readonly VITE_USE_LOCAL_DISCORD_API?: string;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}
