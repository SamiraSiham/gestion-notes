import { DataTypes } from "sequelize"
import { sequelize } from "../config/database.js"
import Evaluation from "./evaluation.model.js"
import Eleve from "./eleve.model.js"

const NoteEvaluation = sequelize.define(
  "NoteEvaluation",
  {
    id_note_eval: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_evaluation: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Evaluation,
        key: "id_evaluation",
      },
    },
    id_eleve: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Eleve,
        key: "id_eleve",
      },
    },
    note: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
        max: 20, // Système de notation sur 20
      },
    },
    commentaire: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    date_saisie: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "notes_evaluation",
    timestamps: true,
  },
)

// Définition des associations
NoteEvaluation.belongsTo(Evaluation, { foreignKey: "id_evaluation", as: "evaluation" })
NoteEvaluation.belongsTo(Eleve, { foreignKey: "id_eleve", as: "eleve" })
Evaluation.hasMany(NoteEvaluation, { foreignKey: "id_evaluation", as: "notes" })
Eleve.hasMany(NoteEvaluation, { foreignKey: "id_eleve", as: "notes_evaluations" })

export default NoteEvaluation
