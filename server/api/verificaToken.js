import { fn } from "sequelize";
import { utentiModel } from "../models/utenti.model.js";

export default defineEventHandler(async (event) => {
  let token, email;

  try {
    const body = await readBody(event);
    token = body.token;
    email = body.email;
  } catch (error) {
    return createError({
      statusCode: 400,
      statusMessage: "Parametri mancanti",
    });
  }

  if (token && token.length > 0 && email && email.length > 0) {
    const user = await utentiModel.findOne({
      where: { token: token, email: email },
    });
    if (user) {
      await utentiModel.update(
        {
          ultimo_login: fn("NOW"),
        },
        {
          where: {
            id: user.dataValues.id,
          },
        }
      );
      return "Token valido";
    } else
      return createError({
        statusCode: 401,
        statusMessage: "Utente non trovato",
      });
  } else
    return createError({
      statusCode: 400,
      statusMessage: "Parametri mancanti",
    });
});
