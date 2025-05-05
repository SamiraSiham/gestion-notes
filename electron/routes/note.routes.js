import express from "express"
import {
  getNotesEvaluation,
  upsertNoteEvaluation,
  bulkUpsertNotesEvaluation,
  getNotesEleve,
} from "../controllers/note.controller.js"

const router = express.Router()

router.get("/evaluation/:id_evaluation", getNotesEvaluation)
router.post("/evaluation", upsertNoteEvaluation)
router.post("/evaluation/bulk", bulkUpsertNotesEvaluation)
router.get("/eleve/:id_eleve", getNotesEleve)

export default router
