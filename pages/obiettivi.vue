<template>
  <div>
    <NuxtLayout name="sidebar">
      <Card
        :style="isMobile ? 'box-shadow: none;' : ''"
        :class="isMobile ? 'h-full w-full' : 'cardPrincipale'">
        <template #title>
          <div
            class="flex lg:flex-row flex-column justify-content-between align-items-center">
            <h2 style="font-size: 25px" class="lg:text-2xl mb-3">
              Obiettivi - {{ nomeUtente }}
            </h2>
            <Button
              @click="
                visualizzaCrea = true;
                visualizzaModifica = false;
                erroreEsisteGia = false;
              "
              class="h-min">
              <i class="fa-solid fa-plus"></i>
              Aggiungi obiettivo
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
            :value="obiettivi"
            layout="grid"
            :pt="
              isMobile
                ? { content: 'w-full' }
                : { content: 'w-full grid-custom' }
            ">
            <template #empty>
              <div class="flex flex-column align-items-center p-6 gap-3">
                <i class="fa-solid fa-bullseye text-4xl" style="color: var(--p-text-muted-color)"></i>
                <p class="text-xl m-0" style="color: var(--p-text-muted-color)">Nessun obiettivo creato</p>
                <p class="text-sm m-0" style="color: var(--p-text-muted-color)">Crea il tuo primo obiettivo di risparmio</p>
                <Button @click="visualizzaCrea = true; visualizzaModifica = false; erroreEsisteGia = false;">
                  <i class="fa-solid fa-plus mr-2"></i>Aggiungi obiettivo
                </Button>
              </div>
            </template>
            <template #grid="slotProps">
              <Card
                :pt="{
                  content:
                    'flex flex-column justify-content-center align-items-center h-full mt-2 mb-2',
                  body: 'w-full h-full',
                  footer: 'w-full flex justify-content-between',
                }"
                :style="
                  item.soldiAttuali >= item.obiettivoSoldi
                    ? 'border: 4px green solid'
                    : item.soldiAttuali >= item.obiettivoSoldi / 2
                    ? 'border: 4px orange solid'
                    : 'border: 4px red solid'
                "
                class="w-full h-18rem text-center lg:mb-0 mb-4"
                v-for="item in slotProps.items">
                <template #title>
                  <span class="text-4xl">{{ item.nome }}</span>
                </template>
                <template #content>
                  <div>
                    Obiettivo da raggiungere: {{ formatEuro(item.obiettivoSoldi) }}
                  </div>
                  <div class="mt-3">
                    Soldi attuali: {{ formatEuro(item.soldiAttuali) }}
                  </div>
                  <div class="mt-3" v-if="item.contoCollegato">
                    Conto collegato: {{ item.contoCollegato }}
                  </div>
                  <div
                    class="mt-2 font-bold"
                    :style="
                      item.soldiAttuali >= item.obiettivoSoldi
                        ? 'color: green'
                        : item.soldiAttuali >= item.obiettivoSoldi / 2
                        ? 'color: orange'
                        : 'color: red'
                    ">
                    {{
                      item.soldiAttuali >= item.obiettivoSoldi
                        ? "Obiettivo raggiunto"
                        : item.soldiAttuali >= item.obiettivoSoldi / 2
                        ? "Obiettivo quasi raggiunto"
                        : "Obiettivo da raggiungere"
                    }}
                    <i
                      v-if="item.soldiAttuali >= item.obiettivoSoldi"
                      class="fa-sharp-duotone fa-solid fa-party-horn"></i>
                    <i
                      v-else-if="item.soldiAttuali >= item.obiettivoSoldi / 2"
                      class="fas fa-hourglass-half"></i>
                    <i v-else class="fa-solid fa-hand-fist"></i>
                  </div>
                </template>
                <template #footer>
                  <Button
                    severity="danger"
                    class="font-bold"
                    @click="
                      datiObiettivi.id = item.id;
                      datiObiettivi.nome = item.nome;
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
                      datiObiettivi.id = item.id;
                      datiObiettivi.nome = item.nome;
                      nomeVecchioObiettivo = item.nome;
                      datiObiettivi.obiettivoSoldi = item.obiettivoSoldi;
                      datiObiettivi.soldiAttuali = item.soldiAttuali;
                      datiObiettivi.contoCollegato = item.contoCollegato;
                      datiObiettivi.soldiEntrate = item.soldiEntrate;
                      submit = true;
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
      :style="isMobile ? 'width: 95vw; height: 65%' : ''"
      v-model:visible="visualizzaCrea"
      modal
      :header="
        visualizzaModifica
          ? 'Modifica obiettivo ' + nomeVecchioObiettivo
          : 'Crea un nuovo obiettivo'
      "
      :show="visualizzaModifica ? setUpModificaDialog() : cancellaDati()">
      <div
        class="flex mb-4 w-full"
        :class="
          isMobile
            ? 'flex-column gap-3 aling-items-center justify-content-center'
            : 'justify-content-between'
        ">
        <div class="flex flex-column align-items-center lg:mr-4">
          <span class="flex align-items-center mb-1 w-full">
            <label
              for="nomeObiettivo"
              class="mr-3 font-semibold lg:w-24 w-7rem text-center">
              Nome
            </label>
            <InputText
              id="nomeObiettivo"
              v-model="datiObiettivi.nome"
              class="flex-auto w-full"
              autocomplete="off"
              @keydown="datiObiettivi.modificato = true"
              :update:modelValue="
                datiObiettivi.nome?.length > 45
                  ? (datiObiettivi.nome = datiObiettivi.nome.substring(0, 45))
                  : null
              " />
          </span>
          <small
            v-if="
              (!datiObiettivi.nome || datiObiettivi.nome.length === 0) && submit
            ">
            Nome richesto
          </small>
        </div>
        <div class="flex flex-column align-items-center">
          <span class="flex align-items-center mb-1 w-full">
            <label
              for="ObiettivoSoldi"
              class="mr-3 font-semibold w-24 text-center">
              Obiettivo soldi
            </label>
            <InputNumber
              id="ObiettivoSoldi"
              v-model="datiObiettivi.obiettivoSoldi"
              mode="currency"
            locale="it-IT"
              class="w-full"
              currency="EUR"
              @keydown="datiObiettivi.modificato = true" />
          </span>
          <small v-if="datiObiettivi.obiettivoSoldi <= 0 && submit">
            Obiettivo soldi richesto o negativi
          </small>
        </div>
      </div>
      <div
        class="flex mb-4 w-full"
        :class="
          isMobile
            ? 'flex-column gap-3 aling-items-center justify-content-center'
            : 'flex-column align-items-center'
        ">
        <InputGroup class="flex justify-content-end w-full mb-2">
          <SelectButton
            class="h-2rem"
            v-model="opzioneInput"
            :options="[
              { value: 'slider', icon: 'fa-solid fa-slider' },
              { value: 'number', icon: 'fa-solid fa-input-numeric' },
            ]"
            optionLabel="value">
            <template #option="slotProps">
              <i :class="slotProps.option.icon"></i>
            </template>
          </SelectButton>
        </InputGroup>
        <span class="flex align-items-center mb-1 w-full">
          <label
            for="ObiettivoSoldiAttuali"
            class="mr-3 font-semibold w-24 text-center">
            Soldi attuali
          </label>
          <Slider
            v-if="opzioneInput.value === 'slider'"
            id="ObiettivoSoldiAttuali"
            v-model="datiObiettivi.soldiAttuali"
            class="w-full"
            :max="datiObiettivi.obiettivoSoldi"
            @change="datiObiettivi.modificato = true" />
          <InputNumber
            v-if="opzioneInput.value === 'number'"
            id="ObiettivoSoldiAttuali"
            v-model="datiObiettivi.soldiAttuali"
            mode="currency"
            locale="it-IT"
            currency="EUR"
            class="w-full"
            :max="datiObiettivi.obiettivoSoldi"
            @keydown="datiObiettivi.modificato = true" />
          <span
            v-if="opzioneInput.value === 'slider'"
            style="white-space: nowrap"
            class="ml-3 text-xl mb-1">
            {{ formatEuro(datiObiettivi.soldiAttuali || 0) }}
          </span>
        </span>
        <small v-if="datiObiettivi.soldiAttuali < 0 && submit">
          Soldi attuali richiesti o negativi
        </small>
      </div>
      <div
        class="flex mb-4 w-full"
        :class="
          isMobile
            ? 'gap-3 aling-items-center justify-content-center'
            : 'align-items-center'
        ">
        <label
          for="nomeCreaCategoria"
          class="mr-3 font-semibold w-24 text-center">
          Conto da associare
        </label>
        <Select
          v-model:model-value="datiObiettivi.contoCollegato"
          :options="conti"
          optionLabel="nome"
          :modelValue="datiObiettivi.contoCollegato"
          placeholder="Seleziona il conto da associare o lascia vuoto"
          fluid
          class="lg:w-30rem w-15rem"
          showClear
          @change="datiObiettivi.modificato = true">
          <template #empty>Non ci sono conti disponibili</template>
        </Select>
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
          Un obiettivo con questo nome esiste già
        </small>
        <Button
          type="button"
          class="font-bold"
          severity="save"
          :disabled="bottonePremuto"
          @click="
            bottonePremuto = true;
            visualizzaModifica
              ? datiObiettivi.modificato
                ? modificaObiettivo()
                : ((erroreModifica = true), (bottonePremuto = false))
              : creaObiettivo();
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
  title: "Money Mind | Obiettivi",
});
const loading = ref(false);
const errore = ref(null);
let obiettivi = ref([]);
let opzioneInput = ref({
  value: "slider",
  icon: "fa-solid fa-slider",
});
let submit = ref(false);
let erroreModifica = ref(false);
let erroreEsisteGia = ref(false);
let visualizzaCrea = ref(false);
let visualizzaModifica = ref(false);
let conti = ref([]);
let datiObiettivi = ref({
  id: 0,
  nome: "",
  soldiAttuali: 0,
  obiettivoSoldi: 0,
  modificato: false,
  contoCollegato: null,
});
let bottonePremuto = ref(false);
const nomeVecchioObiettivo = ref();
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
    const [obiettiviData, contiData] = await Promise.all([
      $fetch("/api/obiettivi/prendiTutti"),
      $fetch("/api/conti/prendiTutti"),
    ]);
    obiettivi.value = obiettiviData ?? [];
    conti.value = contiData ?? [];
  } catch (err) {
    if (import.meta.dev) console.error("Errore caricamento obiettivi:", err);
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

const creaObiettivo = async () => {
  submit.value = true;
  if (obiettivi.value.find((b) => b.nome.trim() === datiObiettivi.value.nome.trim()))
    erroreEsisteGia.value = true;
  else erroreEsisteGia.value = false;
  if (
    datiObiettivi.value.nome?.length > 0 &&
    datiObiettivi.value.obiettivoSoldi > 0 &&
    datiObiettivi.value.soldiAttuali >= 0 &&
    !erroreEsisteGia.value
  ) {
    visualizzaCrea.value = false;
    bottonePremuto.value = false;
    try {
      await $fetch("/api/obiettivi/crea", { method: "POST", body: datiObiettivi.value });
      cancellaDati();
      toast.add({ severity: "success", summary: "Conferma", detail: "Creazione effettuata con successo", life: 3000 });
      obiettivi.value = await $fetch("/api/obiettivi/prendiTutti");
    } catch (err) {
      if (import.meta.dev) console.error("Errore creazione obiettivo:", err);
      toast.add({ severity: "error", summary: "Errore server", detail: "Impossibile creare l'obiettivo. Riprova.", life: 4000 });
    }
  }
  bottonePremuto.value = false;
};

const modificaObiettivo = async () => {
  erroreModifica.value = false;
  if (
    obiettivi.value.find(
      (b) =>
        b.nome.trim() === datiObiettivi.value.nome.trim() && b.id !== datiObiettivi.value.id
    )
  )
    erroreEsisteGia.value = true;
  else erroreEsisteGia.value = false;
  if (
    datiObiettivi.value.nome?.length > 0 &&
    datiObiettivi.value.soldiAttuali >= 0 &&
    datiObiettivi.value.obiettivoSoldi > 0 &&
    !erroreEsisteGia.value
  ) {
    visualizzaCrea.value = false;
    bottonePremuto.value = false;
    visualizzaModifica.value = false;
    try {
      await $fetch("/api/obiettivi/modifica", { method: "POST", body: datiObiettivi.value });
      cancellaDati();
      toast.add({ severity: "success", summary: "Conferma", detail: "Modifica effettuata con successo", life: 3000 });
      obiettivi.value = await $fetch("/api/obiettivi/prendiTutti");
    } catch (err) {
      if (import.meta.dev) console.error("Errore modifica obiettivo:", err);
      toast.add({ severity: "error", summary: "Errore server", detail: "Impossibile modificare l'obiettivo. Riprova.", life: 4000 });
    }
  }
  bottonePremuto.value = false;
};

const confermaElimina = () => {
  confirm.require({
    message: `Sei sicuro di voler procedere con l'eliminazione dell'obiettivo?`,
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
        await $fetch("/api/obiettivi/elimina", { method: "POST", body: datiObiettivi.value });
        toast.add({ severity: "success", summary: "Conferma", detail: "Eliminazione effettuata con successo", life: 3000 });
        obiettivi.value = await $fetch("/api/obiettivi/prendiTutti");
      } catch (err) {
        if (import.meta.dev) console.error("Errore eliminazione obiettivo:", err);
        toast.add({ severity: "error", summary: "Errore server", detail: "Impossibile eliminare l'obiettivo. Riprova.", life: 4000 });
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

const setUpModificaDialog = () => {
  if (!datiObiettivi.value.modificato) {
    erroreModifica.value = false;
    setTimeout(() => {
      datiObiettivi.value.contoCollegato = {
        ...conti.value.find(
          (c) => c.nome === datiObiettivi.value.contoCollegato
        ),
      };
    }, 1);
  }
};

const cancellaDati = () => {
  datiObiettivi.value.nome = "";
  datiObiettivi.value.obiettivoSoldi = 0;
  datiObiettivi.value.soldiAttuali = 0;
  datiObiettivi.value.modificato = false;
  datiObiettivi.value.contoCollegato = null;
  submit.value = false;
  erroreModifica.value = false;
};
</script>

<style></style>
