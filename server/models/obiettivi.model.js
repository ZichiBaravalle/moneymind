import { DataTypes, Model } from "sequelize";

export class obiettiviModel extends Model {}

obiettiviModel.init(
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
    soldiAttuali: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    obiettivoSoldi: {
      type: DataTypes.DOUBLE,
      allowNull: false,
    },
    contoCollegato: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    utente: {
      type: DataTypes.STRING(60),
      allowNull: false,
      validate: {
        len: [5, 60],
      },
    },
  },
  { sequelize, tableName: "obiettivi", timestamps: true }
);
