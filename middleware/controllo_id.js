export default defineNuxtRouteMiddleware((to, from) => {
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
  if (mesi.includes(to.params.id)) return;
  else {
    return abortNavigation({
      statusCode: "404",
      statusMessage: "Pagina non trovata",
    });
  }
});
