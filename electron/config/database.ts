import { Sequelize } from "sequelize"
import dotenv from "dotenv"
import mysql2 from "mysql2"

dotenv.config()

// Configuration de la connexion à la base de données
export const sequelize = new Sequelize(process.env.DB_NAME || "", process.env.DB_USER || "", process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: "mysql", // ou 'postgres', 'mariadb', etc.
  dialectModule: mysql2,
  port: 3306,
  logging: process.env.NODE_ENV === "development" ? console.log : false,
})

// Test de la connexion
export const testConnection = async () => {
  try {
    await sequelize.authenticate()
    console.log("Connexion à la base de données établie avec succès.")
    return true
  } catch (error) {
    console.error("Impossible de se connecter à la base de données:", error)
    return false
  }
}
