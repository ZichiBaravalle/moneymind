import fs from "fs";
import path from "path";
import { QueryTypes } from "sequelize";

export default defineEventHandler(async (event) => {
  let id,
    nome,
    tipoServizioAssociato,
    utente,
    nomeServizioAssociato;
  try {
    utente = getCookie(event, "email");
    const body = await readBody(event);
    id = body.id;
    nome = body.nome;
    tipoServizioAssociato = body.servizioAssociato?.servizio;
    nomeServizioAssociato = body.servizioAssociato?.nome;
  } catch (error) {
    return createError({
      statusCode: 400,
      statusMessage: "Problemi con body",
    });
  }

  if (isString(nome) && id && isNumber(id)) {
    try {
      const querySQL = fs.readFileSync(
        path.join("server", "query", "update_categorie_entrate.sql"),
        "utf8"
      );
      await sequelize.transaction(async (t) => {
        await sequelize.query(querySQL, {
          replacements: {
            nomeNuovo: nome,
            id: id,
            servizioCollegato:
              tipoServizioAssociato === undefined
                ? null
                : tipoServizioAssociato + ":" + nomeServizioAssociato,
          },
          type: QueryTypes.UPDATE,
          transaction: t,
        });
      });

      return "OK";
    } catch (error) {
      console.error("Errore nell'aggiornamento: ", error);
      return createError({
        statusCode: 400,
        statusMessage: "Problemi con sequelize",
      });
    }
  } else
    return createError({
      statusCode: 400,
      statusMessage: "Problemi con body",
    });
});
