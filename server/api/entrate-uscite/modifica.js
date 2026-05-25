import moment from "moment";
import { usciteModel } from "~/server/models/uscite.model";
import { entrateModel } from "~/server/models/entrate.model";

export default defineEventHandler(async (event) => {
  let nome, soldi, data, entrate, categoria, id;

  try {
    const body = await readBody(event);
    nome = body.nome;
    soldi = body.soldi;
    data = body.data;
    entrate = body.entrate;
    categoria = body.categoria;
    id = body.id
  } catch (error) {
    return createError({
      statusCode: 400,
      statusMessage: "Problemi con body",
    });
  }

  if (nome?.length > 0 && soldi > 0 && moment(data).isValid() && categoria?.length > 0 && id) {
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
