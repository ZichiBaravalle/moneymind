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
    try {
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
            const entrateList = await entrateModel.findAll({ where: { utente: utente } });
            for (const entrata of entrateList) {
              const cat = categorieConSoldi.find((x) => x.nome === entrata.dataValues.categoria);
              if (cat) cat.soldi += entrata.dataValues.soldi;
            }
          } else {
            const usciteList = await usciteModel.findAll({ where: { utente: utente } });
            for (const uscita of usciteList) {
              const cat = categorieConSoldi.find((x) => x.nome === uscita.dataValues.categoria);
              if (cat) cat.soldi += uscita.dataValues.soldi;
            }
          }
          return categorieConSoldi;
        } else return categorie.map((x) => x.dataValues.nome);
      } else return [];
    } catch (error) {
      console.error("Errore DB categorie/prendiTutti:", error);
      throw createError({ statusCode: 500, statusMessage: "Errore interno del server" });
    }
  } else return createError({ statusCode: 400, statusMessage: "Parametri mancanti" });
});
