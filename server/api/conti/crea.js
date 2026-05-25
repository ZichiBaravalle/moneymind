import { contiModel } from "../../models/conti.model.js";

export default defineEventHandler(async (event) => {
  let nome, soldi, utente;

  try {
    const body = await readBody(event);
    utente = getCookie(event, "email");
    nome = body.nome;
    soldi = body.soldi;
  } catch (error) {
    return createError({
      statusCode: 400,
      statusMessage: "Problemi con body",
    });
  }

  if (nome?.length > 0 && soldi >= 0) {
    try {
      await contiModel.create({ nome: nome, soldi: soldi, utente: utente });
      return "OK";
    } catch (error) {
      console.error("Errore DB conti/crea:", error);
      throw createError({ statusCode: 500, statusMessage: "Errore interno del server" });
    }
  } else return createError({ statusCode: 400, statusMessage: "Parametri mancanti" });
});
