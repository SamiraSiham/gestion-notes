import express from "express"
import { getCours, getCoursById, createCours, updateCours, deleteCours } from "../controllers/cours.controller.js"

const router = express.Router()

router.get("/", getCours)
router.get("/:id", getCoursById)
router.post("/", createCours)
router.put("/:id", updateCours)
router.delete("/:id", deleteCours)

export default router
