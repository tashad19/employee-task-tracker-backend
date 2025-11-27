import express, { type Request, Response, NextFunction } from "express"
import { registerRoutes } from "./routes"
import { serveStatic } from "./static"
import { createServer } from "http"
import dotenv from "dotenv"

dotenv.config()

const app = express()
const httpServer = createServer(app)

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown
  }
}

// Add CORS configuration
app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:5000",
    "http://localhost:3000",
    "http://localhost:5173",
    "https://employee-task-tracker-backend.onrender.com",
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin || "")) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf
    }
  })
)

app.use(express.urlencoded({ extended: false }))

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  })
  console.log(`${formattedTime} [${source}] ${message}`)
}

app.use((req, res, next) => {
  const start = Date.now()
  const path = req.path
  let capturedJsonResponse: Record<string, any> | undefined = undefined

  const originalResJson = res.json
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson
    return originalResJson.apply(res, [bodyJson, ...args])
  }

  res.on("finish", () => {
    const duration = Date.now() - start
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`
      }
      log(logLine)
    }
  })

  next()
})

;(async () => {
  await registerRoutes(httpServer, app)

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500
    const message = err.message || "Internal Server Error"
    res.status(status).json({ message })
    throw err
  })

  // Disable frontend serving when running on Render backend-only deployments
  const isRender = process.env.RENDER || process.env.RENDER_SERVICE_ID

  if (process.env.NODE_ENV === "production" && !isRender) {
    // Only serve static frontend when NOT on Render backend
    serveStatic(app)
  } else if (!isRender) {
    // Local dev uses Vite
    const { setupVite } = await import("./vite")
    await setupVite(httpServer, app)
  } else {
    // Render backend mode -> no frontend
    console.log("Running in Render backend mode: skipping frontend serving")
  }


  const port = parseInt(process.env.PORT || "5000", 10)

  const listenOptions: any = {
    port,
    host: "0.0.0.0"
  }

  if (process.platform !== "win32") {
    listenOptions.reusePort = true
  }

  httpServer.listen(listenOptions, () => {
    log(`serving on port ${port}`)
  })
})()
