import { DataTypes, Model } from "sequelize";

export class categorieModel extends Model {}

categorieModel.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      unique: true,
      primaryKey: true,
      autoIncrement: true,
    },
    nome: {
      type: DataTypes.STRING(45),
      allowNull: false,
      validate: {
        len: [1, 45],
      },
    },
    servizioCollegato: {
      type: DataTypes.STRING(60),
      allowNull: true,
      validate: {
        len: [1, 60],
      },
    },
    entrate: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    utente: {
      type: DataTypes.STRING(60),
      allowNull: false,
      validate: {
        len: [5, 60],
      },
    },
  },
  { sequelize, tableName: "categorie", timestamps: true }
);
