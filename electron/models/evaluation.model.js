import { DataTypes } from "sequelize"
import { sequelize } from "../config/database.js"
import Cours from "./cours.model.js"

const Evaluation = sequelize.define(
  "Evaluation",
  {
    id_evaluation: {
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
    type: {
      type: DataTypes.ENUM("Diagnostique", "Formative"),
      allowNull: false,
    },
    date_evaluation: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    coefficient: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 1.0,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "evaluations",
    timestamps: true,
  },
)

// Définition des associations
Evaluation.belongsTo(Cours, { foreignKey: "id_cours", as: "cours" })
Cours.hasMany(Evaluation, { foreignKey: "id_cours", as: "evaluations" })

export default Evaluation
