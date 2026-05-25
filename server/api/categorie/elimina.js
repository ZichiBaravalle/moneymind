import { Op } from "sequelize";
import { categorieModel } from "~/server/models/categorie.model";
import { entrateModel } from "~/server/models/entrate.model";

export default defineEventHandler(async (event) => {
  let entrate = null,
    categorie,
    utente;
  try {
    const body = await readBody(event);
    entrate = body.entrate;
    categorie = body.categorie;
    utente = getCookie(event, "email");
  } catch (error) {
    return createError({
      statusCode: 400,
      statusMessage: "Problemi con body",
    });
  }

  if (entrate !== null && categorie?.length > 0) {
    try {
      for (const categoria of categorie) {
        if (exist(categoria.nomeNuovo)) {
          await entrateModel.update(
            { categoria: categoria.nomeNuovo },
            { where: { categoria: categoria.nome, utente: utente } }
          );
        } else {
          await entrateModel.destroy({
            where: { categoria: categoria.nome, utente: utente },
            force: true,
          });
        }
      }

      await categorieModel.destroy({
        where: {
          [Op.or]: categorie.map((x) => ({ nome: x.nome })),
          utente: utente,
        },
        force: true,
      });
      return "OK";
    } catch (error) {
      console.error("Errore DB categorie/elimina:", error);
      throw createError({ statusCode: 500, statusMessage: "Errore interno del server" });
    }
  } else return createError({ statusCode: 400, statusMessage: "Problemi con body" });
});
