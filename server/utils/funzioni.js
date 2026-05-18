import crypto from "crypto";
import moment from "moment";
import { categorieModel } from "../models/categorie.model";
import { Op } from "sequelize";
import { entrateModel } from "../models/entrate.model";
import { usciteModel } from "../models/uscite.model";
let { KEY } = useRuntimeConfig();
KEY = crypto.scryptSync(KEY, "salt", 32);

export const generateToken = (lunghezza = 20) => {
  return crypto.randomBytes(lunghezza).toString('base64url').slice(0, lunghezza);
};

export const encrypt = (text) => {
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv("aes-256-cbc", KEY, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return iv.toString("hex") + ":" + encrypted;
};

export const decrypt = (encryptedText) => {
  if (!encryptedText) return "";

  const textParts = encryptedText.split(":");
  const iv = Buffer.from(textParts[0], "hex");
  const encryptedData = Buffer.from(textParts[1], "hex");

  const decipher = crypto.createDecipheriv("aes-256-cbc", KEY, iv);

  let decrypted = decipher.update(encryptedData);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
};

export const calcolaPeriodo = (periodoNome, periodoRipetizione, data = moment()) => {
  switch (periodoNome) {
    case "giorno":
      return moment(data).add(
        periodoRipetizione,
        periodoRipetizione == 1 ? "day" : "days"
      );

    case "settimana":
      return moment(data).add(
        periodoRipetizione,
        periodoRipetizione == 1 ? "week" : "weeks"
      );

    case "mese":
      return moment(data).add(
        periodoRipetizione,
        periodoRipetizione == 1 ? "month" : "months"
      );

    case "anno":
      return moment(data).add(
        periodoRipetizione,
        periodoRipetizione == 1 ? "year" : "years"
      );

    default:
      return createError({ statusText: "Parametri mancanti", status: 400 });
  }
};

export const calcolaPeriodoIniziale = (prossimaRipetizione, durataRipetizione) => {
  const [periodoNome, periodoRipetizione] = durataRipetizione.split(";");
  switch (periodoNome) {
    case "giorno":
      return moment(prossimaRipetizione).subtract(
        periodoRipetizione,
        periodoRipetizione == 1 ? "day" : "days"
      );

    case "settimana":
      return moment(prossimaRipetizione).subtract(
        periodoRipetizione,
        periodoRipetizione == 1 ? "week" : "weeks"
      );

    case "mese":
      return moment(prossimaRipetizione).subtract(
        periodoRipetizione,
        periodoRipetizione == 1 ? "month" : "months"
      );

    case "anno":
      return moment(prossimaRipetizione).subtract(
        periodoRipetizione,
        periodoRipetizione == 1 ? "year" : "years"
      );

    default:
      return createError({ statusText: "Parametri mancanti", status: 400 });
  }
}

export const upperCaseFirstLetter = (str = "") =>
  str[0].toUpperCase() + str.substring(1);

export const isNumber = (n) => !isNaN(n) && n !== null && n !== undefined;

export const isString = (s) =>
  typeof s === "string" && s !== null && s !== undefined && s.length > 0;

export const isBool = (b) =>
  typeof b === "boolean" && b !== null && b !== undefined;

export const exist = (v) => v !== null && v !== undefined;

export const prendiCategorie = async (servizio, utente) =>
  (
    await categorieModel.findAll({
      attributes: ["nome", "entrate", "servizioCollegato"],
      where: {
        utente: utente,
        
        [Op.not]: { servizioCollegato: null },
      },
    })
  )
    .filter((x) => x.dataValues.servizioCollegato.split(":")[0] === servizio)
    .reduce(
      (prima, x) => {
        if (x.dataValues.entrate) prima[0].push(x.dataValues);
        else prima[1].push(x.dataValues);
        return prima;
      },
      [[], []]
    );

export const prendiEntrate = async (categorie, utente, nomeServizio) => (
    await entrateModel.findAll({
      attributes: ["soldi", "categoria"],
      where: {
        utente: utente,

        [Op.or]: categorie[0].map((x) => {
          return { categoria: x.nome };
        }),
      },
    })
  ).map((entrata) => {
    const categoria = categorie[0].find(
      (cat) => cat.nome === entrata.dataValues.categoria
    );

    return {
      ...entrata.dataValues,
      [nomeServizio]: categoria?.servizioCollegato?.split(":")[1] || null
    };
  })

export const prendiUscite = async (categorie, utente, nomeServizio) => (
    await usciteModel.findAll({
      attributes: ["soldi", "categoria", "updatedAt"],
      where: {
        utente: utente,

        [Op.or]: categorie[1].map((x) => {
          return { categoria: x.nome };
        }),
      },
    })
  ).map((uscita) => {
    const categoria = categorie[1].find(
      (cat) => cat.nome === uscita.dataValues.categoria
    );

    return {
      ...uscita.dataValues,
      [nomeServizio]: categoria?.servizioCollegato?.split(":")[1] || null
    };
  })
