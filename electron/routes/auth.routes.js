import express from "express"
import { register, login, getProfile, updateProfile } from "../controllers/auth.controller.js"
import { authenticateJWT } from "../middlewares/auth.middleware.js"

const router = express.Router()

// Routes publiques
router.post("/register", register)
router.post("/login", login)

// Routes protégées
router.get("/profile", authenticateJWT, getProfile)
router.put("/profile", authenticateJWT, updateProfile)

export default router
