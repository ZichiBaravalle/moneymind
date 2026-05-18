import { categorieModel } from "~/server/models/categorie.model";

export default defineEventHandler(async (event) => {
  let nome, tipoServizioAssociato, nomeServizio, entrate, utente;

  try {
    const body = await readBody(event);
    tipoServizioAssociato = body?.servizioAssociato?.servizio; // che può essere conto o obiettivo o budget
    nomeServizio = body?.servizioAssociato?.nome; // vero nome del servizio tipo paperino
    nome = body.nome;
    entrate = body.entrate;
    utente = getCookie(event, "email");
  } catch (error) {
    return createError({
      statusCode: 400,
      statusMessage: "Problemi con body",
    });
  }

  if (nome?.length > 0 && utente?.length > 0) {
    await categorieModel.create({
      nome: nome,
      servizioCollegato: tipoServizioAssociato === undefined ? null : (tipoServizioAssociato + ":" + nomeServizio),
      entrate: entrate,
      utente: utente,
      
    });
    return "OK";
  } else return createError({ statusText: "Parametri mancanti", status: 400 });
});
