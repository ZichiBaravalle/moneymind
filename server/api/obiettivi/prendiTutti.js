import { Op } from "sequelize";
import { categorieModel } from "~/server/models/categorie.model";
import { entrateModel } from "~/server/models/entrate.model";
import { obiettiviModel } from "~/server/models/obiettivi.model.js";
import { prendiCategorie, prendiEntrate } from "~/server/utils/funzioni";

export default defineEventHandler(async (event) => {
  let utente;
  try {
    utente = getCookie(event, "email");
  } catch (error) {
    return createError({
      statusCode: 400,
      statusMessage: "Problemi con body",
    });
  }

  try {
    const categorie = await prendiCategorie("obiettivi", utente);
    const entrate = await prendiEntrate(categorie, utente, "obiettivi");

    const obiettivi = await obiettiviModel.findAll({
      attributes: ["id", "nome", "soldiAttuali", "obiettivoSoldi", "createdAt", "contoCollegato"],
      where: { utente: utente },
    });
    for (const obiettivo of obiettivi) {
      obiettivo.dataValues.soldiEntrate = 0;
      entrate
        .filter((x) => x.obiettivi === obiettivo.dataValues.nome)
        .forEach((x) => {
          obiettivo.dataValues.soldiAttuali += x.soldi;
          obiettivo.dataValues.soldiEntrate += x.soldi;
        });
    }
    return obiettivi;
  } catch (error) {
    console.error("Errore DB obiettivi/prendiTutti:", error);
    throw createError({ statusCode: 500, statusMessage: "Errore interno del server" });
  }
});
