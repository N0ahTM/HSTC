declare module 'vite' {
  export interface Plugin {
    name?: string;
    enforce?: 'pre' | 'post';
    apply?: unknown;
    [key: string]: unknown;
  }

  export interface UserConfig {
    plugins?: unknown[];
    server?: Record<string, unknown>;
    build?: Record<string, unknown>;
    resolve?: Record<string, unknown>;
    [key: string]: unknown;
  }

  export function defineConfig(config: UserConfig): UserConfig;
}
