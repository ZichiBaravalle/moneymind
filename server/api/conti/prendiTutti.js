import { contiModel } from "../../models/conti.model.js";
import prendiObiettivi from "../obiettivi/prendiTutti.js";
import prendiBudgets from "../budget/prendiTutti.js";

export default defineEventHandler(async (event) => {
  let utente, conSoldiObiettivo, conti;

  try {
    utente = getCookie(event, "email");
  } catch (error) {
    return createError({
      statusCode: 400,
      statusMessage: "Problemi con body",
    });
  }

  try {
    conSoldiObiettivo = await readBody(event);
  } catch (error) {
    conSoldiObiettivo = false;
  }

  try {
    if (conSoldiObiettivo) {
      const [obiettivi, budgets, categorie] = await Promise.all([
        prendiObiettivi(event),
        prendiBudgets(event),
        prendiCategorie("conto", utente),
      ]);

      const [entrate, uscite] = await Promise.all([
        prendiEntrate(categorie, utente, "conto"),
        prendiUscite(categorie, utente, "conto"),
      ]);

      conti = await contiModel.findAll({
        attributes: ["id", "nome", "soldi", "updatedAt"],
        where: { utente: utente },
      });

      for (const conto of conti) {
        conto.dataValues.soldiUscita = 0;
        uscite
          .filter((x) => x.conto === conto.dataValues.nome)
          .forEach((uscita) => {
            conto.dataValues.soldi -= uscita.soldi;
            conto.dataValues.soldiUscita += uscita.soldi;
          });

        budgets
          .filter((x) => x.dataValues.contoCollegato === conto.dataValues.nome)
          .forEach((bu) => {
            conto.dataValues.soldi -= bu.dataValues.soldiUsati;
          });

        conto.dataValues.soldiEntrate = 0;

        entrate
          .filter((x) => x.conto === conto.dataValues.nome)
          .forEach((entrata) => {
            conto.dataValues.soldi += entrata.soldi;
            conto.dataValues.soldiEntrate += entrata.soldi;
          });

        let soldiDaTogliere = 0;

        obiettivi
          .filter((x) => x.dataValues.contoCollegato === conto.dataValues.nome)
          .forEach((ob) => {
            if (ob.dataValues.soldiAttuali >= ob.dataValues.obiettivoSoldi)
              soldiDaTogliere += ob.dataValues.obiettivoSoldi;
            else soldiDaTogliere += ob.dataValues.soldiAttuali;
            conto.dataValues.soldi += ob.dataValues.soldiAttuali;
            conto.dataValues.soldiEntrate += ob.dataValues.soldiAttuali;
          });

        conto.dataValues.soldiSenzaObiettivi =
          conto.dataValues.soldi - soldiDaTogliere;
      }
    } else {
      conti = await contiModel.findAll({
        attributes: ["id", "nome", "soldi", "updatedAt"],
        where: { utente: utente },
      });
    }
    return conti;
  } catch (error) {
    console.error("Errore DB conti/prendiTutti:", error);
    throw createError({ statusCode: 500, statusMessage: "Errore interno del server" });
  }
});
