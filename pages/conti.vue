<template>
  <div>
    <NuxtLayout name="sidebar">
      <Card
        :style="isMobile ? 'box-shadow: none;' : ''"
        :class="isMobile ? 'h-full w-full' : 'cardPrincipale'">
        <template #title>
          <div
            class="flex lg:flex-row flex-column justify-content-between align-items-center">
            <h2 style="font-size: 28px" class="lg:text-2xl mb-3">
              Conti - {{ nomeUtente }}
            </h2>
            <Button
              @click="
                visualizzaCrea = true;
                visualizzaModifica = false;
                erroreEsisteGia = false;
                erroreModifica = false;
              "
              class="h-min">
              <i class="fa-solid fa-plus"></i>
              Aggiungi conto
            </Button>
          </div>
          <Divider />
        </template>
        <template #content>
          <!-- Loading state -->
          <div v-if="loading" class="flex flex-wrap gap-4">
            <div v-for="i in 3" :key="i" class="w-full lg:w-18rem">
              <Skeleton height="2rem" class="mb-3 w-8rem mx-auto" />
              <Skeleton height="1rem" class="mb-2" />
              <Skeleton height="1rem" class="mb-2" />
              <Skeleton height="3rem" class="mt-3" />
            </div>
          </div>

          <!-- Error state -->
          <div
            v-else-if="errore"
            class="flex flex-column align-items-center justify-content-center gap-3 p-6"
            style="min-height: 20rem">
            <i class="fa-solid fa-circle-exclamation text-5xl" style="color: var(--p-amber-500)"></i>
            <p class="text-xl text-center m-0">{{ errore.messaggio }}</p>
            <Button @click="caricaDati()" severity="secondary">
              <i class="fa-solid fa-rotate-right mr-2"></i>
              Riprova
            </Button>
          </div>

          <DataView
            v-else
            :value="conti"
            :pt="
              isMobile
                ? { content: 'w-full' }
                : { content: 'w-full grid-custom' }
            "
            layout="grid">
            <template #empty>
              <div class="flex flex-column align-items-center p-6 gap-3">
                <i class="fa-solid fa-piggy-bank text-4xl" style="color: var(--p-text-muted-color)"></i>
                <p class="text-xl m-0" style="color: var(--p-text-muted-color)">Nessun conto creato</p>
                <p class="text-sm m-0" style="color: var(--p-text-muted-color)">Aggiungi il tuo primo conto per iniziare</p>
                <Button @click="visualizzaCrea = true; visualizzaModifica = false; erroreEsisteGia = false; erroreModifica = false;">
                  <i class="fa-solid fa-plus mr-2"></i>Aggiungi conto
                </Button>
              </div>
            </template>
            <template #grid="slotProps">
              <Card
                :pt="{
                  content:
                    'flex flex-column justify-content-center align-items-center h-full',
                  body: 'w-full h-full',
                  footer: 'w-full flex justify-content-between',
                }"
                style="border: 1px #3f3f46 solid"
                class="w-full h-16rem text-center lg:mb-0 mb-4"
                v-for="item in slotProps.items">
                <template #title>
                  <span class="text-4xl">{{ item.nome }}</span>
                </template>
                <template #content>
                  <span class="mb-3">Saldo complessivo: {{ formatEuro(item.soldi) }}</span>
                  <span>
                    Saldo effettivo disponibile:
                    {{
                      formatEuro(item.soldiSenzaObiettivi ? item.soldiSenzaObiettivi : item.soldi)
                    }}
                  </span>
                </template>
                <template #footer>
                  <Button
                    severity="danger"
                    class="font-bold"
                    @click="
                      datiConto.id = item.id;
                      datiConto.nome = item.nome;
                      confermaElimina();
                    ">
                    Elimina
                  </Button>
                  <Button
                    severity="info"
                    class="font-bold"
                    @click="
                      visualizzaModifica = true;
                      visualizzaCrea = true;
                      datiConto.id = item.id;
                      datiConto.nome = item.nome;
                      nomeContoVecchio = item.nome;
                      datiConto.soldi = item.soldi;
                      datiConto.soldiEntrate = item.soldiEntrate;
                      datiConto.soldiUscita = item.soldiUscita;
                      submit = true;
                      erroreModifica = false;
                      erroreEsisteGia = false;
                    ">
                    Modifica
                  </Button>
                </template>
              </Card>
            </template>
          </DataView>
        </template>
      </Card>
    </NuxtLayout>

    <Dialog
      v-model:visible="visualizzaCrea"
      modal
      :header="
        visualizzaModifica
          ? 'Modifica conto ' + nomeContoVecchio
          : 'Crea un nuovo conto'
      "
      :style="{ width: '25rem' }"
      :show="visualizzaModifica ? (erroreModifica = false) : cancellaDati()">
      <div class="flex flex-column align-items-center mb-4">
        <span class="flex align-items-center mb-1 w-full">
          <label for="nomeConto" class="mr-3 font-semibold w-24">Nome</label>
          <InputText
            id="nomeConto"
            v-model="datiConto.nome"
            class="flex-auto w-full"
            autocomplete="off"
            @keydown="datiConto.modificato = true"
            :update:modelValue="
              datiConto.nome?.length > 45
                ? (datiConto.nome = datiConto.nome.substring(0, 45))
                : null
            " />
        </span>
        <small
          v-if="(!datiConto.nome || datiConto.nome.length === 0) && submit">
          Nome richesto
        </small>
      </div>
      <div class="flex flex-column align-items-center mb-4">
        <span class="flex align-items-center mb-1 w-full">
          <label for="saldoConto" class="mr-3 font-semibold w-24">Soldi</label>
          <InputNumber
            id="saldoConto"
            v-model="datiConto.soldi"
            mode="currency"
            locale="it-IT"
            class="w-full"
            currency="EUR"
            @keydown="datiConto.modificato = true" />
        </span>
        <small v-if="datiConto.soldi <= 0 && submit">Soldi richesto</small>
      </div>
      <div class="flex justify-content-around align-items-center">
        <Button
          type="button"
          class="font-bold"
          severity="danger"
          @click="
            visualizzaCrea = false;
            toast.add({
              severity: 'error',
              summary: 'Annulla',
              detail: visualizzaModifica
                ? 'Modifica annullata con successo'
                : 'Creazione annullata con successo',
              life: 3000,
            });
          ">
          <i class="fa-solid fa-xmark"></i>
          Cancella
        </Button>
        <small v-if="erroreModifica">Modifica richiesta</small>
        <small class="text-center" v-else-if="erroreEsisteGia">
          Un conto con questo nome esiste già
        </small>
        <Button
          type="button"
          class="font-bold"
          severity="save"
          :disabled="bottonePremuto"
          @click="
            bottonePremuto = true;
            visualizzaModifica
              ? datiConto.modificato
                ? modificaConto()
                : ((erroreModifica = true), (bottonePremuto = false))
              : creaConto();
          ">
          <i class="fa-solid fa-floppy-disk"></i>
          {{ visualizzaModifica ? "Salva" : "Crea" }}
        </Button>
      </div>
    </Dialog>

    <Toast :style="isMobile ? 'width: 90vw' : ''" />
    <ConfirmDialog></ConfirmDialog>
  </div>
</template>

<script setup>
useHead({
  title: "Money Mind | Conti",
});
const loading = ref(false);
const errore = ref(null);
let conti = ref([]);
let submit = ref(false);
let erroreModifica = ref(false);
let erroreEsisteGia = ref(false);
let visualizzaCrea = ref(false);
let visualizzaModifica = ref(false);
let datiConto = ref({
  id: 0,
  nome: "",
  soldi: 0,
  modificato: false,
});
let bottonePremuto = ref(false);
const nomeContoVecchio = ref();
const confirm = useConfirm();
const toast = useToast();
const nomeUtente = ref(
  useCookie("email")
    .value.substring(0, useCookie("email").value.indexOf("@"))
    .toUpperCase()
);
const { isMobile } = useDevice();

const caricaDati = async () => {
  loading.value = true;
  errore.value = null;
  try {
    conti.value = await $fetch("/api/conti/prendiTutti", { method: "POST", body: true });
    conti.value = conti.value ?? [];
  } catch (err) {
    if (import.meta.dev) console.error("Errore caricamento conti:", err);
    if (err?.statusCode === 401 || err?.statusCode === 403)
      errore.value = { tipo: "permessi", messaggio: "Non hai i permessi per accedere a questi dati." };
    else
      errore.value = { tipo: "server", messaggio: "Errore durante il caricamento. Riprova." };
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await caricaDati();
  if (isMobile)
    document.querySelector("body").style.backgroundColor = "var(--p-card-background)";
});

const creaConto = async () => {
  submit.value = true;
  if (conti.value.find((c) => c.nome.trim() === datiConto.value.nome.trim()))
    erroreEsisteGia.value = true;
  else erroreEsisteGia.value = false;
  if (
    datiConto.value.nome?.length > 0 &&
    datiConto.value.soldi > 0 &&
    !erroreEsisteGia.value
  ) {
    visualizzaCrea.value = false;
    bottonePremuto.value = false;
    try {
      await $fetch("/api/conti/crea", { method: "POST", body: datiConto.value });
      cancellaDati();
      toast.add({ severity: "success", summary: "Conferma", detail: "Creazione effettuata con successo", life: 3000 });
      conti.value = await $fetch("/api/conti/prendiTutti", { method: "POST", body: true });
    } catch (err) {
      if (import.meta.dev) console.error("Errore creazione conto:", err);
      toast.add({ severity: "error", summary: "Errore server", detail: "Impossibile creare il conto. Riprova.", life: 4000 });
    }
  }
  bottonePremuto.value = false;
};

const modificaConto = async () => {
  erroreModifica.value = false;
  if (
    conti.value.find(
      (c) =>
        c.nome.trim() === datiConto.value.nome.trim() &&
        c.id !== datiConto.value.id
    )
  )
    erroreEsisteGia.value = true;
  else erroreEsisteGia.value = false;
  if (
    datiConto.value.nome?.length > 0 &&
    datiConto.value.soldi >= 0 &&
    !erroreEsisteGia.value
  ) {
    visualizzaCrea.value = false;
    bottonePremuto.value = false;
    visualizzaModifica.value = false;
    try {
      await $fetch("/api/conti/modifica", { method: "POST", body: datiConto.value });
      cancellaDati();
      toast.add({ severity: "success", summary: "Conferma", detail: "Modifica effettuata con successo", life: 3000 });
      conti.value = await $fetch("/api/conti/prendiTutti", { method: "POST", body: true });
    } catch (err) {
      if (import.meta.dev) console.error("Errore modifica conto:", err);
      toast.add({ severity: "error", summary: "Errore server", detail: "Impossibile modificare il conto. Riprova.", life: 4000 });
    }
  }
  bottonePremuto.value = false;
};

const confermaElimina = () => {
  confirm.require({
    message: `Sei sicuro di voler procedere con l'eliminazione del conto?`,
    header: "Conferma",
    icon: "fa-solid fa-triangle-exclamation",
    rejectProps: {
      label: "Annulla",
      severity: "danger",
    },
    acceptProps: {
      label: "Elimina",
      severity: "warn",
    },
    accept: async () => {
      try {
        await $fetch("/api/conti/elimina", { method: "POST", body: datiConto.value });
        toast.add({ severity: "success", summary: "Conferma", detail: "Eliminazione effettuata con successo", life: 3000 });
        conti.value = await $fetch("/api/conti/prendiTutti", { method: "POST", body: true });
      } catch (err) {
        if (import.meta.dev) console.error("Errore eliminazione conto:", err);
        toast.add({ severity: "error", summary: "Errore server", detail: "Impossibile eliminare il conto. Riprova.", life: 4000 });
      }
    },
    reject: () => {
      toast.add({
        severity: "error",
        summary: "Annulla",
        detail: "Eliminazione annullata con successo",
        life: 3000,
      });
    },
  });
};

const cancellaDati = () => {
  datiConto.value.nome = "";
  datiConto.value.soldi = 0;
  datiConto.value.modificato = false;
  submit.value = false;
  erroreModifica.value = false;
};
</script>

<style lang="css"></style>
