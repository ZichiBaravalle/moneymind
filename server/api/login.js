import { fn } from "sequelize";
import { utentiModel } from "../models/utenti.model.js";
import { decrypt, generateToken } from "../utils/funzioni.js";

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

  if (email?.length > 0 && password?.length > 0) {
    const user = await utentiModel.findOne({
      where: { email: email },
    });

    if (user && decrypt(user.dataValues.password) === password) {
      const token = generateToken();
      const isProd = process.env.NODE_ENV === 'production';

      await utentiModel.update(
        { token: token, ultimo_login: fn("NOW") },
        {
          where: {
            email: user.dataValues.email,
          },
        }
      );

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

      return "Login riuscito";
    } else
      return createError({ statusCode: 400, statusMessage: "Credenziali errate" });
  } else return createError({ statusCode: 400, statusMessage: "Parametri mancanti" });
});
