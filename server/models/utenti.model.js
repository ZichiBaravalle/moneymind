import { DataTypes, Model } from "sequelize";

export class utentiModel extends Model {}

utentiModel.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      unique: true,
      unsigned: true,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING(60),
      allowNull: false,
      unique: true,
      validate: {
        len: [5, 60],
      },
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    ultimo_login: {
      type: DataTypes.DATE,
    },
    token: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
  },
  { sequelize, tableName: "utenti", timestamps: true }
);
