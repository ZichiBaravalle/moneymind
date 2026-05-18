import { Op } from "sequelize";
import { budgetModel } from "~/server/models/budget.model";
import { categorieModel } from "~/server/models/categorie.model";

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
        entrate: false,
      },
    })
  ).filter(
    (c) =>
      c.dataValues.servizioCollegato?.split(":")[0] === "budget" &&
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

  await budgetModel.destroy({
    where: { id: id },
    force: true,
  });
  return "OK";
});
