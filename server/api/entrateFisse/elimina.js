import { entrateFisseModel } from "../../models/entrateFisse.model";

export default defineEventHandler(async (event) => {
  let id;

  try {
    const body = await readBody(event);
    id = body.id;
  } catch (error) {
    return createError({
      statusCode: 400,
      statusMessage: "Problemi con body",
    });
  }

  await entrateFisseModel.destroy({
    where: { id: id },
    force: true,
  });
  return "OK";
});
