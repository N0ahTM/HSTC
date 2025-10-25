declare module 'vite-plugin-compression' {
  import type { ZlibOptions, BrotliOptions } from 'zlib';

  type Algorithm = 'gzip' | 'brotliCompress' | 'deflate' | 'deflateRaw';
  type CompressionOptions = Partial<ZlibOptions> | Partial<BrotliOptions>;

  interface VitePluginCompressionOptions {
    verbose?: boolean;
    threshold?: number;
    filter?: RegExp | ((file: string) => boolean);
    disable?: boolean;
    algorithm?: Algorithm;
    ext?: string;
    compressionOptions?: CompressionOptions;
    deleteOriginFile?: boolean;
    success?: () => void;
  }

  type PluginLike = {
    name?: string;
    enforce?: 'pre' | 'post';
    apply?: unknown;
    [key: string]: unknown;
  };

  export default function viteCompression(options?: VitePluginCompressionOptions): PluginLike;
  export type { VitePluginCompressionOptions as ViteCompressionOptions };
}
