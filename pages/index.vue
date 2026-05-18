<template>
  <div
    style="
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    "
  >
    <Card class="" :class="isMobile ? 'p-4' : 'p-5'" :pt="{ content: 'content', title: 'title' }">
      <template #title>
        <i style="font-size: 80px" class="fa-regular fa-square-dollar text-purple-500"></i>
        <h1>Money Mind</h1>
        <h3 style="margin: 0px 0px 5px 0px">
          {{ modalitaRegistrazione ? "Registrazione" : "Login" }}
        </h3>
        <Divider />
      </template>
      <template #content>
        <FloatLabel
          class="w-full"
          variant="on"
          :class="
            (email.length === 0 || !regex.test(email)) && submit
              ? 'mb-1'
              : 'mb-5'
          "
        >
          <InputText
            class="w-full"
            size="large"
            id="email"
            v-model="email"
            :update:modelValue="
              email?.length > 60 ? (email = email.substring(0, 60)) : null
            "
          />
          <label for="email">Email</label>
        </FloatLabel>
        <small
          v-if="(email.length === 0 || !regex.test(email)) && submit"
          class="mb-5"
        >
          Email richiesta o errata
        </small>
        <FloatLabel
          class="w-full"
          variant="on"
          :class="password.length === 0 && submit ? 'mb-1' : 'mb-5'"
        >
          <Password
            :feedback="modalitaRegistrazione"
            class="w-full"
            size="large"
            id="password"
            v-model="password" 
            toggleMask
            :update:modelValue="
              password?.length > 100
                ? (password = password.substring(0, 100))
                : null
            "
          />
          <label for="password">Password</label>
        </FloatLabel>
        <small v-if="password.length === 0 && submit" class="mb-5">
          Password richiesta
        </small>
        <Button
          @click="modalitaRegistrazione ? registrazione() : login()"
          class="w-full"
        >
          <i class="fa-sharp-duotone fa-solid fa-piggy-bank"></i>
          <strong>{{ modalitaRegistrazione ? "Registrazione" : "Login" }}</strong>
        </Button>
        <small v-if="erroreFetch" class="mt-2">Credenziali errate</small>
        <small v-if="erroreUtenteEsistente" class="mt-2 mb-0">
          Utente già esistente
        </small>
        <div class="w-full">
          <span
            @click="
              modalitaRegistrazione = !modalitaRegistrazione;
              erroreFetch = false;
              erroreUtenteEsistente = false;
            "
            class="mt-4 cursor-pointer text-sm float-left text-blue-500"
          >
            Effettua {{ modalitaRegistrazione ? "il login" : "la registrazione" }}
          </span>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
useHead({
  title: "Money Mind | Login",
});
let modalitaRegistrazione = ref(false);
let erroreFetch = ref(false);
let erroreUtenteEsistente = ref(false);
let submit = ref(false);
let email = ref("");
let password = ref("");
const regex = ref(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/);
const { isMobile } = useDevice()

onMounted(async () => {
  try {
    await $fetch("api/verificaToken", {
      method: "POST",
      body: {
        token: useCookie("token").value,
        email: useCookie("email").value,
      },
    });
    await navigateTo("/home");
  } catch (error) {
    document.onkeydown = (e) => {
      if (e.key === "Enter") {
        login();
      }
    };
  }
});

const login = async () => {
  submit.value = true;
  if (
    email.value?.length > 0 &&
    password.value?.length > 0 &&
    regex.value.test(email.value)
  ) {
    try {
      await $fetch("api/login", {
        method: "POST",
        body: {
          email: email.value,
          password: password.value,
        },
      });
      await navigateTo("/home");
    } catch (error) {
      erroreFetch.value = true;
    }
  }
};

const registrazione = async () => {
  submit.value = true;
  if (
    email.value?.length > 0 &&
    password.value?.length > 0 &&
    regex.value.test(email.value)
  ) {
    try {
      await $fetch("api/registrazione", {
        method: "POST",
        body: {
          email: email.value,
          password: password.value,
        },
      });
      await navigateTo("/home");
    } catch (error) {
      erroreUtenteEsistente.value = true;
    }
  }
};
</script>

<style>
body {
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}
.content {
  margin-top: 5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}
.title {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
