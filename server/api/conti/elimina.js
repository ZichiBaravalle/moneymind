import { contiModel } from "../../models/conti.model.js";
import { obiettiviModel } from "../../models/obiettivi.model.js";
import { budgetModel } from "../../models/budget.model.js";
import { Op } from "sequelize";
import { categorieModel } from "../../models/categorie.model.js";
import { entrateFisseModel } from "../../models/entrateFisse.model.js";

export default defineEventHandler(async (event) => {
  let id, nome, utente;

  try {
    const body = await readBody(event);
    id = body.id;
    nome = body.nome;
    utente = getCookie(event, "email");
  } catch (error) {
    return createError({
      statusCode: 400,
      statusMessage: "Problemi con body",
    });
  }

  const categorie = (
    await categorieModel.findAll({
      attributes: ["id", "servizioCollegato"],
      where: {
        utente: utente,
      },
    })
  ).filter(
    (c) =>
      c.dataValues.servizioCollegato?.split(":")[0] === "conto" &&
      c.dataValues.servizioCollegato?.split(":")[1] === nome
  );

  await categorieModel.update(
    {
      servizioCollegato: null,
    },
    {
      where: {
        [Op.or]: categorie.map((c) => ({ id: c.dataValues.id })),
      },
    }
  );

  await obiettiviModel.update(
    {
      contoCollegato: null,
    },
    {
      where: {
        contoCollegato: nome,
        utente: utente,
      },
    }
  );

  await budgetModel.update(
    {
      contoCollegato: null,
    },
    {
      where: {
        contoCollegato: nome,
        utente: utente,
      },
    }
  );

  await entrateFisseModel.update(
    {
      contoCollegato: null,
    },
    {
      where: {
        contoCollegato: nome,
        utente: utente,
      },
    }
  );

  await contiModel.destroy({
    where: { id: id },
    force: true,
  });
  return "OK";
});
