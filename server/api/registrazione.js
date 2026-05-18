import { fn } from "sequelize";
import { categorieModel } from "../models/categorie.model.js";
import { utentiModel } from "../models/utenti.model.js";
import { encrypt, exist, generateToken } from "../utils/funzioni.js";
import { sequelize } from "../utils/db.connection.js";

export default defineEventHandler(async (event) => {
  let email, password;

  try {
    const body = await readBody(event);
    email = body.email;
    password = body.password;
  } catch (error) {
    return createError({
      statusCode: 400,
      statusMessage: "Parametri mancanti",
    });
  }

  const user = await utentiModel.findOne({
    where: {
      email: email,
    },
  });

  if (exist(user)) {
    return createError({
      statusCode: 409,
      statusMessage: "Utente già esistente",
    });
  }

  if (email && password) {
    const token = generateToken();
    const isProd = process.env.NODE_ENV === 'production';
    const t = await sequelize.transaction();

    try {
      await utentiModel.create({
        email: email,
        password: encrypt(password),
        token: token,
        ultimo_login: fn("NOW")
      }, { transaction: t });

      await categorieModel.create({
        nome: "Generale",
        utente: email,
        entrate: true,
      }, { transaction: t });

      await categorieModel.create({
        nome: "Generale",
        utente: email,
        entrate: false,
      }, { transaction: t });

      await t.commit();

      setCookie(event, "token", token, {
        httpOnly: false,
        secure: isProd,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
      });
      setCookie(event, "email", email, {
        httpOnly: false,
        secure: isProd,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
      });

      return "Registrazione riuscita";
    } catch (error) {
      await t.rollback();
      throw createError({
        statusCode: 500,
        statusMessage: "Errore durante la registrazione",
      });
    }
  } else {
    return createError({
      statusCode: 400,
      statusMessage: "Parametri mancanti",
    });
  }
});
