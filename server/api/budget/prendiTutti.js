import moment from "moment";
import { budgetModel } from "~/server/models/budget.model";
import {
  calcolaPeriodoIniziale,
  prendiCategorie,
  prendiUscite,
} from "~/server/utils/funzioni";

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
    const categorie = await prendiCategorie("budget", utente);
    const uscite = await prendiUscite(categorie, utente, "budget");

    const budgets = await budgetModel.findAll({
      attributes: [
        "id",
        "nome",
        "soldiMassimi",
        "soldiUsati",
        "prossimaRipetizione",
        "contoCollegato",
        "durataRipetizione",
      ],
      where: { utente: utente },
    });

    for (const budget of budgets) {
      budget.dataValues.soldiUscita = 0;
      uscite
        .filter(
          (x) =>
            x.budget === budget.dataValues.nome &&
            moment(x.updatedAt).isSameOrAfter(
              calcolaPeriodoIniziale(
                budget.dataValues.prossimaRipetizione,
                budget.dataValues.durataRipetizione
              )
            )
        )
        .forEach((x) => {
          budget.dataValues.soldiUsati += x.soldi;
          budget.dataValues.soldiUscita += x.soldi;
        });
    }
    return budgets;
  } catch (error) {
    console.error("Errore DB budget/prendiTutti:", error);
    throw createError({ statusCode: 500, statusMessage: "Errore interno del server" });
  }
});
