import moment from "moment";
import { usciteModel } from "~/server/models/uscite.model";
import { entrateModel } from "~/server/models/entrate.model";

export default defineEventHandler(async (event) => {
  let nome, soldi, data, mese, entrate, categoria, utente;
  const mesi = [
    "gennaio",
    "febbraio",
    "marzo",
    "aprile",
    "maggio",
    "giugno",
    "luglio",
    "agosto",
    "settembre",
    "ottobre",
    "novembre",
    "dicembre",
  ];

  try {
    const body = await readBody(event);
    nome = body.nome;
    soldi = body.soldi;
    data = body.data;
    mese = mesi[moment(data).month()]
    entrate = body.entrate;
    categoria = body.categoria;
    utente = getCookie(event, "email");
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
    mese?.length > 0 &&
    categoria?.length > 0 &&
    utente?.length > 0
  ) {
    if (entrate) {
      await entrateModel.create({
        nome: nome,
        soldi: soldi,
        mese: mese,
        data: data,
        categoria: categoria,
        utente: utente,
        
      });
    } else {
      await usciteModel.create({
        nome: nome,
        soldi: soldi,
        mese: mese,
        data: data,
        categoria: categoria,
        utente: utente,
        
      });
    }
    return "OK";
  } else return createError({ statusText: "Parametri mancanti", status: 400 });
});
