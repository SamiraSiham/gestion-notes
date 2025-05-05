import Evaluation from "../models/evaluation.model.js"
import Cours from "../models/cours.model.js"
import NoteEvaluation from "../models/note-evaluation.model.js"
import Eleve from "../models/eleve.model.js"
import { sequelize } from "../config/database.js"

// Récupérer toutes les évaluations d'un professeur
export const getEvaluations = async (req, res) => {
  try {
    const { cours_id } = req.query

    const whereClause = {}

    if (cours_id) {
      whereClause.id_cours = cours_id
    }

    // Récupérer les évaluations des cours du professeur
    const evaluations = await Evaluation.findAll({
      include: [
        {
          model: Cours,
          as: "cours",
          where: { id_professeur: req.user.id },
          attributes: ["id_cours", "titre"],
        },
      ],
      where: whereClause,
      order: [["date_evaluation", "DESC"]],
    })

    res.status(200).json({
      success: true,
      count: evaluations.length,
      evaluations,
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des évaluations:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des évaluations",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Récupérer une évaluation spécifique avec ses notes
export const getEvaluationById = async (req, res) => {
  try {
    const { id } = req.params

    const evaluation = await Evaluation.findOne({
      include: [
        {
          model: Cours,
          as: "cours",
          where: { id_professeur: req.user.id },
          attributes: ["id_cours", "titre"],
        },
        {
          model: NoteEvaluation,
          as: "notes",
          include: [
            {
              model: Eleve,
              as: "eleve",
              attributes: ["id_eleve", "nom", "prenom", "classe"],
            },
          ],
        },
      ],
      where: { id_evaluation: id },
    })

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: "Évaluation non trouvée",
      })
    }

    // Calculer les statistiques
    const notes = evaluation.notes.map((note) => note.note)
    const moyenne = notes.length > 0 ? notes.reduce((a, b) => a + b, 0) / notes.length : 0
    const min = notes.length > 0 ? Math.min(...notes) : 0
    const max = notes.length > 0 ? Math.max(...notes) : 0

    // Calculer l'écart-type
    let ecartType = 0
    if (notes.length > 0) {
      const variance = notes.map((x) => Math.pow(x - moyenne, 2)).reduce((a, b) => a + b, 0) / notes.length
      ecartType = Math.sqrt(variance)
    }

    res.status(200).json({
      success: true,
      evaluation,
      statistiques: {
        moyenne: Number.parseFloat(moyenne.toFixed(2)),
        min,
        max,
        ecartType: Number.parseFloat(ecartType.toFixed(2)),
        nombreNotes: notes.length,
      },
    })
  } catch (error) {
    console.error("Erreur lors de la récupération de l'évaluation:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération de l'évaluation",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Créer une nouvelle évaluation
export const createEvaluation = async (req, res) => {
  try {
    const { id_cours, titre, type, date_evaluation, coefficient, description } = req.body

    // Vérifier si le cours appartient au professeur
    const cours = await Cours.findOne({
      where: {
        id_cours,
        id_professeur: req.user.id,
      },
    })

    if (!cours) {
      return res.status(404).json({
        success: false,
        message: "Cours non trouvé ou non autorisé",
      })
    }

    // Créer l'évaluation
    const evaluation = await Evaluation.create({
      id_cours,
      titre,
      type,
      date_evaluation,
      coefficient,
      description,
    })

    res.status(201).json({
      success: true,
      message: "Évaluation créée avec succès",
      evaluation,
    })
  } catch (error) {
    console.error("Erreur lors de la création de l'évaluation:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création de l'évaluation",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Mettre à jour une évaluation
export const updateEvaluation = async (req, res) => {
  try {
    const { id } = req.params
    const { titre, type, date_evaluation, coefficient, description } = req.body

    // Vérifier si l'évaluation existe et appartient à un cours du professeur
    const evaluation = await Evaluation.findOne({
      include: [
        {
          model: Cours,
          as: "cours",
          where: { id_professeur: req.user.id },
        },
      ],
      where: { id_evaluation: id },
    })

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: "Évaluation non trouvée ou non autorisée",
      })
    }

    // Mettre à jour l'évaluation
    await evaluation.update({
      titre,
      type,
      date_evaluation,
      coefficient,
      description,
    })

    res.status(200).json({
      success: true,
      message: "Évaluation mise à jour avec succès",
      evaluation,
    })
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'évaluation:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour de l'évaluation",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Supprimer une évaluation
export const deleteEvaluation = async (req, res) => {
  const transaction = await sequelize.transaction()

  try {
    const { id } = req.params

    // Vérifier si l'évaluation existe et appartient à un cours du professeur
    const evaluation = await Evaluation.findOne({
      include: [
        {
          model: Cours,
          as: "cours",
          where: { id_professeur: req.user.id },
        },
      ],
      where: { id_evaluation: id },
    })

    if (!evaluation) {
      await transaction.rollback()
      return res.status(404).json({
        success: false,
        message: "Évaluation non trouvée ou non autorisée",
      })
    }

    // Supprimer l'évaluation (les contraintes de clé étrangère devraient supprimer les notes associées)
    await evaluation.destroy({ transaction })

    await transaction.commit()

    res.status(200).json({
      success: true,
      message: "Évaluation supprimée avec succès",
    })
  } catch (error) {
    await transaction.rollback()
    console.error("Erreur lors de la suppression de l'évaluation:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression de l'évaluation",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}
