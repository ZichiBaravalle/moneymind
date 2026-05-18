import { calcolaPeriodo } from "~/server/utils/funzioni";
import { entrateFisseModel } from "../../models/entrateFisse.model";

export default defineEventHandler(async (event) => {
  let nome, soldi, id, periodoRipetizione, periodoNome, ripetizioneModificata, nomeContoCollegato;

  try {
    const body = await readBody(event);
    nome = body.nome;
    soldi = body.soldi;
    id = body.id;
    ripetizioneModificata = body.ripetizioneModificata;
    nomeContoCollegato = body.contoCollegato?.nome ?? null
    if (ripetizioneModificata) {
      periodoRipetizione = body.periodoRipetizione;
      periodoNome = body.periodoNome;
    }
  } catch (error) {
    return createError({
      statusCode: 400,
      statusMessage: "Problemi con body",
    });
  }

  if (nome?.length > 0 && soldi > 0 && id >= 0) {
    if (ripetizioneModificata) {
      const prossimaRipetizione = calcolaPeriodo(periodoNome, periodoRipetizione);
      await entrateFisseModel.update(
        {
          nome: nome,
          soldi: soldi,
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
      await entrateFisseModel.update(
        {
          nome: nome,
          soldi: soldi,
          contoCollegato: nomeContoCollegato
        },
        {
          where: { id: id },
        }
      );
    return "OK";
  } else return createError({ statusText: "Parametri mancanti", status: 400 });
});
