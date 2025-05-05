import { DataTypes } from "sequelize"
import { sequelize } from "../config/database.js"
import Eleve from "./eleve.model.js"
import PartieCours from "./partie-cours.model.js"

const SoutienScolaire = sequelize.define(
  "SoutienScolaire",
  {
    id_soutien: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_eleve: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Eleve,
        key: "id_eleve",
      },
    },
    id_partie_cours: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: PartieCours,
        key: "id_partie_cours",
      },
    },
    justification: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    date_identification: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: "soutien_scolaire",
    timestamps: true,
  },
)

// Définition des associations
SoutienScolaire.belongsTo(Eleve, { foreignKey: "id_eleve", as: "eleve" })
SoutienScolaire.belongsTo(PartieCours, { foreignKey: "id_partie_cours", as: "partie_cours" })
Eleve.hasMany(SoutienScolaire, { foreignKey: "id_eleve", as: "soutiens" })
PartieCours.hasMany(SoutienScolaire, { foreignKey: "id_partie_cours", as: "soutiens" })

export default SoutienScolaire
