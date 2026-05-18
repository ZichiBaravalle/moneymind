import { categorieModel } from "~/server/models/categorie.model";
import { entrateModel } from "~/server/models/entrate.model";
import { usciteModel } from "~/server/models/uscite.model";

export default defineEventHandler(async (event) => {
  let entrate,
    utente,
    conSoldiTotali = false;

  try {
    const body = await readBody(event);
    entrate = body.entrate;
    conSoldiTotali = body.somma;
    utente = getCookie(event, "email");
  } catch (error) {
    return createError({
      statusCode: 400,
      statusMessage: "Problemi con body",
    });
  }

  if (utente?.length > 0) {
    const categorie = await categorieModel.findAll({
      attributes: ["id", "nome", "servizioCollegato"],
      where: { entrate: entrate, utente: utente },
    });
    if (categorie.length > 0) {
      if (conSoldiTotali) {
        const categorieConSoldi = categorie.map((x) => ({
          id: x.dataValues.id,
          nome: x.dataValues.nome,
          soldi: 0,
          servizioAssociato: x.dataValues.servizioCollegato,
        }));

        if (entrate) {
          const entrate = await entrateModel.findAll({
            where: {
              utente: utente,
            },
          });
          for (const entrata of entrate) {
            categorieConSoldi.filter(
              (x) => x.nome === entrata.dataValues.categoria
            )[0].soldi += entrata.dataValues.soldi;
          }
        } else {
          const uscite = await usciteModel.findAll({
            where: {
              utente: utente,
            },
          });
          for (const uscita of uscite)
            categorieConSoldi.filter(
              (x) => x.nome === uscita.dataValues.categoria
            )[0].soldi += uscita.dataValues.soldi;
        }
        return categorieConSoldi;
      } else return categorie.map((x) => x.dataValues.nome);
    } else return [];
  } else return createError({ statusText: "Parametri mancanti", status: 400 });
});
