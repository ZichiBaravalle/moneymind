import { entrateFisseModel } from "../../models/entrateFisse.model";

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
    const entrateFisse = await entrateFisseModel.findAll({ where: { utente: utente } });
    return entrateFisse;
  } catch (error) {
    console.error("Errore DB entrateFisse/prendiTutti:", error);
    throw createError({ statusCode: 500, statusMessage: "Errore interno del server" });
  }
});
