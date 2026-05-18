import { Op } from "sequelize";
import { categorieModel } from "~/server/models/categorie.model";
import { obiettiviModel } from "~/server/models/obiettivi.model.js";

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
        entrate: true
      },
    })
  ).filter(
    (c) =>
      c.dataValues.servizioCollegato?.split(":")[0] === "obiettivo" &&
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

  await obiettiviModel.destroy({
    where: { id: id },
    force: true,
  });
  return "OK";
});
