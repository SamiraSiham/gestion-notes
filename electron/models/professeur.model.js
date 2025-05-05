import { DataTypes } from "sequelize"
import { sequelize } from "../config/database.ts"
import bcrypt from "bcrypt"

const Professeur = sequelize.define(
  "Professeur",
  {
    id_professeur: {
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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    mot_de_passe: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    matiere_specialite: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "professeurs",
    timestamps: true,
    hooks: {
      beforeCreate: async (professeur) => {
        if (professeur.mot_de_passe) {
          const salt = await bcrypt.genSalt(10)
          professeur.mot_de_passe = await bcrypt.hash(professeur.mot_de_passe, salt)
        }
      },
      beforeUpdate: async (professeur) => {
        if (professeur.changed("mot_de_passe")) {
          const salt = await bcrypt.genSalt(10)
          professeur.mot_de_passe = await bcrypt.hash(professeur.mot_de_passe, salt)
        }
      },
    },
  },
)

// Méthode pour vérifier le mot de passe
Professeur.prototype.verifyPassword = async function (password) {
  return await bcrypt.compare(password, this.mot_de_passe)
}

export default Professeur
