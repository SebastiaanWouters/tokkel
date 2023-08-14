
import path from 'path';
 import autoPreprocess from 'svelte-preprocess';
 import typescript from '@rollup/plugin-typescript';



const SRC_DIR = path.resolve(__dirname, './src');
const PUBLIC_DIR = path.resolve(__dirname, './public');
const BUILD_DIR = path.resolve(__dirname, './build',);
export default async () => {
  const { svelte } = await import('@sveltejs/vite-plugin-svelte');
  return  {
    plugins: [
  svelte({
     preprocess: autoPreprocess()
  }),
   typescript({ sourceMap: true })
  ],
    root: SRC_DIR,
    base: '',
    publicDir: PUBLIC_DIR,
    build: {
      outDir: BUILD_DIR,
      assetsInlineLimit: 0,
      emptyOutDir: true,
      rollupOptions: {
        treeshake: false,
      },
    },
    resolve: {
      alias: {
        '@': SRC_DIR,
      },
    },
    server: {
      host: true,
    },

  };
}