import { DataTypes } from "sequelize"
import { sequelize } from "../config/database.js"
import Professeur from "./professeur.model.js"

const Cours = sequelize.define(
  "Cours",
  {
    id_cours: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_professeur: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Professeur,
        key: "id_professeur",
      },
    },
    titre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    niveau: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date_debut: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    date_fin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "cours",
    timestamps: true,
  },
)

// Définition des associations
Cours.belongsTo(Professeur, { foreignKey: "id_professeur", as: "professeur" })
Professeur.hasMany(Cours, { foreignKey: "id_professeur", as: "cours" })

export default Cours
