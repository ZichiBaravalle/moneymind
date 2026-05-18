import { contiModel } from "../../models/conti.model.js";

export default defineEventHandler(async (event) => {
  let nome, soldi, id, soldiEntrate, soldiUscita;

  try {
    const body = await readBody(event);
    nome = body.nome;
    soldi = body.soldi;
    id = body.id;
    soldiEntrate = body.soldiEntrate;
    soldiUscita = body.soldiUscita;
  } catch (error) {
    return createError({
      statusCode: 400,
      statusMessage: "Problemi con body",
    });
  }

  if (nome?.length > 0 && soldi >= 0) {
    await contiModel.update(
      {
        nome: nome,
        soldi: soldi - soldiEntrate + soldiUscita,
      },
      {
        where: {id: id},
      }
    );
    return "OK";
  } else return createError({ statusText: "Parametri mancanti", status: 400 });
});
