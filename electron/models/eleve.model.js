import { DataTypes } from "sequelize"
import { sequelize } from "../config/database.js"

const Eleve = sequelize.define(
  "Eleve",
  {
    id_eleve: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nom: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    prenom: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    classe: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date_naissance: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "eleves",
    timestamps: true,
  },
)

export default Eleve
