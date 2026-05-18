import { obiettiviModel } from "~/server/models/obiettivi.model.js";

export default defineEventHandler(async (event) => {
  let nome, soldiAttuali, obiettivoSoldi, contoCollegato, id, soldiEntrate;

  try {
    const body = await readBody(event);
    nome = body.nome;
    soldiAttuali = body.soldiAttuali;
    obiettivoSoldi = body.obiettivoSoldi;
    contoCollegato = body?.contoCollegato?.nome ?? null;
    soldiEntrate = body.soldiEntrate;
    id = body.id;
  } catch (error) {
    return createError({
      statusCode: 400,
      statusMessage: "Problemi con body",
    });
  }

  if (nome?.length > 0 && obiettivoSoldi >= 0 && soldiAttuali >= 0) {
    await obiettiviModel.update(
      {
        nome: nome,
        soldiAttuali: soldiAttuali - soldiEntrate,
        obiettivoSoldi: obiettivoSoldi,
        contoCollegato: contoCollegato,
      },
      {
        where: {id: id},
      }
    );
    return "OK";
  } else return createError({ statusText: "Parametri mancanti", status: 400 });
});
