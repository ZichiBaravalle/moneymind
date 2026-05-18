import { entrateFisseModel } from "../../models/entrateFisse.model"
import { calcolaPeriodo } from "~/server/utils/funzioni";

export default defineEventHandler(async (event) => {
  let nome, soldi, periodoRipetizione, periodoNome, utente, nomeContoCollegato, dataIniziale;

  try {
    const body = await readBody(event);
    utente = getCookie(event, "email");
    nome = body.nome;
    soldi = body.soldi;
    periodoRipetizione = body.periodoRipetizione;
    periodoNome = body.periodoNome;
    dataIniziale = body.dataIniziale;
    nomeContoCollegato = body.contoCollegato?.nome
  } catch (error) {
    return createError({
      statusCode: 400,
      statusMessage: "Problemi con body",
    });
  }
  
  if (nome?.length > 0 && soldi > 0 && periodoRipetizione && periodoNome?.length > 0) {
    const prossimaRipetizione = calcolaPeriodo(periodoNome, periodoRipetizione, dataIniziale);
    await entrateFisseModel.create({
      nome: nome,
      soldi: soldi,
      prossimaRipetizione: prossimaRipetizione,
      durataRipetizione: periodoNome + ";" + periodoRipetizione,
      contoCollegato: nomeContoCollegato,
      utente: utente
    })
    return "OK"
  } else return createError({ statusText: "Parametri mancanti", status: 400 });
});
