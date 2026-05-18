import { entrateModel } from "~/server/models/entrate.model";
import { usciteModel } from "~/server/models/uscite.model";
import { upperCaseFirstLetter } from "~/server/utils/funzioni";

export default defineEventHandler(async (event) => {
  const nomiMesi = [
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
  const soldiMesi = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  let utente = "",
    entrate ;
  try {
    utente = getCookie(event, "email");
    entrate = (await readBody(event)).entrate
  } catch (error) {
    return createError({
      statusCode: 400,
      statusMessage: "Problemi con body",
    });
  }
  
  if (utente?.length > 0) {
    const dati = {};
    if (entrate) {
      const entrateMesi = await entrateModel.findAll({
        attributes: ["nome", "soldi", "mese"],
        where: {
          utente: utente,
          
        },
      });
      for (const mese of entrateMesi) {
        soldiMesi[nomiMesi.indexOf(mese.dataValues.mese)] +=
          mese.dataValues.soldi;
      }
    } else {
      const usciteMesi = await usciteModel.findAll({
        attributes: ["nome", "soldi", "mese"],
        where: {
          utente: utente,
          
        },
      });
      for (const mese of usciteMesi) {
        soldiMesi[nomiMesi.indexOf(mese.dataValues.mese)] +=
          mese.dataValues.soldi;
      }
    }
    for (const i in nomiMesi) {
      nomiMesi[i] = upperCaseFirstLetter(nomiMesi[i]);
    }
    dati["labels"] = nomiMesi;
    dati["datasets"] = [
      {
        data: soldiMesi,
        backgroundColor: [
          "rgba(249, 115, 22, 0.2)", // Orange
          "rgba(6, 182, 212, 0.2)", // Cyan
          "rgba(107, 114, 128, 0.2)", // Gray
          "rgba(139, 92, 246, 0.2)", // Purple
          "rgba(34, 197, 94, 0.2)", // Green
          "rgba(236, 72, 153, 0.2)", // Pink
          "rgba(234, 179, 8, 0.2)", // Yellow
          "rgba(59, 130, 246, 0.2)", // Blue
          "rgba(225, 29, 72, 0.2)", // Red
          "rgba(168, 85, 247, 0.2)", // Violet
          "rgba(20, 184, 166, 0.2)", // Teal
          "rgba(245, 158, 11, 0.2)", // Amber
        ],
        borderColor: [
          "rgb(249, 115, 22)", // Orange
          "rgb(6, 182, 212)", // Cyan
          "rgb(107, 114, 128)", // Gray
          "rgb(139, 92, 246)", // Purple
          "rgb(34, 197, 94)", // Green
          "rgb(236, 72, 153)", // Pink
          "rgb(234, 179, 8)", // Yellow
          "rgb(59, 130, 246)", // Blue
          "rgb(225, 29, 72)", // Red
          "rgb(168, 85, 247)", // Violet
          "rgb(20, 184, 166)", // Teal
          "rgb(245, 158, 11)", // Amber
        ],
        borderWidth: 2,
      },
    ];
    const opzioni = {
      plugins: {
        title: {
          display: false,
        },
        legend: {
          display: false,
        },
      },
      interaction: {
        mode: "index",
        intersect: true,
      },
      scales: {
        x: {
          ticks: {
            color: "rgb(91, 91, 91)",
          },
          grid: {
            color: "rgb(91, 91, 91, 0.4)",
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: "rgb(91, 91, 91)",
          },
          grid: {
            color: "rgb(91, 91, 91, 0.4)",
          },
        },
      },
    };

    return [dati, opzioni];
  } else {
    return createError({
      statusCode: 400,
      statusMessage: "Problemi con body",
    });
  }
});
