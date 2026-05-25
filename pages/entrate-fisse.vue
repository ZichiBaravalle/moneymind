<template>
  <div>
    <NuxtLayout name="sidebar">
      <Card
        :style="isMobile ? 'box-shadow: none;' : ''"
        :class="isMobile ? 'h-full w-full' : 'cardPrincipale'">
        <template #title>
          <div
            class="flex lg:flex-row flex-column justify-content-between align-items-center">
            <h2 style="font-size: 20px" class="lg:text-2xl mb-3">
              Entrate fisse - {{ nomeUtente }}
            </h2>
            <Button
              @click="
                visualizzaCrea = true;
                visualizzaModifica = false;
                erroreEsisteGia = false;
              "
              class="h-min">
              <i class="fa-solid fa-plus"></i>
              Aggiungi entrata fissa
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
            :value="entrateFisse"
            layout="grid"
            :pt="
              isMobile
                ? { content: 'w-full' }
                : { content: 'w-full grid-custom' }
            ">
            <template #empty>
              <div class="flex flex-column align-items-center p-6 gap-3">
                <i class="fa-solid fa-calendar-check text-4xl" style="color: var(--p-text-muted-color)"></i>
                <p class="text-xl m-0" style="color: var(--p-text-muted-color)">Nessuna entrata fissa</p>
                <p class="text-sm m-0" style="color: var(--p-text-muted-color)">Aggiungi una entrata ricorrente per tenerla tracciata</p>
                <Button @click="visualizzaCrea = true; visualizzaModifica = false; erroreEsisteGia = false;">
                  <i class="fa-solid fa-plus mr-2"></i>Aggiungi entrata fissa
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
                style="border: 1px #3f3f46 solid"
                class="w-full h-18rem text-center lg:mb-0 mb-4"
                v-for="item in slotProps.items">
                <template #title>
                  <span class="text-4xl">{{ item.nome }}</span>
                </template>
                <template #content>
                  <div class="mb-3">Soldi: {{ formatEuro(item.soldi) }}</div>
                  <div>
                    Prossimo rinnovo:
                    {{ moment(item.prossimaRipetizione).format("DD/MM/YYYY") }}
                  </div>
                  <div class="mt-3" v-if="item.contoCollegato">
                    Conto collegato: {{ item.contoCollegato }}
                  </div>
                </template>
                <template #footer>
                  <Button
                    severity="danger"
                    class="font-bold"
                    @click="
                      datiEntrataFissa.id = item.id;
                      datiEntrataFissa.nome = item.nome;
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
                      datiEntrataFissa.id = item.id;
                      datiEntrataFissa.nome = item.nome;
                      nomeVecchioEntrataFissa = item.nome;
                      nomeVecchioEntrataFissa;
                      datiEntrataFissa.soldi = item.soldi;
                      datiEntrataFissa.contoCollegato = item.contoCollegato;
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
          ? 'Modifica entrata fissa ' + nomeVecchioEntrataFissa
          : 'Crea una nuova entrata fissa'
      "
      :show="visualizzaModifica ? setUpModificaDialog() : cancellaDati()">
      <div
        class="flex mb-4 w-full"
        :class="
          isMobile
            ? 'flex-column gap-3 aling-items-center justify-content-center'
            : 'justify-content-between'
        ">
        <div class="w-full flex flex-column align-items-center mr-4">
          <span class="flex align-items-center mb-1 w-full">
            <label
              for="nomeBudget"
              class="mr-3 font-semibold lg:w-24 w-7rem text-center">
              Nome
            </label>
            <InputText
              id="nomeBudget"
              v-model="datiEntrataFissa.nome"
              class="flex-auto w-full"
              autocomplete="off"
              @keydown="datiEntrataFissa.modificato = true"
              :update:modelValue="
                datiEntrataFissa.nome?.length > 45
                  ? (datiEntrataFissa.nome = datiEntrataFissa.nome.substring(
                      0,
                      45
                    ))
                  : null
              " />
          </span>
          <small
            v-if="
              (!datiEntrataFissa.nome || datiEntrataFissa.nome.length === 0) &&
              submit
            ">
            Nome richesto
          </small>
        </div>
        <div class="flex flex-column align-items-center">
          <span class="flex align-items-center mb-1 w-full">
            <label
              for="budgetSoldiMassimi"
              class="mr-3 font-semibold lg:w-24 w-7rem text-center">
              Soldi
            </label>
            <InputNumber
              id="budgetSoldiMassimi"
              v-model="datiEntrataFissa.soldi"
              mode="currency"
            locale="it-IT"
              class="w-full"
              currency="EUR"
              @keydown="datiEntrataFissa.modificato = true" />
          </span>
          <small v-if="datiEntrataFissa.soldi <= 0 && submit">
            soldi nulli o negativi
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
        <span class="flex align-items-center mb-1 w-full">
          <label
            for="budgetRipetizione"
            class="mr-3 font-semibold w-12rem text-center">
            Periodo di rinnovo
          </label>
          <InputGroup>
            <InputNumber
              showButtons
              :disabled="
                !datiEntrataFissa.ripetizioneModificata && visualizzaModifica
              "
              v-on:update:modelValue="datiEntrataFissa.modificato = true"
              :step="1"
              class="flex-auto lg:w-full w-5rem"
              id="budgetRipetizione"
              v-model="datiEntrataFissa.periodoRipetizione"
              @keyDown="datiEntrataFissa.modificato = true"
              fluid
              :min="0"
              :max="31" />
            <Select
              v-model="datiEntrataFissa.periodoNome"
              :options="periodo"
              :disabled="
                !datiEntrataFissa.ripetizioneModificata && visualizzaModifica
              "
              v-on:update:model-value="datiEntrataFissa.modificato = true"
              @change="datiEntrataFissa.modificato = true"
              optionLabel="name"
              optionValue="value"
              placeholder="Seleziona il periodo"
              class="lg:w-full"
              :class="isMobile && visualizzaModifica ? 'w-8rem' : 'w-10rem'" />
          </InputGroup>
          <span
            v-if="visualizzaModifica"
            class="flex flex-column align-items-end">
            <Badge
              severity="info"
              style="
                max-width: 12px;
                height: 12px;
                min-width: 12px;
                cursor: pointer;
              "
              value="i"
              @click="apriInfoModRipetizione($event)"></Badge>
            <Checkbox
              class="ml-3 mr-2"
              v-model="datiEntrataFissa.ripetizioneModificata"
              :binary="true" />
          </span>
        </span>
        <small
          v-if="
            (datiEntrataFissa.periodoRipetizione <= 0 ||
              !datiEntrataFissa.periodoNome) &&
            submit &&
            (datiEntrataFissa.ripetizioneModificata || !visualizzaModifica)
          ">
          Periodo di rinnovo richiesto
        </small>
      </div>
      <div
        v-if="!visualizzaModifica"
        class="flex mb-4 w-full"
        :class="
          isMobile
            ? 'flex-column gap-3 align-items-center justify-content-center'
            : 'align-items-center justify-content-between'
        ">
        <span class="flex align-items-center mb-1 w-full">
          <label
            for="nomeBudget"
            class="mr-3 font-semibold lg:w-24 w-7rem text-center">
            Data di inizio
          </label>
          <DatePicker
            v-model="datiEntrataFissa.dataIniziale"
            showIcon
            class="flex-auto w-full"
            dateFormat="dd/mm/yy" />
        </span>
        <small
          v-if="
            (!datiEntrataFissa.dataIniziale ||
              !moment(datiEntrataFissa.dataIniziale).isValid()) &&
            submit
          ">
          Data iniziale richiesta
        </small>
      </div>
      <div
        class="flex mb-4 w-full"
        :class="
          isMobile
            ? 'flex-column gap-3 aling-items-center justify-content-center'
            : 'align-items-center'
        ">
        <label
          for="nomeCreaCategoria"
          class="mr-3 font-semibold w-24 text-center">
          Conto da associare
        </label>
        <Select
          v-model:model-value="datiEntrataFissa.contoCollegato"
          :options="conti"
          optionLabel="nome"
          :modelValue="datiEntrataFissa.contoCollegato"
          placeholder="Seleziona il conto da associare o lascia vuoto"
          fluid
          class="w-full"
          showClear
          @change="datiEntrataFissa.modificato = true">
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
          Un'entrata fissa con questo nome esiste già
        </small>
        <Button
          type="button"
          class="font-bold"
          severity="save"
          :disabled="bottonePremuto"
          @click="
            bottonePremuto = false;
            visualizzaModifica
              ? datiEntrataFissa.modificato
                ? modificaEntrataFissa()
                : ((erroreModifica = true), (bottonePremuto = false))
              : creaEntrataFissa();
          ">
          <i class="fa-solid fa-floppy-disk"></i>
          {{ visualizzaModifica ? "Salva" : "Crea" }}
        </Button>
      </div>
    </Dialog>

    <Popover ref="infoRip">
      <div class="font-bold">Abilità modifica ripetizione</div>
      <div class="text-l">
        Se abilitato si può modificare il periodo di rinnovo altrimenti rimarrà
        invariato.
      </div>
    </Popover>

    <Toast :style="isMobile ? 'width: 90vw' : ''" />
    <ConfirmDialog></ConfirmDialog>
  </div>
</template>

<script setup>
import moment from "moment";

useHead({
  title: "Money Mind | Entrate fisse",
});
const loading = ref(false);
const errore = ref(null);
let entrateFisse = ref([]);
let conti = ref([]);
let submit = ref(false);
let erroreModifica = ref(false);
let erroreEsisteGia = ref(false);
let visualizzaCrea = ref(false);
let visualizzaModifica = ref(false);
let datiEntrataFissa = ref({
  id: 0,
  nome: "",
  soldi: 0,
  periodoRipetizione: null,
  periodoNome: "",
  ripetizioneModificata: false,
  modificato: false,
  dataIniziale: new Date(),
});
let bottonePremuto = ref(false);
const nomeVecchioEntrataFissa = ref();
const confirm = useConfirm();
const toast = useToast();
const infoRip = ref();
const nomeUtente = ref(
  useCookie("email")
    .value.substring(0, useCookie("email").value.indexOf("@"))
    .toUpperCase()
);
const periodo = ref([
  { name: "Giorni", value: "giorno" },
  { name: "Settimane", value: "settimana" },
  { name: "Mesi", value: "mese" },
  { name: "Anni", value: "anno" },
]);
const { isMobile } = useDevice();

const caricaDati = async () => {
  loading.value = true;
  errore.value = null;
  try {
    const [entrateFisseData, contiData] = await Promise.all([
      $fetch("/api/entrateFisse/prendiTutti"),
      $fetch("/api/conti/prendiTutti"),
    ]);
    entrateFisse.value = entrateFisseData ?? [];
    conti.value = contiData ?? [];
  } catch (err) {
    if (import.meta.dev) console.error("Errore caricamento entrate fisse:", err);
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

const apriInfoModRipetizione = (event) => {
  infoRip.value.toggle(event);
};

const creaEntrataFissa = async () => {
  if (
    entrateFisse.value.find(
      (ef) => ef.nome.trim() === datiEntrataFissa.value.nome.trim()
    )
  )
    erroreEsisteGia.value = true;
  else erroreEsisteGia.value = false;
  submit.value = true;
  if (
    datiEntrataFissa.value.nome?.length > 0 &&
    datiEntrataFissa.value.soldi > 0 &&
    datiEntrataFissa.value.periodoRipetizione &&
    datiEntrataFissa.value.periodoNome &&
    datiEntrataFissa.value.dataIniziale &&
    moment(datiEntrataFissa.value.dataIniziale).isValid() &&
    !erroreEsisteGia.value
  ) {
    visualizzaCrea.value = false;
    bottonePremuto.value = false;
    try {
      await $fetch("/api/entrateFisse/crea", { method: "POST", body: datiEntrataFissa.value });
      cancellaDati();
      toast.add({ severity: "success", summary: "Conferma", detail: "Creazione effettuata con successo", life: 3000 });
      entrateFisse.value = await $fetch("/api/entrateFisse/prendiTutti");
    } catch (err) {
      if (import.meta.dev) console.error("Errore creazione entrata fissa:", err);
      toast.add({ severity: "error", summary: "Errore server", detail: "Impossibile creare l'entrata fissa. Riprova.", life: 4000 });
    }
  }
  bottonePremuto.value = false;
};

const modificaEntrataFissa = async () => {
  erroreModifica.value = false;
  if (
    entrateFisse.value.find(
      (ef) =>
        ef.nome.trim() === datiEntrataFissa.value.nome.trim() &&
        ef.id !== datiEntrataFissa.value.id
    )
  )
    erroreEsisteGia.value = true;
  else erroreEsisteGia.value = false;

  let errore = false;
  if (datiEntrataFissa.value.ripetizioneModificata)
    if (
      !(
        datiEntrataFissa.value.periodoRipetizione &&
        datiEntrataFissa.value.periodoNome &&
        moment(datiEntrataFissa.value.dataIniziale).isValid()
      )
    )
      errore = true;

  if (
    datiEntrataFissa.value.nome?.length > 0 &&
    datiEntrataFissa.value.soldi > 0 &&
    !errore &&
    !erroreEsisteGia.value
  ) {
    visualizzaCrea.value = false;
    bottonePremuto.value = false;
    visualizzaModifica.value = false;
    try {
      await $fetch("/api/entrateFisse/modifica", { method: "POST", body: datiEntrataFissa.value });
      toast.add({ severity: "success", summary: "Conferma", detail: "Modifica effettuata con successo", life: 3000 });
      entrateFisse.value = await $fetch("/api/entrateFisse/prendiTutti");
    } catch (err) {
      if (import.meta.dev) console.error("Errore modifica entrata fissa:", err);
      toast.add({ severity: "error", summary: "Errore server", detail: "Impossibile modificare l'entrata fissa. Riprova.", life: 4000 });
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
        await $fetch("/api/entrateFisse/elimina", { method: "POST", body: datiEntrataFissa.value });
        toast.add({ severity: "success", summary: "Conferma", detail: "Eliminazione effettuata con successo", life: 3000 });
        entrateFisse.value = await $fetch("/api/entrateFisse/prendiTutti");
      } catch (err) {
        if (import.meta.dev) console.error("Errore eliminazione entrata fissa:", err);
        toast.add({ severity: "error", summary: "Errore server", detail: "Impossibile eliminare l'entrata fissa. Riprova.", life: 4000 });
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
  if (!datiEntrataFissa.value.modificato) {
    erroreModifica.value = false;
    setTimeout(() => {
      datiEntrataFissa.value.contoCollegato = conti.value.find(
        (c) => c.nome === datiEntrataFissa.value.contoCollegato
      );
    }, 10);
  }
};

const cancellaDati = () => {
  datiEntrataFissa.value.nome = "";
  datiEntrataFissa.value.soldi = 0;
  datiEntrataFissa.value.periodoRipetizione = null;
  datiEntrataFissa.value.periodoNome = "";
  datiEntrataFissa.value.ripetizioneModificata = false;
  datiEntrataFissa.value.modificato = false;
  datiEntrataFissa.value.contoCollegato = null;
  (datiEntrataFissa.value.dataIniziale = new Date()), (submit.value = false);
  erroreModifica.value = false;
};
</script>

<style></style>
