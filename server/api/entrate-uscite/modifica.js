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

  if (
    nome?.length > 0 &&
    soldi > 0 &&
    moment(data).isValid() &&
    categoria?.length > 0 &&
    id
  ) {
    if (entrate)
      await entrateModel.update(
        {
          nome: nome,
          soldi: soldi,
          data: data,
          categoria: categoria,
        },
        {
          where: {
            id: id,
          },
        }
      );
    else
      await usciteModel.update(
        {
          nome: nome,
          soldi: soldi,
          data: data,
          categoria: categoria,
        },
        {
          where: {
            id: id,
          },
        }
      );
    return "OK";
  } else return createError({ statusText: "Parametri mancanti", status: 400 });
});
