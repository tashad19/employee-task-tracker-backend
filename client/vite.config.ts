import { defineConfig } from "vite"

export default defineConfig({
  root: "./client",
  publicDir: "public",
  build: {
    outDir: "../dist/public",
    emptyOutDir: true
  }
})
