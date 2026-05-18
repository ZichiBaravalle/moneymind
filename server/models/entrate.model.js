import { DataTypes, Model } from "sequelize";

export class entrateModel extends Model {}

entrateModel.init(
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
    soldi: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    mese: {
      type: DataTypes.STRING(45),
      allowNull: false,
      validate: {
        len: [1, 45],
      },
    },
    data: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    categoria: {
      type: DataTypes.STRING(45),
      allowNull: false,
      validate: {
        len: [1, 45],
      },
    },
    utente: {
      type: DataTypes.STRING(60),
      allowNull: false,
      validate: {
        len: [5, 60],
      },
    },
  },
  { sequelize, tableName: "entrate", timestamps: true }
);
