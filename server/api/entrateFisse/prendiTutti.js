import { entrateFisseModel } from "../../models/entrateFisse.model";

export default defineEventHandler(async (event) => {
  let utente;

  try {
    utente = getCookie(event, "email");
  } catch (error) {
    return createError({
      statusCode: 400,
      statusMessage: "Problemi con body",
    });
  }

  const entrateFisse = await entrateFisseModel.findAll({
    where: {
      utente: utente,
    },
  });

  return entrateFisse;
});
