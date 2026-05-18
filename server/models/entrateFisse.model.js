import { DataTypes, Model } from "sequelize";

export class entrateFisseModel extends Model {}

entrateFisseModel.init(
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
    contoCollegato: {
      type: DataTypes.STRING(45),
      allowNull: true,
      validate: {
        len: [1, 45],
      },
    },
    prossimaRipetizione: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    durataRipetizione: {
      type: DataTypes.STRING(30),
      allowNull: false,
      validate: {
        len: [1, 30],
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
  { sequelize, tableName: "entrateFisse", timestamps: true }
);
