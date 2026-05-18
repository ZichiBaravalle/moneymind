export default defineNuxtRouteMiddleware(async (to, from) => {
  if (to.fullPath === "/") {
    return;
  }

  try {
    const token = useCookie("token");
    const email = useCookie("email");

    if (!token.value || !email.value) {
      return navigateTo("/", { replace: true });
    }

    await $fetch("/api/verificaToken", {
      method: "POST",
      body: {
        token: token.value,
        email: email.value,
      },
    });

    return;
  } catch (error) {
    return navigateTo("/");
  }
});
