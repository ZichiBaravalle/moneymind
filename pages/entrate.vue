<template>
  <div>
    <NuxtLayout name="sidebar">
      <Card
        :style="isMobile ? 'box-shadow: none;' : ''"
        :class="isMobile ? 'h-full w-full' : 'cardPrincipale'"
        :pt="{
          content: 'flex lg:flex-row flex-column w-full h-full',
          body: 'w-full h-full',
        }">
        <template #title>
          <div
            class="flex lg:flex-row flex-column justify-content-between align-items-center">
            <h2 style="font-size: 26px" class="lg:text-2xl mb-0">
              Entrate - {{ nomeUtente }}
            </h2>
          </div>
          <Divider />
        </template>
        <template #content>
          <!-- Loading state -->
          <div v-if="loading" class="flex lg:flex-row flex-column w-full gap-4" style="height: 100%">
            <div class="flex flex-column w-full gap-3">
              <div class="flex gap-2">
                <Skeleton height="3rem" class="w-full" />
                <Skeleton height="3rem" class="w-full" />
              </div>
              <Skeleton height="22rem" class="w-full" />
            </div>
            <div class="lg:w-35rem w-full">
              <Skeleton height="1.5rem" class="mb-3 w-12rem mx-auto" />
              <Skeleton height="1rem" class="mb-2" v-for="i in 5" :key="i" />
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

          <template v-else>
          <div class="lg:chart-container flex flex-column w-full">
            <div
              class="w-full lg:m-0 mb-5 flex lg:flex-row flex-column justify-content-evenly"
              style="height: 50%">
              <Card
                class="stileCard lg:mb-0 mb-3"
                :pt="{
                  title: 'text-center mb-1 mt-1',
                  body: 'h-full',
                  content:
                    'flex justify-content-between align-items-center lg:h-full h-5rem',
                }">
                <template #title>
                  <h4 style="margin: 0">Gestione categorie</h4>
                </template>
                <template #content>
                  <Button
                    class="flex lg:h-auto h-full align-items-center justify-content-center"
                    severity="success"
                    @click="
                      visualizzaCrea = true;
                      submit = false;
                      visualizzaModifica = false;
                      visualizzaErrore = false;
                    ">
                    <span
                      class="font-medium lg:block flex align-items-center lg:vertical-align-middle">
                      <i
                        class="fa-regular fa-plus lg:text-base text-2xl mr-2"></i>
                      Aggiungi categoria
                    </span>
                  </Button>
                  <Button
                    severity="danger"
                    label="Elimina categoria"
                    class="ml-4"
                    @click="controllaEliminaCategorie()">
                    <span
                      class="font-medium lg:block flex align-items-center lg:vertical-align-middle">
                      <i
                        class="fa-regular fa-trash-can lg:text-base text-2xl lg:mr-2"></i>
                      Elimina categorie selezionate
                    </span>
                  </Button>
                </template>
              </Card>
              <Card
                class="stileCard lg:w-20rem w-full"
                :pt="{
                  title: 'text-center mb-1 mt-1',
                  body: 'h-full w-full',
                  content:
                    'flex justify-content-between align-items-center lg:h-full h-3rem w-full',
                }">
                <template #title>Gestione entrate</template>
                <template #content>
                  <Button
                    class="flex w-full align-items-center justify-content-center"
                    severity="success"
                    @click="
                      visualizzaCreaEntrata = true;
                      submit = false;
                      visualizzaErrore = false;
                    ">
                    <span
                      class="font-medium lg:block flex align-items-center lg:vertical-align-middle">
                      <i
                        class="fa-regular fa-plus lg:text-base text-2xl mr-2"></i>
                      Aggiungi entrata
                    </span>
                  </Button>
                </template>
              </Card>
            </div>
            <Chart
              type="bar"
              :data="datiMesiChart"
              :options="opzioniMesiChart"
              v-on:select="visualizzaMeseEntrate($event)" />
          </div>
          <Card
            :style="isMobile ? 'width: 100%; margin-top: -2rem' : 'width: 35%'"
            class="h-full lg:ml-4 stileCard"
            :pt="{
              title: 'text-center',
              content: 'h-full',
              body: 'lg:h-full h-23rem',
            }">
            <template #title>
              <h3>Visualizzazione categorie</h3>
            </template>
            <template #content>
              <DataTable
                paginator
                :rows="3"
                v-model:selection="categorieSelezionate"
                class="h-full"
                style="background-color: #121212; border: 0px"
                @row-click="
                  visualizzaCrea = true;
                  visualizzaModifica = true;
                  nuovaCategoria = { ...$event.data };
                  visualizzaErrore = false;
                "
                :value="categorieEntrate"
                :pt="{
                  bodyRow: 'cursor-pointer',
                  emptyMessageCell: 'text-center h-full',
                  emptyMessage: 'text-center h-full',
                  tbody: 'h-full',
                  table: 'h-table',
                  tableContainer: 'h-full',
                }">
                <Column selectionMode="multiple"></Column>
                <Column
                  field="nome"
                  header="Nome"
                  sortable
                  style="width: 50%"></Column>
                <Column
                  field="soldi"
                  header="Soldi totali"
                  sortable
                  style="width: 50%"></Column>
                <template #empty>
                  <h4>Non ci sono elementi disponibili</h4>
                </template>
              </DataTable>
            </template>
          </Card>
          </template><!-- end v-else -->
        </template>
      </Card>
    </NuxtLayout>

    <Dialog
      :style="isMobile ? 'width: 95vw;' : ''"
      v-model:visible="visualizzaElimina"
      :header="
        'Elimina categori' + (categorieSelezionate?.length > 1 ? 'e' : 'a')
      "
      modal>
      <div class="flex justify-content-between align-items-center">
        <span class="mb-4">
          Sei sicuro di voler procedere con l'eliminazione
          <span v-if="categorieSelezionate.length === 1">della categoria</span>
          <span v-else>delle categorie</span>
          <span>
            {{
              " " +
              categorieSelezionate.map((item) => item.nome).join(", ") +
              "?"
            }}
          </span>
        </span>
      </div>
      <div
        class="mb-4 flex align-items-center"
        v-for="c in categorieSelezionate">
        <label class="mr-3">
          {{ c.nome }}
        </label>
        <Select
          class="lg:w-auto w-15rem"
          v-model:model-value="c.nomeNuovo"
          :options="
            categorieEntrate
              .filter((x) => !categorieSelezionate.includes(x))
              .map((x) => x.nome)
          "
          placeholder="Seleziona la categoria dove spostare le entrate associate o lascia vuoto"
          fluid
          showClear />
      </div>
      <div class="flex justify-content-around align-items-center">
        <Button
          type="button"
          class="font-bold"
          severity="danger"
          @click="
            visualizzaElimina = false;
            toast.add({
              severity: 'error',
              summary: 'Annulla',
              detail: 'Eliminazione annullata con successo',
              life: 3000,
            });
            pulisciCategorieSelezionate();
          ">
          <i class="fa-solid fa-xmark"></i>
          Annulla
        </Button>
        <Button
          type="button"
          class="font-bold"
          severity="warn"
          :disabled="bottonePremuto"
          @click="
            bottonePremuto = true;
            eliminaCategorie();
          ">
          <i class="fa-solid fa-trash-can"></i>
          Elimina
        </Button>
      </div>
    </Dialog>

    <Dialog
      :style="isMobile ? 'width: 95vw;' : ''"
      v-model:visible="visualizzaCrea"
      modal
      :header="
        visualizzaModifica
          ? `Modifica la categoria ${nuovaCategoria.nome}`
          : 'Crea una nuova categoria'
      "
      :show="
        (visualizzaModifica ? trovaServizio() : (nuovaCategoria = {}),
        (erroreEsisteGia = false))
      ">
      <div
        class="flex justify-content-between mb-4 w-full flex-column align-items-center">
        <span
          class="flex align-items-center justify-content-center mb-2 w-full">
          <label for="nomeCreaCategoria" class="mr-3 font-semibold text-center">
            Nome
          </label>
          <InputText
            id="nomeCreaCategoria"
            v-model="nuovaCategoria.nome"
            class="flex-auto"
            autocomplete="off"
            @keydown="nuovaCategoria.modificato = true"
            :update:modelValue="
              nuovaCategoria.nome?.length > 45
                ? (nuovaCategoria.nome = nuovaCategoria.nome.substring(0, 45))
                : null
            " />
        </span>
        <small
          v-if="
            (!nuovaCategoria.nome || nuovaCategoria.nome.length === 0) && submit
          ">
          Nome categoria richesto
        </small>
      </div>

      <div class="flex justify-content-between mb-4 w-full align-items-center">
        <label
          for="nomeCreaCategoria"
          class="mr-3 font-semibold w-24 text-center">
          Servizio di riferimento
        </label>
        <Select
          v-model:model-value="nuovaCategoria.servizioAssociato"
          :options="serviziDaAssociare"
          optionGroupChildren="items"
          optionGroupLabel="nome"
          optionLabel="nome"
          placeholder="Seleziona il conto o l'obiettivo da associare o lascia vuoto"
          fluid
          class="lg:w-30rem w-14rem"
          showClear
          @change="nuovaCategoria.modificato = true">
          <template #empty>Non ci sono elementi disponibili</template>
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
              detail:
                (visualizzaModifica ? 'Modifica' : 'Creazione') +
                ' annullata con successo',
              life: 3000,
            });
            visualizzaModifica = false;
            submit = false;
          ">
          <i class="fa-solid fa-xmark"></i>
          Cancella
        </Button>
        <small v-if="visualizzaErrore">Nessuna modifica alla categoria</small>
        <small class="text-center" v-else-if="erroreEsisteGia">
          Una categoria con questo nome esiste già
        </small>
        <Button
          type="button"
          class="font-bold"
          severity="save"
          :disabled="bottonePremuto"
          @click="
            bottonePremuto = true;
            visualizzaModifica
              ? nuovaCategoria.modificato
                ? modificaCategoria()
                : ((visualizzaErrore = true), (bottonePremuto = false))
              : creaCategoria();
          ">
          <i class="fa-solid fa-floppy-disk"></i>
          {{ visualizzaModifica ? "Modifica" : "Crea" }}
        </Button>
      </div>
    </Dialog>

    <Dialog
      :style="isMobile ? 'width: 95vw;' : ''"
      v-model:visible="visualizzaCreaEntrata"
      modal
      header="Crea una nuova entrata"
      :show="((nuovaEntrata = {}), (erroreEsisteGia = false))">
      <div
        class="flex lg:mb-4 mb-3 w-full"
        :class="
          isMobile
            ? 'flex-column gap-3 aling-items-center justify-content-center'
            : 'justify-content-between'
        ">
        <div class="flex flex-column align-items-center lg:mr-4">
          <span class="flex align-items-center lg:mb-1 w-full">
            <label
              for="nomeEntrata"
              class="mr-3 font-semibold w-24 text-center">
              Nome
            </label>
            <InputText
              id="nomeEntrata"
              v-model="nuovaEntrata.nome"
              class="flex-auto w-full"
              autocomplete="off"
              :update:modelValue="
                nuovaEntrata.nome?.length > 45
                  ? (nuovaEntrata.nome = nuovaEntrata.nome.substring(0, 45))
                  : null
              " />
          </span>
          <small
            v-if="
              (!nuovaEntrata.nome || nuovaEntrata.nome.length === 0) && submit
            ">
            Nome richesto
          </small>
        </div>
        <div class="flex flex-column align-items-center lg:w-6 w-full">
          <span class="flex align-items-center mb-1 w-full">
            <label for="soldi" class="mr-3 font-semibold w-24 text-center">
              Soldi
            </label>
            <InputNumber
              id="soldi"
              v-model="nuovaEntrata.soldi"
              mode="currency"
            locale="it-IT"
              class="w-full"
              currency="EUR" />
          </span>
          <small
            v-if="(nuovaEntrata.soldi <= 0 || !nuovaEntrata.soldi) && submit">
            Soldi entrata richiesti o negativi
          </small>
        </div>
      </div>
      <div
        class="flex lg:mb-4 mb-3 w-full"
        :class="
          isMobile
            ? 'flex-column gap-3 aling-items-center justify-content-center'
            : 'justify-content-between'
        ">
        <div class="flex flex-column align-items-center lg:mr-4">
          <span class="flex align-items-center mb-1 w-full">
            <label class="mr-3 font-semibold w-24 text-center">Data</label>
            <DatePicker
              v-model="nuovaEntrata.data"
              showIcon
              class="flex-auto w-full"
              dateFormat="dd/mm/yy" />
          </span>
          <small
            v-if="
              (!nuovaEntrata.data || !moment(nuovaEntrata.data).isValid()) &&
              submit
            ">
            Data richesta
          </small>
        </div>
        <div class="flex flex-column align-items-center">
          <span class="flex align-items-center mb-1 w-full">
            <label
              for="categoria"
              class="mr-3 font-semibold lg:w-24 w-full text-center">
              Categoria
            </label>
            <Select
              id="categoria"
              v-model="nuovaEntrata.categoria"
              :options="categorieEntrate.map((x) => x.nome)"
              placeholder="Seleziona la categoria"
              class="w-full">
              <template #option="slotProps">
                <div>{{ slotProps.option }}</div>
              </template>
              <template #empty>
                Non hai ancora creato nessuna categoria.
                <br />
                Crea una prima di continuare!
              </template>
            </Select>
          </span>
          <small
            v-if="
              (nuovaEntrata.categoria === '' || !nuovaEntrata.categoria) &&
              submit
            ">
            Categoria richiesta
          </small>
        </div>
      </div>

      <div class="flex justify-content-around align-items-center">
        <Button
          type="button"
          class="font-bold"
          severity="danger"
          @click="
            visualizzaCreaEntrata = false;
            toast.add({
              severity: 'error',
              summary: 'Annulla',
              detail: 'Creazione annullata con successo',
              life: 3000,
            });
          ">
          <i class="fa-solid fa-xmark"></i>
          Cancella
        </Button>
        <Button
          type="button"
          class="font-bold"
          severity="save"
          :disabled="bottonePremuto"
          @click="
            bottonePremuto = true;
            creaEntrata();
          ">
          <i class="fa-solid fa-floppy-disk"></i>
          Crea
        </Button>
      </div>
    </Dialog>

    <ConfirmDialog></ConfirmDialog>
    <Toast :style="isMobile ? 'width: 90vw' : ''" />
  </div>
</template>

<script setup>
import moment from "moment";

useHead({
  title: "Money Mind | Entrate",
});
const nomeUtente = ref(
  useCookie("email")
    .value.substring(0, useCookie("email").value.indexOf("@"))
    .toUpperCase()
);
const loading = ref(false);
const errore = ref(null);
const opzioniMesiChart = ref();
const datiMesiChart = ref();
const categorieEntrate = ref([]);
const serviziDaAssociare = ref([]);
let categorieSelezionate = ref([]);
let visualizzaCrea = ref(false);
let visualizzaModifica = ref(false);
let visualizzaElimina = ref(false);
let visualizzaCreaEntrata = ref(false);
let visualizzaErrore = ref(false);
let submit = ref(false);
let nuovaCategoria = ref({});
let nuovaEntrata = ref({});
let bottonePremuto = ref(false);
let erroreEsisteGia = ref(false);
const toast = useToast();
const { isMobile } = useDevice();

const caricaDati = async () => {
  loading.value = true;
  errore.value = null;
  try {
    const [datiMesi, categorie, conti, obiettivi] = await Promise.all([
      $fetch("/api/entrate-uscite/prendiResocontoMesi", { method: "POST", body: { entrate: true } }),
      $fetch("/api/categorie/prendiTutti", { method: "POST", body: { entrate: true, somma: true } }),
      $fetch("/api/conti/prendiTutti"),
      $fetch("/api/obiettivi/prendiTutti"),
    ]);
    datiMesiChart.value = datiMesi[0];
    opzioniMesiChart.value = {
      ...datiMesi[1],
      onHover: (event, elements) => {
        if (event.native) {
          event.native.target.style.cursor = elements.length ? "pointer" : "default";
        }
      },
    };
    categorieEntrate.value = categorie ?? [];
    serviziDaAssociare.value = [];
    conti.map((x) => (x.servizio = "conto"));
    obiettivi.map((x) => (x.servizio = "obiettivo"));
    if (conti?.length > 0)
      serviziDaAssociare.value.push({ nome: "Conti", items: conti });
    if (obiettivi?.length > 0)
      serviziDaAssociare.value.push({ nome: "Obiettivi", items: obiettivi });
  } catch (err) {
    if (import.meta.dev) console.error("Errore caricamento entrate:", err);
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

const creaCategoria = async () => {
  if (
    categorieEntrate.value.find(
      (c) => c.nome.trim() === nuovaCategoria.value.nome.trim()
    )
  )
    erroreEsisteGia.value = true;
  else erroreEsisteGia.value = false;
  submit.value = true;
  if (nuovaCategoria.value.nome?.length > 0 && !erroreEsisteGia.value) {
    visualizzaCrea.value = false;
    bottonePremuto.value = false;
    erroreEsisteGia.value = false;
    submit.value = false;
    try {
      await $fetch("/api/categorie/crea", {
        method: "POST",
        body: { ...nuovaCategoria.value, entrate: true },
      });
      nuovaCategoria.value = {};
      toast.add({ severity: "success", summary: "Conferma", detail: "Creazione effettuata con successo", life: 3000 });
      categorieEntrate.value = await $fetch("/api/categorie/prendiTutti", {
        method: "POST",
        body: { entrate: true, somma: true },
      });
    } catch (err) {
      if (import.meta.dev) console.error("Errore creazione categoria:", err);
      toast.add({ severity: "error", summary: "Errore server", detail: "Impossibile creare la categoria. Riprova.", life: 4000 });
    }
  }
  bottonePremuto.value = false;
};

const creaEntrata = async () => {
  submit.value = true;
  if (
    nuovaEntrata.value.nome?.length > 0 &&
    nuovaEntrata.value.soldi > 0 &&
    moment(nuovaEntrata.value.data).isValid() &&
    nuovaEntrata.value.categoria?.length > 0
  ) {
    visualizzaCreaEntrata.value = false;
    bottonePremuto.value = false;
    try {
      await $fetch("/api/entrate-uscite/crea", {
        method: "POST",
        body: { ...nuovaEntrata.value, entrate: true },
      });
      nuovaEntrata.value = {};
      toast.add({ severity: "success", summary: "Conferma", detail: "Creazione effettuata con successo", life: 3000 });
      const [datiMesi, categorie] = await Promise.all([
        $fetch("/api/entrate-uscite/prendiResocontoMesi", { method: "POST", body: { entrate: true } }),
        $fetch("/api/categorie/prendiTutti", { method: "POST", body: { entrate: true, somma: true } }),
      ]);
      datiMesiChart.value = datiMesi[0];
      opzioniMesiChart.value = {
        ...datiMesi[1],
        onHover: (event, elements) => {
          if (event.native) {
            event.native.target.style.cursor = elements.length ? "pointer" : "default";
          }
        },
      };
      categorieEntrate.value = categorie ?? [];
    } catch (err) {
      if (import.meta.dev) console.error("Errore creazione entrata:", err);
      toast.add({ severity: "error", summary: "Errore server", detail: "Impossibile creare l'entrata. Riprova.", life: 4000 });
    }
  }
  bottonePremuto.value = false;
};

const modificaCategoria = async () => {
  if (
    categorieEntrate.value.find(
      (c) =>
        c.nome.trim() === nuovaCategoria.value.nome.trim() &&
        c.id !== nuovaCategoria.value.id
    )
  )
    erroreEsisteGia.value = true;
  else erroreEsisteGia.value = false;
  visualizzaErrore.value = false;
  if (nuovaCategoria.value.nome?.length > 0) {
    visualizzaCrea.value = false;
    visualizzaModifica.value = false;
    erroreEsisteGia.value = false;
    bottonePremuto.value = false;
    try {
      await $fetch("/api/categorie/modifica", {
        method: "POST",
        body: { ...nuovaCategoria.value, entrate: true },
      });
      nuovaCategoria.value = {};
      toast.add({ severity: "success", summary: "Conferma", detail: "Modifica effettuata con successo", life: 3000 });
      categorieEntrate.value = await $fetch("/api/categorie/prendiTutti", {
        method: "POST",
        body: { entrate: true, somma: true },
      });
    } catch (err) {
      if (import.meta.dev) console.error("Errore modifica categoria:", err);
      toast.add({ severity: "error", summary: "Errore server", detail: "Impossibile modificare la categoria. Riprova.", life: 4000 });
    }
  }
  bottonePremuto.value = false;
};

const eliminaCategorie = async () => {
  visualizzaElimina.value = false;
  bottonePremuto.value = false;
  try {
    await $fetch("/api/categorie/elimina", {
      method: "POST",
      body: { categorie: categorieSelezionate.value, entrate: true },
    });
    toast.add({ severity: "success", summary: "Conferma", detail: "Eliminazione effettuata con successo", life: 3000 });
    pulisciCategorieSelezionate();
    categorieEntrate.value = await $fetch("/api/categorie/prendiTutti", {
      method: "POST",
      body: { entrate: true, somma: true },
    });
  } catch (err) {
    if (import.meta.dev) console.error("Errore eliminazione categorie:", err);
    toast.add({ severity: "error", summary: "Errore server", detail: "Impossibile eliminare le categorie. Riprova.", life: 4000 });
  }
};

const controllaEliminaCategorie = () => {
  if (
    categorieSelezionate.value?.length >= 1 &&
    categorieEntrate.value?.length !== categorieSelezionate.value?.length
  )
    visualizzaElimina.value = true;
  else if (
    !categorieSelezionate.value ||
    categorieSelezionate?.value.length === 0
  )
    toast.add({
      severity: "error",
      summary: "Errore",
      detail: "Nessuna categoria selezionata",
      life: 3000,
    });
  else
    toast.add({
      severity: "error",
      summary: "Errore",
      detail: "Non si possono eliminare tutte le categorie",
      life: 3000,
    });
};

const trovaServizio = () => {
  submit.value = true;
  if (typeof nuovaCategoria.value?.servizioAssociato === "string") {
    const [servizio, nomeServizio] =
      nuovaCategoria.value?.servizioAssociato?.split(":") || [null, null];
    nuovaCategoria.value.vecchioServizioAssociato =
      nuovaCategoria.value?.servizioAssociato;
    switch (servizio) {
      case "conto":
        nuovaCategoria.value.servizioAssociato =
          serviziDaAssociare.value[0].items.find(
            (x) => x.nome === nomeServizio
          );
        break;

      case "obiettivo":
        nuovaCategoria.value.servizioAssociato =
          serviziDaAssociare.value[1].items.find(
            (x) => x.nome === nomeServizio
          );
        break;
    }
  }
};

const visualizzaMeseEntrate = (ev) => {
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
  navigateTo("/entrate-mesi/" + mesi[ev.element.index]);
};

const pulisciCategorieSelezionate = () => {
  categorieSelezionate.value = [];
};
</script>

<style>
.chart-container {
  width: 70%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}

.p-chart {
  margin-top: 1rem;
  max-width: 100%;
  max-height: 100%;
  width: 100% !important;
  height: auto !important;
}

.stileCard {
  border: 1px #3f3f46 solid;
}

.h-table {
  height: calc(100% - 100px);
}
</style>
