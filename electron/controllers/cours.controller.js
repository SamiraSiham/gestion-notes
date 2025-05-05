import Cours from "../models/cours.model.js"
import Eleve from "../models/eleve.model.js"
import Inscription from "../models/inscription.model.js"
import PartieCours from "../models/partie-cours.model.js"
import { sequelize } from "../config/database.js"

// Récupérer tous les cours d'un professeur
export const getCours = async (req, res) => {
  try {
    const cours = await Cours.findAll({
      where: { id_professeur: req.user.id },
      order: [["date_debut", "DESC"]],
    })

    res.status(200).json({
      success: true,
      count: cours.length,
      cours,
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des cours:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des cours",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Récupérer un cours spécifique avec ses détails
export const getCoursById = async (req, res) => {
  try {
    const { id } = req.params

    const cours = await Cours.findOne({
      where: {
        id_cours: id,
        id_professeur: req.user.id,
      },
      include: [
        {
          model: Eleve,
          as: "eleves",
          through: { attributes: [] },
        },
        {
          model: PartieCours,
          as: "parties",
          order: [["ordre", "ASC"]],
        },
      ],
    })

    if (!cours) {
      return res.status(404).json({
        success: false,
        message: "Cours non trouvé",
      })
    }

    res.status(200).json({
      success: true,
      cours,
    })
  } catch (error) {
    console.error("Erreur lors de la récupération du cours:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du cours",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Créer un nouveau cours
export const createCours = async (req, res) => {
  const transaction = await sequelize.transaction()

  try {
    const { titre, description, niveau, date_debut, date_fin, eleves, parties } = req.body

    // Créer le cours
    const cours = await Cours.create(
      {
        id_professeur: req.user.id,
        titre,
        description,
        niveau,
        date_debut,
        date_fin,
      },
      { transaction },
    )

    // Ajouter les élèves au cours si fournis
    if (eleves && eleves.length > 0) {
      const inscriptions = eleves.map((id_eleve) => ({
        id_cours: cours.id_cours,
        id_eleve,
        date_inscription: new Date(),
        statut: "actif",
      }))

      await Inscription.bulkCreate(inscriptions, { transaction })
    }

    // Ajouter les parties du cours si fournies
    if (parties && parties.length > 0) {
      const partiesCours = parties.map((partie, index) => ({
        id_cours: cours.id_cours,
        titre: partie.titre,
        description: partie.description,
        ordre: index + 1,
      }))

      await PartieCours.bulkCreate(partiesCours, { transaction })
    }

    await transaction.commit()

    res.status(201).json({
      success: true,
      message: "Cours créé avec succès",
      cours,
    })
  } catch (error) {
    await transaction.rollback()
    console.error("Erreur lors de la création du cours:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création du cours",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Mettre à jour un cours existant
export const updateCours = async (req, res) => {
  const transaction = await sequelize.transaction()

  try {
    const { id } = req.params
    const { titre, description, niveau, date_debut, date_fin, eleves } = req.body

    // Vérifier si le cours existe et appartient au professeur
    const cours = await Cours.findOne({
      where: {
        id_cours: id,
        id_professeur: req.user.id,
      },
    })

    if (!cours) {
      await transaction.rollback()
      return res.status(404).json({
        success: false,
        message: "Cours non trouvé",
      })
    }

    // Mettre à jour les informations du cours
    await cours.update(
      {
        titre,
        description,
        niveau,
        date_debut,
        date_fin,
      },
      { transaction },
    )

    // Mettre à jour les élèves si fournis
    if (eleves) {
      // Supprimer les inscriptions existantes
      await Inscription.destroy({
        where: { id_cours: id },
        transaction,
      })

      // Ajouter les nouvelles inscriptions
      if (eleves.length > 0) {
        const inscriptions = eleves.map((id_eleve) => ({
          id_cours: cours.id_cours,
          id_eleve,
          date_inscription: new Date(),
          statut: "actif",
        }))

        await Inscription.bulkCreate(inscriptions, { transaction })
      }
    }

    await transaction.commit()

    res.status(200).json({
      success: true,
      message: "Cours mis à jour avec succès",
      cours,
    })
  } catch (error) {
    await transaction.rollback()
    console.error("Erreur lors de la mise à jour du cours:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour du cours",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Supprimer un cours
export const deleteCours = async (req, res) => {
  const transaction = await sequelize.transaction()

  try {
    const { id } = req.params

    // Vérifier si le cours existe et appartient au professeur
    const cours = await Cours.findOne({
      where: {
        id_cours: id,
        id_professeur: req.user.id,
      },
    })

    if (!cours) {
      await transaction.rollback()
      return res.status(404).json({
        success: false,
        message: "Cours non trouvé",
      })
    }

    // Supprimer le cours (les contraintes de clé étrangère devraient supprimer les données associées)
    await cours.destroy({ transaction })

    await transaction.commit()

    res.status(200).json({
      success: true,
      message: "Cours supprimé avec succès",
    })
  } catch (error) {
    await transaction.rollback()
    console.error("Erreur lors de la suppression du cours:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression du cours",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}
