import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import zlib from "node:zlib";
import { compression, defineAlgorithm } from "vite-plugin-compression2";
import svgr from "vite-plugin-svgr";
import { analyzer } from "vite-bundle-analyzer";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    svgr(),
    tailwindcss(),

    // ── Precompression ────────────────────────────────────────────────
    // Generates .gz (gzip level 9) and .br (brotli quality 11) files
    // next to every asset in dist/ after the build finishes.
    compression({
      // Only bother compressing assets larger than 1 KB —
      // tiny files gain almost nothing and can even get bigger.
      threshold: 1024,

      algorithms: [
        // Maximum gzip compression (default level is 6, this is 9)
        defineAlgorithm("gzip", { level: 9 }),

        // Maximum brotli compression (quality 11)
        defineAlgorithm("brotliCompress", {
          params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 },
        }),
      ],

      // Keep the original files — the server needs them as a fallback
      // for clients that can't handle the compressed variants.
      deleteOriginalAssets: false,

      // If compressing makes a file bigger (or equal), skip writing it.
      skipIfLargerOrEqual: true,
    }),

    // ── Bundle treemap ────────────────────────────────────────────────
    // Only in the analyze build, so normal builds pay nothing:
    //   npm run build:analyze   →  opens a map of every chunk
    ...(mode === "analyze" ? [analyzer({ analyzerMode: "static" })] : []),
  ],

  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@app": path.resolve(import.meta.dirname, "src/app"),
      "@api": path.resolve(import.meta.dirname, "src/api"),
      "@components": path.resolve(import.meta.dirname, "src/components"),
      "@validations": path.resolve(import.meta.dirname, "src/validations"),
      "@hooks": path.resolve(import.meta.dirname, "src/hooks"),
    },
  },

  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/ws": {
        target: "ws://localhost:3000",
        ws: true,
        changeOrigin: true,
      },
    },
  },

  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 350,

    rolldownOptions: {
      onwarn(warning, defaultHandler) {
        // Completely ignore the Tailwind sourcemap warning
        if (
          warning.code === "SOURCEMAP_BROKEN" ||
          warning.message?.includes("SOURCEMAP_BROKEN") ||
          warning.message?.includes("@tailwindcss/vite")
        ) {
          return;
        }
        defaultHandler(warning);
      },

      output: {
        codeSplitting: {
          groups: [
            {
              name: "react-vendor",
              test: /node_modules\/(react|react-dom|react-router|react-router-dom)/,
              minSize: 20_000,
            },
            {
              name: "motion-vendor",
              test: /node_modules\/(framer-motion|motion)/,
              minSize: 20_000,
            },
            {
              name: "query-vendor",
              test: /node_modules\/(@tanstack|axios)/,
              minSize: 20_000,
            },
            {
              name: "ui-vendor",
              test: /node_modules\/(sonner|zustand|zod)/,
              minSize: 20_000,
            },
            {
              name: "icons-vendor",
              test: /node_modules\/(@hugeicons)/,
              minSize: 20_000,
            },
          ],
        },
      },
    },
  },
}));
