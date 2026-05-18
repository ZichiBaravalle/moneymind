import { budgetModel } from "~/server/models/budget.model";
import { calcolaPeriodo } from "~/server/utils/funzioni";

export default defineEventHandler(async (event) => {
  let nome, soldiMassimi, soldiUsati, id, periodoRipetizione, periodoNome, ripetizioneModificata, nomeContoCollegato, soldiUscita;

  try {
    const body = await readBody(event);
    nome = body.nome;
    soldiMassimi = body.soldiMassimi;
    soldiUsati = body.soldiUsati;
    id = body.id;
    ripetizioneModificata = body.ripetizioneModificata;
    nomeContoCollegato = body.contoCollegato?.nome ?? null
    if (ripetizioneModificata) {
      periodoRipetizione = body.periodoRipetizione;
      periodoNome = body.periodoNome;
    }
    soldiUscita = body.soldiUscita
  } catch (error) {
    return createError({
      statusCode: 400,
      statusMessage: "Problemi con body",
    });
  }

  if (nome?.length > 0 && soldiMassimi > 0 && soldiUsati >= 0 && id >= 0) {
    if (ripetizioneModificata) {
      const prossimaRipetizione = calcolaPeriodo(periodoNome, periodoRipetizione);
      await budgetModel.update(
        {
          nome: nome,
          soldiMassimi: soldiMassimi,
          soldiUsati: soldiUsati - soldiUscita,
          prossimaRipetizione: prossimaRipetizione,
          durataRipetizione: periodoNome + ";" + periodoRipetizione,
          contoCollegato: nomeContoCollegato
        },
        {
          where: { id: id },
        }
      );
    }
    else 
      await budgetModel.update(
        {
          nome: nome,
          soldiMassimi: soldiMassimi,
          soldiUsati: soldiUsati - soldiUscita,
          contoCollegato: nomeContoCollegato
        },
        {
          where: { id: id },
        }
      );
    return "OK";
  } else return createError({ statusText: "Parametri mancanti", status: 400 });
});
