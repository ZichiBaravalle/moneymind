import { budgetModel } from "../models/budget.model";
import { categorieModel } from "../models/categorie.model";
import { contiModel } from "../models/conti.model";
import { entrateModel } from "../models/entrate.model";
import { obiettiviModel } from "../models/obiettivi.model";
import { usciteModel } from "../models/uscite.model";
import { utentiModel } from "../models/utenti.model";
import { entrateFisseModel } from "../models/entrateFisse.model";

export default defineEventHandler(async (event) => {
  const email = getCookie(event, "email");

  await budgetModel.destroy({
    where: {
      utente: email,
    },
    force: true,
  });

  await categorieModel.destroy({
    where: {
      utente: email,
    },
    force: true,
  });

  await contiModel.destroy({
    where: {
      utente: email,
    },
    force: true,
  });

  await entrateModel.destroy({
    where: {
      utente: email,
    },
    force: true,
  });

  await obiettiviModel.destroy({
    where: {
      utente: email,
    },
    force: true,
  });

  await usciteModel.destroy({
    where: {
      utente: email,
    },
    force: true,
  });

  await entrateFisseModel.destroy({
    where: {
      utente: email,
    },
    force: true,
  });

  await utentiModel.destroy({
    where: {
      email: email,
    },
    force: true,
  });
  return "OK";
});
