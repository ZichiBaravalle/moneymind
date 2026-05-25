import { Sequelize } from "sequelize";

const config = useRuntimeConfig()

export const sequelize = new Sequelize(
  {
    dialect: 'mysql',
    host: config.HOST_DATABASE,
    port: config.PORT_DATABASE,
    username: config.USERNAME_DATABASE,
    password: config.PASSWORD_DATABASE,
    database: config.DATABASE,
    define: {
      timestamps: false,
    },
    logging: false,
  }
);
