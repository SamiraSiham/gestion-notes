import jwt from "jsonwebtoken"
import Professeur from "../models/professeur.model.js"

// Inscription d'un nouveau professeur
export const register = async (req, res) => {
  try {
    const { nom, prenom, email, mot_de_passe, matiere_specialite } = req.body

    // Vérifier si l'email existe déjà
    const existingProfesseur = await Professeur.findOne({ where: { email } })
    if (existingProfesseur) {
      return res.status(400).json({
        success: false,
        message: "Cet email est déjà utilisé",
      })
    }

    // Créer le nouveau professeur
    const professeur = await Professeur.create({
      nom,
      prenom,
      email,
      mot_de_passe,
      matiere_specialite,
    })

    // Générer le token JWT
    const token = jwt.sign({ id: professeur.id_professeur, email: professeur.email }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    })

    res.status(201).json({
      success: true,
      message: "Professeur créé avec succès",
      token,
      professeur: {
        id: professeur.id_professeur,
        nom: professeur.nom,
        prenom: professeur.prenom,
        email: professeur.email,
        matiere_specialite: professeur.matiere_specialite,
      },
    })
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'inscription",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Connexion d'un professeur
export const login = async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body

    // Trouver le professeur par email
    const professeur = await Professeur.findOne({ where: { email } })
    if (!professeur) {
      return res.status(404).json({
        success: false,
        message: "Professeur non trouvé",
      })
    }

    // Vérifier le mot de passe
    const isPasswordValid = await professeur.verifyPassword(mot_de_passe)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Mot de passe incorrect",
      })
    }

    // Générer le token JWT
    const token = jwt.sign({ id: professeur.id_professeur, email: professeur.email }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    })

    res.status(200).json({
      success: true,
      message: "Connexion réussie",
      token,
      professeur: {
        id: professeur.id_professeur,
        nom: professeur.nom,
        prenom: professeur.prenom,
        email: professeur.email,
        matiere_specialite: professeur.matiere_specialite,
      },
    })
  } catch (error) {
    console.error("Erreur lors de la connexion:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la connexion",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Récupérer le profil du professeur connecté
export const getProfile = async (req, res) => {
  try {
    const professeur = await Professeur.findByPk(req.user.id, {
      attributes: { exclude: ["mot_de_passe"] },
    })

    if (!professeur) {
      return res.status(404).json({
        success: false,
        message: "Professeur non trouvé",
      })
    }

    res.status(200).json({
      success: true,
      professeur,
    })
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du profil",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Mettre à jour le profil du professeur
export const updateProfile = async (req, res) => {
  try {
    const { nom, prenom, matiere_specialite, mot_de_passe } = req.body

    const professeur = await Professeur.findByPk(req.user.id)
    if (!professeur) {
      return res.status(404).json({
        success: false,
        message: "Professeur non trouvé",
      })
    }

    // Mettre à jour les champs
    if (nom) professeur.nom = nom
    if (prenom) professeur.prenom = prenom
    if (matiere_specialite) professeur.matiere_specialite = matiere_specialite
    if (mot_de_passe) professeur.mot_de_passe = mot_de_passe

    await professeur.save()

    res.status(200).json({
      success: true,
      message: "Profil mis à jour avec succès",
      professeur: {
        id: professeur.id_professeur,
        nom: professeur.nom,
        prenom: professeur.prenom,
        email: professeur.email,
        matiere_specialite: professeur.matiere_specialite,
      },
    })
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error)
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour du profil",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}
