import express from "express"
import { getStatistiquesCours, identifierBesoinsSoutien } from "../controllers/statistiques.controller.js"

const router = express.Router()

router.get("/cours/:id_cours", getStatistiquesCours)
router.get("/soutien/:id_cours", identifierBesoinsSoutien)

export default router
