import jwt from "jsonwebtoken"
import Professeur from "../models/professeur.model.js"

export const authenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Accès non autorisé. Token manquant.",
      })
    }

    const token = authHeader.split(" ")[1]

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: "Token invalide ou expiré",
        })
      }

      // Vérifier si le professeur existe toujours
      const professeur = await Professeur.findByPk(decoded.id)
      if (!professeur) {
        return res.status(403).json({
          success: false,
          message: "Utilisateur non trouvé",
        })
      }

      // Ajouter les informations de l'utilisateur à la requête
      req.user = {
        id: decoded.id,
        email: decoded.email,
      }

      next()
    })
  } catch (error) {
    console.error("Erreur d'authentification:", error)
    res.status(500).json({
      success: false,
      message: "Erreur d'authentification",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

export const isAdmin = (req, res, next) => {
  // Cette fonction pourrait être utilisée pour vérifier si l'utilisateur est un administrateur
  // Pour l'instant, elle n'est pas implémentée car non requise dans le cahier des charges
  next()
}
