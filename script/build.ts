import { build as esbuild } from "esbuild"
import { build as viteBuild } from "vite"
import { rm, readFile } from "fs/promises"

const allowlist = [
  "axios",
  "date-fns",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "express-session",
  "jsonwebtoken",
  "memorystore",
  "mongoose",
  "passport",
  "passport-local",
  "ws",
  "zod",
  "zod-validation-error"
]

async function buildAll() {
  await rm("dist", { recursive: true, force: true })

  console.log("Building client...")
  await viteBuild({
    configFile: "client/vite.config.ts"
  })

  console.log("Building server...")
  const pkg = JSON.parse(await readFile("package.json", "utf-8"))
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {})
  ]
  const externals = allDeps.filter((dep) => !allowlist.includes(dep))

  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    minify: true,
    external: externals,
    logLevel: "info"
  })
}

buildAll().catch((err) => {
  console.error(err)
  process.exit(1)
})
