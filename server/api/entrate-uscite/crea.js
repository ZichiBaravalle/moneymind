import moment from "moment";
import { usciteModel } from "~/server/models/uscite.model";
import { entrateModel } from "~/server/models/entrate.model";

const getLastSundayUtc = (year, monthIndex) => {
  const lastDay = new Date(Date.UTC(year, monthIndex + 1, 0));
  const dayOfWeek = lastDay.getUTCDay();
  lastDay.setUTCDate(lastDay.getUTCDate() - dayOfWeek);
  return lastDay;
};

const getRomeOffsetMinutes = (utcDate) => {
  const year = utcDate.getUTCFullYear();
  const dstStart = new Date(Date.UTC(year, 2, getLastSundayUtc(year, 2).getUTCDate(), 1, 0, 0));
  const dstEnd = new Date(Date.UTC(year, 9, getLastSundayUtc(year, 9).getUTCDate(), 1, 0, 0));
  const isDst = utcDate >= dstStart && utcDate < dstEnd;
  return isDst ? 120 : 60;
};

// Normalize to a date-only string using Europe/Rome rules, even when Intl TZ data is missing.
const normalizeDateOnly = (input) => {
  if (!input) return null;
  if (typeof input === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) return null;
  const offsetMinutes = getRomeOffsetMinutes(parsed);
  const shifted = new Date(parsed.getTime() + offsetMinutes * 60 * 1000);
  return shifted.toISOString().slice(0, 10);
};

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
    data = normalizeDateOnly(body.data);
    mese = data ? mesi[moment(data, "YYYY-MM-DD", true).month()] : null;
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
    moment(data, "YYYY-MM-DD", true).isValid() &&
    mese?.length > 0 &&
    categoria?.length > 0 &&
    utente?.length > 0
  ) {
    try {
      if (entrate) {
        await entrateModel.create({ nome, soldi, mese, data, categoria, utente });
      } else {
        await usciteModel.create({ nome, soldi, mese, data, categoria, utente });
      }
      return "OK";
    } catch (error) {
      console.error("Errore DB entrate-uscite/crea:", error);
      throw createError({ statusCode: 500, statusMessage: "Errore interno del server" });
    }
  } else return createError({ statusCode: 400, statusMessage: "Parametri mancanti" });
});
