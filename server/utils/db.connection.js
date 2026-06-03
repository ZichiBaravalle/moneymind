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
    timezone: '+02:00',
    dialectOptions: {
      timezone: '+02:00',
    },
    define: {
      timestamps: false,
    },
    logging: false,
  }
);
