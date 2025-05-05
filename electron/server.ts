import express, { type Request, type Response } from "express"
import type { Server } from "http"
import  cors from 'cors'
import { testConnection } from "./config/database.ts"
import authRoutes from "./routes/auth.routes.js"
// import coursRoutes from "./routes/cours.routes.js"
// import eleveRoutes from "./routes/eleve.routes.js"
// import evaluationRoutes from "./routes/evaluation.routes.js"
// import activiteRoutes from "./routes/activite.routes.js"
// import noteRoutes from "./routes/note.routes.js"
// import soutienRoutes from "./routes/soutien.routes.js"
// import statistiquesRoutes from "./routes/statistiques.routes.js"
// import { authenticateJWT } from "./middleware/auth.middleware.js"

const app = express()
const PORT = 3002
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


// Routes
app.use("/api/auth", authRoutes)
// app.use("/api/cours", authenticateJWT, coursRoutes)
// app.use("/api/eleves", authenticateJWT, eleveRoutes)
// app.use("/api/evaluations", authenticateJWT, evaluationRoutes)
// app.use("/api/activites", authenticateJWT, activiteRoutes)
// app.use("/api/notes", authenticateJWT, noteRoutes)
// app.use("/api/soutien", authenticateJWT, soutienRoutes)
// app.use("/api/statistiques", authenticateJWT, statistiquesRoutes)

// Route de test
app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "API de gestion des notes des professeurs" })
})

let server: Server | null = null

export function startServer(): Server {
  testConnection();
  server = app.listen(PORT, () => {
    console.log(`Express server is running on port ${PORT}`)
  })
  return server
}

export function stopServer(): void {
  if (server) {
    server.close()
  }
}
