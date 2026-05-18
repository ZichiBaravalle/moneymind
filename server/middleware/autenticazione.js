export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname;
  if (
    path.startsWith("/api/login") ||
    path.startsWith("/api/registrazione") ||
    path.startsWith("/api/verificaToken") ||
    !path.startsWith("/api/")
  ) {
    return;
  }

  try {
    const token = getCookie(event, "token");
    const email = getCookie(event, "email");

    if (!token || !email) {
      throw createError({
        statusCode: 400,
        statusMessage: "Parametri mancanti",
      });
    }

    await $fetch("/api/verificaToken", {
      method: "POST",
      body: {
        token,
        email,
      },
    });

    return;
  } catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: "Utente non valido",
    });
  }
});
