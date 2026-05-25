import { usciteModel } from "~/server/models/uscite.model";
import { entrateModel } from "~/server/models/entrate.model";

export default defineEventHandler(async (event) => {
  let id, entrate;

  try {
    const body = await readBody(event);
    id = body.id;
    entrate = body.entrate;
  } catch (error) {
    return createError({
      statusCode: 400,
      statusMessage: "Problemi con body",
    });
  }

  try {
    if (entrate)
      await entrateModel.destroy({ where: { id: id }, force: true });
    else
      await usciteModel.destroy({ where: { id: id }, force: true });
    return "OK";
  } catch (error) {
    console.error("Errore DB entrate-uscite/elimina:", error);
    throw createError({ statusCode: 500, statusMessage: "Errore interno del server" });
  }
});
