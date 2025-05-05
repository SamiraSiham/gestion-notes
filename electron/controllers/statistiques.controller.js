import Cours from "../models/cours.model.js"
import Evaluation from "../models/evaluation.model.js"
import ActiviteClasse from "../models/activite-classe.model.js"
import NoteEvaluation from "../models/note-evaluation.model.js"
import NoteActivite from "../models/note-activite.model.js"
import Eleve from "../models/eleve.model.js"
import PartieCours from "../models/partie-cours.model.js"
import { Op } from "sequelize"

// Statistiques globales pour un cours
export const getStatistiquesCours = async (req, res) => {
  try {
    const { id_cours } = req.params

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

    // Récupérer toutes les évaluations du cours
    const evaluations = await Evaluation.findAll({
      where: { id_cours },
      include: [
        {
          model: NoteEvaluation,
          as: "notes",
          include: [
            {
              model: Eleve,
              as: "eleve",
              attributes: ["id_eleve", "nom", "prenom"],
            },
          ],
        },
      ],
    })

    // Récupérer toutes les activités du cours
    const activites = await ActiviteClasse.findAll({
      where: { id_cours },
      include: [
        {
          model: NoteActivite,
          as: "notes",
          include: [
            {
              model: Eleve,
              as: "eleve",
              attributes: ["id_eleve", "nom", "prenom"],
            },
          ],
        },
      ],
    })

    // Calculer les moyennes par évaluation
    const moyennesEvaluations = evaluations.map((evaluation) => {
      const notes = evaluation.notes.map((note) => note.note)
      const moyenne = notes.length > 0 ? notes.reduce((a, b) => a + b, 0) / notes.length : 0
      return {
        id_evaluation: evaluation.id_evaluation,
        titre: evaluation.titre,
        type: evaluation.type,
        date: evaluation.date_evaluation,
        coefficient: evaluation.coefficient,
        moyenne: Number.parseFloat(moyenne.toFixed(2)),
        nombre_notes: notes.length,
      }
    })

    // Calculer les moyennes par activité
    const moyennesActivites = activites.map((activite) => {
      const notes = activite.notes.map((note) => note.note)
      const moyenne = notes.length > 0 ? notes.reduce((a, b) => a + b, 0) / notes.length : 0
      return {
        id_activite: activite.id_activite,
        titre: activite.titre,
        date: activite.date_activite,
        coefficient: activite.coefficient,
        moyenne: Number.parseFloat(moyenne.toFixed(2)),
        nombre_notes: notes.length,
      }
    })

    // Calculer les moyennes par élève
    const eleves = await cours.getEleves()
    const moyennesEleves = []

    for (const eleve of eleves) {
      // Notes d'évaluations
      const notesEval = await NoteEvaluation.findAll({
        include: [
          {
            model: Evaluation,
            as: "evaluation",
            where: { id_cours },
            attributes: ["coefficient"],
          },
        ],
        where: { id_eleve: eleve.id_eleve },
      })

      // Notes d'activités
      const notesAct = await NoteActivite.findAll({
        include: [
          {
            model: ActiviteClasse,
            as: "activite",
            where: { id_cours },
            attributes: ["coefficient"],
          },
        ],
        where: { id_eleve: eleve.id_eleve },
      })

      // Calculer la moyenne pondérée
      let sommeNotes = 0
      let sommeCoefficients = 0

      notesEval.forEach((note) => {
        sommeNotes += note.note * note.evaluation.coefficient
        sommeCoefficients += note.evaluation.coefficient
      })

      notesAct.forEach((note) => {
        sommeNotes += note.note * note.activite.coefficient
        sommeCoefficients += note.activite.coefficient
      })

      const moyenne = sommeCoefficients > 0 ? sommeNotes / sommeCoefficients : 0

      moyennesEleves.push({
        id_eleve: eleve.id_eleve,
        nom: eleve.nom,
        prenom: eleve.prenom,
        classe: eleve.classe,
        moyenne: Number.parseFloat(moyenne.toFixed(2)),
        nombre_notes: notesEval.length + notesAct.length,
      })
    }

    // Trier les élèves par moyenne décroissante
    moyennesEleves.sort((a, b) => b.moyenne - a.moyenne)

    res.status(200).json({
      success: true,
      cours: {
        id_cours: cours.id_cours,
        titre: cours.titre,
        niveau: cours.niveau,
      },
      statistiques: {
        moyennesEvaluations,
        moyennesActivites,
        moyennesEleves,
        moyenne_generale: Number.parseFloat(
          (moyennesEleves.reduce((a, b) => a + b.moyenne, 0) / (moyennesEleves.length || 1)).toFixed(2),
        ),
      },
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des statistiques",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Identifier les élèves nécessitant un soutien scolaire
export const identifierBesoinsSoutien = async (req, res) => {
  try {
    const { id_cours } = req.params
    const { seuil = 10 } = req.query // Seuil par défaut à 10/20

    // Vérifier si le cours appartient au professeur
    const cours = await Cours.findOne({
      where: {
        id_cours,
        id_professeur: req.user.id,
      },
      include: [
        {
          model: PartieCours,
          as: "parties",
        },
      ],
    })

    if (!cours) {
      return res.status(404).json({
        success: false,
        message: "Cours non trouvé ou non autorisé",
      })
    }

    // Récupérer les élèves du cours
    const eleves = await cours.getEleves()

    // Récupérer les parties du cours
    const parties = cours.parties

    // Pour chaque partie, identifier les élèves en difficulté
    const besoins = []

    for (const partie of parties) {
      // Récupérer les évaluations liées à cette partie
      const evaluations = await Evaluation.findAll({
        where: {
          id_cours,
          // Ici, on pourrait ajouter un champ id_partie_cours dans le modèle Evaluation
          // pour lier directement les évaluations aux parties de cours
          // Pour l'exemple, on suppose que le titre de l'évaluation contient le titre de la partie
          [Op.or]: [{ titre: { [Op.like]: `%${partie.titre}%` } }, { description: { [Op.like]: `%${partie.titre}%` } }],
        },
      })

      const idsEvaluations = evaluations.map((e) => e.id_evaluation)

      // Pour chaque élève, calculer la moyenne sur cette partie
      for (const eleve of eleves) {
        if (idsEvaluations.length > 0) {
          const notes = await NoteEvaluation.findAll({
            where: {
              id_eleve: eleve.id_eleve,
              id_evaluation: { [Op.in]: idsEvaluations },
            },
            include: [
              {
                model: Evaluation,
                as: "evaluation",
                attributes: ["coefficient"],
              },
            ],
          })

          if (notes.length > 0) {
            // Calculer la moyenne pondérée
            let sommeNotes = 0
            let sommeCoefficients = 0

            notes.forEach((note) => {
              sommeNotes += note.note * note.evaluation.coefficient
              sommeCoefficients += note.evaluation.coefficient
            })

            const moyenne = sommeCoefficients > 0 ? sommeNotes / sommeCoefficients : 0

            // Si la moyenne est inférieure au seuil, l'élève a besoin de soutien
            if (moyenne < seuil) {
              besoins.push({
                id_eleve: eleve.id_eleve,
                nom: eleve.nom,
                prenom: eleve.prenom,
                classe: eleve.classe,
                id_partie_cours: partie.id_partie_cours,
                titre_partie: partie.titre,
                moyenne: Number.parseFloat(moyenne.toFixed(2)),
                nombre_notes: notes.length,
                justification: `Moyenne inférieure à ${seuil}/20 dans cette partie du cours`,
              })
            }
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      cours: {
        id_cours: cours.id_cours,
        titre: cours.titre,
      },
      besoins_soutien: besoins,
    })
  } catch (error) {
    console.error("Erreur lors de l'identification des besoins en soutien:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'identification des besoins en soutien",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}
