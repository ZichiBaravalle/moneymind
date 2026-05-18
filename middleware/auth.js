// Middleware per gestire l'autenticazione client-side
export default defineNuxtRouteMiddleware(async (to, from) => {
  const token = useCookie('token')
  const email = useCookie('email')

  // Pagine pubbliche (accessibili senza autenticazione)
  const publicPages = ['/']
  const isPublicPage = publicPages.includes(to.path)

  // Se utente autenticato prova ad accedere alla pagina di login, redirect a home
  if (isPublicPage && token.value && email.value) {
    return navigateTo('/home')
  }

  // Se utente non autenticato prova ad accedere a pagina protetta, redirect a login
  if (!isPublicPage && (!token.value || !email.value)) {
    return navigateTo('/')
  }
})
