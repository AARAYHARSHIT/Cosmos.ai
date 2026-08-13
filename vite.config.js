import { defineConfig } from 'vite';

export default defineConfig({
  publicDir: 'public',
  build: {
    minify: 'esbuild',
    target: 'es2020',
    rollupOptions: {
      treeshake: true,
      output: {
        manualChunks: {
          three: ['three'],
          gsap: ['gsap', 'gsap/ScrollTrigger'],
          anime: ['animejs'],
        },
      },
    },
  },
});
