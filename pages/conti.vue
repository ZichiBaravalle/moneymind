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
          <DataView
            :value="conti"
            :pt="
              isMobile
                ? { content: 'w-full' }
                : { content: 'w-full grid-custom' }
            "
            layout="grid">
            <template #empty>
              <h3 class="text-center">Non ci sono elementi disponibili</h3>
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
                  <span class="mb-3">Saldo complessivo: {{ item.soldi }}€</span>
                  <span>
                    Saldo effettivo disponibile:
                    {{
                      item.soldiSenzaObiettivi
                        ? item.soldiSenzaObiettivi
                        : item.soldi
                    }}€
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
let conti = ref();
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

onMounted(async () => {
  try {
    conti.value = await $fetch("/api/conti/prendiTutti", {
      method: "POST",
      body: true,
    });
    console.log(conti.value);
  } catch (error) {}
  if (isMobile)
    document.querySelector("body").style.backgroundColor =
      "var(--p-card-background)";
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
    await $fetch("/api/conti/crea", {
      method: "POST",
      body: datiConto.value,
    });
    cancellaDati();
    toast.add({
      severity: "success",
      summary: "Conferma",
      detail: "Creazione effettuata con successo",
      life: 3000,
    });
    conti.value = await $fetch("/api/conti/prendiTutti", {
      method: "POST",
      body: true,
    });
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
    await $fetch("/api/conti/modifica", {
      method: "POST",
      body: datiConto.value,
    });
    cancellaDati();
    toast.add({
      severity: "success",
      summary: "Conferma",
      detail: "Modifica effettuata con successo",
      life: 3000,
    });
    conti.value = await $fetch("/api/conti/prendiTutti", {
      method: "POST",
      body: true,
    });
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
      toast.add({
        severity: "success",
        summary: "Conferma",
        detail: "Eliminazione effettuata con successo",
        life: 3000,
      });
      await $fetch("/api/conti/elimina", {
        method: "POST",
        body: datiConto.value,
      });
      conti.value = await $fetch("/api/conti/prendiTutti", {
        method: "POST",
        body: true,
      });
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
