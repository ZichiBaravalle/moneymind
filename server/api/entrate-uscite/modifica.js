import moment from "moment";
import { usciteModel } from "~/server/models/uscite.model";
import { entrateModel } from "~/server/models/entrate.model";

const normalizeDateOnly = (input) => {
  if (!input) return null;
  if (typeof input === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) return null;
  const shifted = new Date(parsed.getTime() + 24 * 60 * 60 * 1000);
  return shifted.toISOString().slice(0, 10);
};

export default defineEventHandler(async (event) => {
  let nome, soldi, data, entrate, categoria, id;

  try {
    const body = await readBody(event);
    nome = body.nome;
    soldi = body.soldi;
    data = normalizeDateOnly(body.data);
    entrate = body.entrate;
    categoria = body.categoria;
    id = body.id
  } catch (error) {
    return createError({
      statusCode: 400,
      statusMessage: "Problemi con body",
    });
  }

  if (
    nome?.length > 0 &&
    soldi > 0 &&
    moment(data, "YYYY-MM-DD", true).isValid() &&
    categoria?.length > 0 &&
    id
  ) {
    try {
      const updateData = { nome, soldi, data, categoria };
      if (entrate)
        await entrateModel.update(updateData, { where: { id: id } });
      else
        await usciteModel.update(updateData, { where: { id: id } });
      return "OK";
    } catch (error) {
      console.error("Errore DB entrate-uscite/modifica:", error);
      throw createError({ statusCode: 500, statusMessage: "Errore interno del server" });
    }
  } else return createError({ statusCode: 400, statusMessage: "Parametri mancanti" });
});
