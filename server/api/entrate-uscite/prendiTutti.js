import { entrateModel } from "~/server/models/entrate.model";
import { usciteModel } from "~/server/models/uscite.model";

export default defineEventHandler(async (event) => {
  let utente, mese, entrate;
  try {
    utente = getCookie(event, "email");
    const body = await readBody(event);
    entrate = body.entrate
    mese = body.mese
  } catch (error) {
    return createError({
      statusCode: 400,
      statusMessage: "Problemi con body",
    });
  }
  try {
    if (entrate)
      return await entrateModel.findAll({
        attributes: ["id", "nome", "soldi", "data", "categoria"],
        where: { mese: mese, utente: utente },
      });
    else
      return await usciteModel.findAll({
        attributes: ["id", "nome", "soldi", "data", "categoria"],
        where: { mese: mese, utente: utente },
      });
  } catch (error) {
    console.error("Errore DB entrate-uscite/prendiTutti:", error);
    throw createError({ statusCode: 500, statusMessage: "Errore interno del server" });
  }
});