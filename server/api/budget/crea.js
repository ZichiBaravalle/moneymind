import { budgetModel } from "~/server/models/budget.model";
import { calcolaPeriodo } from "~/server/utils/funzioni";

export default defineEventHandler(async (event) => {
  let nome,
    soldiMassimi,
    soldiUsati,
    periodoRipetizione,
    periodoNome,
    utente,
    nomeContoCollegato,
    dataIniziale;

  try {
    const body = await readBody(event);
    utente = getCookie(event, "email");
    nome = body.nome;
    soldiMassimi = body.soldiMassimi;
    soldiUsati = body.soldiUsati;
    periodoRipetizione = body.periodoRipetizione;
    periodoNome = body.periodoNome;
    dataIniziale = body.dataIniziale;
    nomeContoCollegato = body.contoCollegato?.nome;
  } catch (error) {
    return createError({
      statusCode: 400,
      statusMessage: "Problemi con body",
    });
  }

  if (
    nome?.length > 0 &&
    soldiMassimi > 0 &&
    soldiUsati >= 0 &&
    periodoRipetizione &&
    periodoNome?.length > 0
  ) {
    try {
      const prossimaRipetizione = calcolaPeriodo(periodoNome, periodoRipetizione, dataIniziale);
      await budgetModel.create({
        nome: nome,
        soldiMassimi: soldiMassimi,
        soldiUsati: soldiUsati,
        prossimaRipetizione: prossimaRipetizione,
        durataRipetizione: periodoNome + ";" + periodoRipetizione,
        contoCollegato: nomeContoCollegato,
        utente: utente,
      });
      return "OK";
    } catch (error) {
      console.error("Errore DB budget/crea:", error);
      throw createError({ statusCode: 500, statusMessage: "Errore interno del server" });
    }
  } else return createError({ statusCode: 400, statusMessage: "Parametri mancanti" });
});
