import { DataTypes } from "sequelize"
import { sequelize } from "../config/database.js"
import Cours from "./cours.model.js"

const PartieCours = sequelize.define(
  "PartieCours",
  {
    id_partie_cours: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_cours: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Cours,
        key: "id_cours",
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
    ordre: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "parties_cours",
    timestamps: true,
  },
)

// Définition des associations
PartieCours.belongsTo(Cours, { foreignKey: "id_cours", as: "cours" })
Cours.hasMany(PartieCours, { foreignKey: "id_cours", as: "parties" })

export default PartieCours
