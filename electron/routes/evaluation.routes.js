import express from "express"
import {
  getEvaluations,
  getEvaluationById,
  createEvaluation,
  updateEvaluation,
  deleteEvaluation,
} from "../controllers/evaluation.controller.js"

const router = express.Router()

router.get("/", getEvaluations)
router.get("/:id", getEvaluationById)
router.post("/", createEvaluation)
router.put("/:id", updateEvaluation)
router.delete("/:id", deleteEvaluation)

export default router
