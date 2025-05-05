import NoteEvaluation from "../models/note-evaluation.model.js"
import NoteActivite from "../models/note-activite.model.js"
import Evaluation from "../models/evaluation.model.js"
import ActiviteClasse from "../models/activite-classe.model.js"
import Eleve from "../models/eleve.model.js"
import Cours from "../models/cours.model.js"
import { sequelize } from "../config/database.js"

// Récupérer les notes d'une évaluation
export const getNotesEvaluation = async (req, res) => {
  try {
    const { id_evaluation } = req.params

    // Vérifier si l'évaluation appartient à un cours du professeur
    const evaluation = await Evaluation.findOne({
      include: [
        {
          model: Cours,
          as: "cours",
          where: { id_professeur: req.user.id },
        },
      ],
      where: { id_evaluation },
    })

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: "Évaluation non trouvée ou non autorisée",
      })
    }

    // Récupérer les notes
    const notes = await NoteEvaluation.findAll({
      where: { id_evaluation },
      include: [
        {
          model: Eleve,
          as: "eleve",
          attributes: ["id_eleve", "nom", "prenom", "classe"],
        },
      ],
      order: [
        [{ model: Eleve, as: "eleve" }, "nom", "ASC"],
        [{ model: Eleve, as: "eleve" }, "prenom", "ASC"],
      ],
    })

    res.status(200).json({
      success: true,
      count: notes.length,
      notes,
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des notes:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des notes",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Ajouter ou mettre à jour une note d'évaluation
export const upsertNoteEvaluation = async (req, res) => {
  const transaction = await sequelize.transaction()

  try {
    const { id_evaluation, id_eleve, note, commentaire } = req.body

    // Vérifier si l'évaluation appartient à un cours du professeur
    const evaluation = await Evaluation.findOne({
      include: [
        {
          model: Cours,
          as: "cours",
          where: { id_professeur: req.user.id },
        },
      ],
      where: { id_evaluation },
    })

    if (!evaluation) {
      await transaction.rollback()
      return res.status(404).json({
        success: false,
        message: "Évaluation non trouvée ou non autorisée",
      })
    }

    // Vérifier si l'élève est inscrit au cours
    const cours = evaluation.cours
    const eleveInscrit = await cours.hasEleve(id_eleve)

    if (!eleveInscrit) {
      await transaction.rollback()
      return res.status(400).json({
        success: false,
        message: "L'élève n'est pas inscrit à ce cours",
      })
    }

    // Vérifier si la note existe déjà
    let noteEvaluation = await NoteEvaluation.findOne({
      where: {
        id_evaluation,
        id_eleve,
      },
    })

    if (noteEvaluation) {
      // Mettre à jour la note existante
      await noteEvaluation.update(
        {
          note,
          commentaire,
          date_saisie: new Date(),
        },
        { transaction },
      )
    } else {
      // Créer une nouvelle note
      noteEvaluation = await NoteEvaluation.create(
        {
          id_evaluation,
          id_eleve,
          note,
          commentaire,
          date_saisie: new Date(),
        },
        { transaction },
      )
    }

    await transaction.commit()

    res.status(200).json({
      success: true,
      message: "Note enregistrée avec succès",
      note: noteEvaluation,
    })
  } catch (error) {
    await transaction.rollback()
    console.error("Erreur lors de l'enregistrement de la note:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'enregistrement de la note",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Ajouter ou mettre à jour plusieurs notes d'évaluation en une seule requête
export const bulkUpsertNotesEvaluation = async (req, res) => {
  const transaction = await sequelize.transaction()

  try {
    const { id_evaluation, notes } = req.body

    // Vérifier si l'évaluation appartient à un cours du professeur
    const evaluation = await Evaluation.findOne({
      include: [
        {
          model: Cours,
          as: "cours",
          where: { id_professeur: req.user.id },
        },
      ],
      where: { id_evaluation },
    })

    if (!evaluation) {
      await transaction.rollback()
      return res.status(404).json({
        success: false,
        message: "Évaluation non trouvée ou non autorisée",
      })
    }

    // Traiter chaque note
    const results = []
    for (const noteData of notes) {
      const { id_eleve, note, commentaire } = noteData

      // Vérifier si l'élève est inscrit au cours
      const cours = evaluation.cours
      const eleveInscrit = await cours.hasEleve(id_eleve)

      if (!eleveInscrit) {
        continue // Ignorer cet élève et passer au suivant
      }

      // Vérifier si la note existe déjà
      let noteEvaluation = await NoteEvaluation.findOne({
        where: {
          id_evaluation,
          id_eleve,
        },
      })

      if (noteEvaluation) {
        // Mettre à jour la note existante
        await noteEvaluation.update(
          {
            note,
            commentaire,
            date_saisie: new Date(),
          },
          { transaction },
        )
      } else {
        // Créer une nouvelle note
        noteEvaluation = await NoteEvaluation.create(
          {
            id_evaluation,
            id_eleve,
            note,
            commentaire,
            date_saisie: new Date(),
          },
          { transaction },
        )
      }

      results.push(noteEvaluation)
    }

    await transaction.commit()

    res.status(200).json({
      success: true,
      message: `${results.length} notes enregistrées avec succès`,
      count: results.length,
    })
  } catch (error) {
    await transaction.rollback()
    console.error("Erreur lors de l'enregistrement des notes:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'enregistrement des notes",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Fonctions similaires pour les notes d'activités
// ...

// Récupérer toutes les notes d'un élève
export const getNotesEleve = async (req, res) => {
  try {
    const { id_eleve } = req.params
    const { id_cours } = req.query

    const whereClause = {}
    if (id_cours) {
      whereClause.id_cours = id_cours
    }

    // Récupérer les notes d'évaluation
    const notesEvaluation = await NoteEvaluation.findAll({
      include: [
        {
          model: Evaluation,
          as: "evaluation",
          include: [
            {
              model: Cours,
              as: "cours",
              where: {
                id_professeur: req.user.id,
                ...whereClause,
              },
            },
          ],
        },
      ],
      where: { id_eleve },
    })

    // Récupérer les notes d'activité
    const notesActivite = await NoteActivite.findAll({
      include: [
        {
          model: ActiviteClasse,
          as: "activite",
          include: [
            {
              model: Cours,
              as: "cours",
              where: {
                id_professeur: req.user.id,
                ...whereClause,
              },
            },
          ],
        },
      ],
      where: { id_eleve },
    })

    // Récupérer les informations de l'élève
    const eleve = await Eleve.findByPk(id_eleve)

    res.status(200).json({
      success: true,
      eleve,
      notesEvaluation,
      notesActivite,
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des notes de l'élève:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des notes de l'élève",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}
