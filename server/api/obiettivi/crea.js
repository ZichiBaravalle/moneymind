import { obiettiviModel } from "~/server/models/obiettivi.model.js";

export default defineEventHandler(async (event) => {
  let nome, obiettivoSoldi, soldiAttuali, utente, nomeContoCollegato;

  try {
    const body = await readBody(event);
    utente = getCookie(event, "email");
    nome = body.nome;
    obiettivoSoldi = body.obiettivoSoldi;
    soldiAttuali = body.soldiAttuali;
    nomeContoCollegato = body.contoCollegato?.nome
  } catch (error) {
    return createError({
      statusCode: 400,
      statusMessage: "Problemi con body",
    });
  }

  if (nome?.length > 0 && obiettivoSoldi >= 0 && soldiAttuali >= 0) {
    try {
      await obiettiviModel.create({
        nome: nome,
        obiettivoSoldi: obiettivoSoldi,
        soldiAttuali: soldiAttuali,
        utente: utente,
        contoCollegato: nomeContoCollegato,
      });
      return "OK";
    } catch (error) {
      console.error("Errore DB obiettivi/crea:", error);
      throw createError({ statusCode: 500, statusMessage: "Errore interno del server" });
    }
  } else return createError({ statusCode: 400, statusMessage: "Parametri mancanti" });
});
