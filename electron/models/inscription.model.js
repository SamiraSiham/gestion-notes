import { DataTypes } from "sequelize"
import { sequelize } from "../config/database.js"
import Eleve from "./eleve.model.js"
import Cours from "./cours.model.js"

const Inscription = sequelize.define(
  "Inscription",
  {
    id_inscription: {
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
    id_cours: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Cours,
        key: "id_cours",
      },
    },
    date_inscription: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    statut: {
      type: DataTypes.ENUM("actif", "inactif"),
      defaultValue: "actif",
    },
  },
  {
    tableName: "inscriptions",
    timestamps: true,
  },
)

// Définition des associations many-to-many
Eleve.belongsToMany(Cours, {
  through: Inscription,
  foreignKey: "id_eleve",
  otherKey: "id_cours",
  as: "cours",
})

Cours.belongsToMany(Eleve, {
  through: Inscription,
  foreignKey: "id_cours",
  otherKey: "id_eleve",
  as: "eleves",
})

export default Inscription
