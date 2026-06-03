<template>
  <div>
    <NuxtLayout name="sidebar">
      <Card
        :style="isMobile ? 'box-shadow: none;' : ''"
        :class="isMobile ? 'h-full w-full' : 'cardPrincipale'"
        :pt="{ content: 'h-full', body: 'h-full ' }">
        <template #title>
          <div
            class="flex lg:flex-row flex-column justify-content-between align-items-center">
            <h2 style="font-size: 27px" class="lg:text-2xl mb-3">
              Home - {{ nomeUtente }}
            </h2>
            <div>
              <Button
                :disabled="loading"
                @click="
                  visualizzaCrea = true;
                  visualizzaCreaEntrata = true;
                ">
                <i class="fa-solid fa-plus"></i>
                Nuova entrata
              </Button>
              <Button
                severity="info"
                class="ml-3"
                :disabled="loading"
                @click="
                  visualizzaCrea = true;
                  visualizzaCreaEntrata = false;
                ">
                <i class="fa-solid fa-plus"></i>
                Nuova uscita
              </Button>
            </div>
          </div>
          <Divider />
        </template>
        <template #content>
          <!-- Loading state -->
          <div v-if="loading">
            <div class="flex telefono lg:flex-row gap-2 mb-4">
              <div v-for="i in 3" :key="i" class="w-full">
                <Skeleton height="1.5rem" class="mb-3 w-8rem" />
                <Skeleton height="1rem" class="mb-2" />
                <Skeleton height="1rem" class="mb-2" />
                <Skeleton height="1rem" class="mb-2" />
                <Skeleton height="14rem" />
              </div>
            </div>
            <div class="h-25rem mt-5 w-full lg:flex hidden gap-2">
              <div class="w-full flex flex-column align-items-center">
                <Skeleton height="1.5rem" class="mb-3 w-6rem" />
                <Skeleton height="20rem" class="w-full" />
              </div>
              <div class="w-full flex flex-column align-items-center">
                <Skeleton height="1.5rem" class="mb-3 w-5rem" />
                <Skeleton height="20rem" class="w-full" />
              </div>
            </div>
          </div>

          <!-- Error state -->
          <div
            v-else-if="errore"
            class="flex flex-column align-items-center justify-content-center gap-3 p-6"
            style="min-height: 20rem">
            <i
              class="fa-solid fa-circle-exclamation text-5xl"
              style="color: var(--p-amber-500)"></i>
            <p class="text-xl text-center m-0">{{ errore.messaggio }}</p>
            <small
              v-if="errore.tipo === 'permessi'"
              class="text-center"
              style="color: var(--p-text-muted-color)">
              Prova a ricaricare la pagina o accedi nuovamente.
            </small>
            <Button @click="caricaDati()" severity="secondary">
              <i class="fa-solid fa-rotate-right mr-2"></i>
              Riprova
            </Button>
          </div>

          <!-- Content -->
          <template v-else>
            <div
              style="height: calc(100% - 26rem)"
              class="flex telefono lg:flex-row gap-2">
              <Card
                class="stileCard lg:h-19rem h-auto w-full"
                :pt="{ content: 'h-full', body: 'h-full' }">
                <template #title>
                  <h3 class="m-0 text-center">Conti</h3>
                </template>
                <template #content>
                  <DataTable
                    paginator
                    :rows="isMobile ? 7 : 3"
                    class="lg:h-14rem h-27rem"
                    style="border: 0px"
                    @row-click="navigateTo('/conti')"
                    :value="conti">
                    <Column field="nome" header="Nome" sortable></Column>
                    <Column field="soldi" header="Soldi totali" sortable>
                      <template #body="slotProps">{{ formatEuro(slotProps.data.soldi) }}</template>
                    </Column>
                    <Column field="soldiSenzaObiettivi" header="Soldi disponibili" sortable>
                      <template #body="slotProps">{{ formatEuro(slotProps.data.soldiSenzaObiettivi ?? slotProps.data.soldi) }}</template>
                    </Column>
                    <template #empty>
                      <div class="flex flex-column align-items-center p-4 gap-2">
                        <i class="fa-solid fa-piggy-bank text-3xl" style="color: var(--p-text-muted-color)"></i>
                        <p class="m-0" style="color: var(--p-text-muted-color)">Nessun conto disponibile</p>
                        <Button size="small" severity="secondary" @click="navigateTo('/conti')">Crea il primo conto</Button>
                      </div>
                    </template>
                  </DataTable>
                </template>
              </Card>
              <Card
                class="stileCard lg:h-19rem h-auto w-full"
                :pt="{ content: 'h-full', body: 'h-full' }">
                <template #title>
                  <h3 class="m-0 text-center">Obiettivi</h3>
                </template>
                <template #content>
                  <DataTable
                    paginator
                    :rows="isMobile ? 7 : 3"
                    class="lg:h-14rem h-27rem"
                    style="border: 0px"
                    @row-click="navigateTo('/obiettivi')"
                    :value="obiettivi">
                    <Column field="nome" header="Nome" sortable></Column>
                    <Column field="obiettivoSoldi" header="Obiettivo soldi" sortable>
                      <template #body="slotProps">{{ formatEuro(slotProps.data.obiettivoSoldi) }}</template>
                    </Column>
                    <Column field="soldiAttuali" header="Soldi attuali" sortable>
                      <template #body="slotProps">{{ formatEuro(slotProps.data.soldiAttuali) }}</template>
                    </Column>
                    <template #empty>
                      <div class="flex flex-column align-items-center p-4 gap-2">
                        <i class="fa-solid fa-bullseye text-3xl" style="color: var(--p-text-muted-color)"></i>
                        <p class="m-0" style="color: var(--p-text-muted-color)">Nessun obiettivo disponibile</p>
                        <Button size="small" severity="secondary" @click="navigateTo('/obiettivi')">Crea il primo obiettivo</Button>
                      </div>
                    </template>
                  </DataTable>
                </template>
              </Card>
              <Card
                class="stileCard lg:h-19rem h-auto w-full"
                :pt="{ content: 'h-full', body: 'h-full' }">
                <template #title>
                  <h3 class="m-0 text-center">Budget</h3>
                </template>
                <template #content>
                  <DataTable
                    paginator
                    :rows="isMobile ? 7 : 3"
                    class="lg:h-14rem h-27rem"
                    style="border: 0px"
                    @row-click="navigateTo('/budget')"
                    :value="budget">
                    <Column field="nome" header="Nome" sortable></Column>
                    <Column field="soldiMassimi" header="Soldi massimi" sortable>
                      <template #body="slotProps">{{ formatEuro(slotProps.data.soldiMassimi) }}</template>
                    </Column>
                    <Column field="soldiUsati" header="Soldi usati" sortable>
                      <template #body="slotProps">{{ formatEuro(slotProps.data.soldiUsati) }}</template>
                    </Column>
                    <template #empty>
                      <div class="flex flex-column align-items-center p-4 gap-2">
                        <i class="fa-solid fa-wallet text-3xl" style="color: var(--p-text-muted-color)"></i>
                        <p class="m-0" style="color: var(--p-text-muted-color)">Nessun budget disponibile</p>
                        <Button size="small" severity="secondary" @click="navigateTo('/budget')">Crea il primo budget</Button>
                      </div>
                    </template>
                  </DataTable>
                </template>
              </Card>
            </div>
            <div class="h-25rem mt-5 align-items-end w-full lg:flex hidden">
              <div class="w-full lg:block hidden">
                <h2 class="mt-0 text-center">Entrate</h2>
                <Chart
                  class="lg:block hidden"
                  ref="chartEntrate"
                  type="bar"
                  :data="datiMesiChartEntrate"
                  :options="opzioniMesiChartEntrate"
                  v-on:select="visualizzaMeseEntrate($event)" />
              </div>
              <div class="w-full">
                <h2 class="mt-0 text-center lg:block hidden">Uscite</h2>
                <Chart
                  class="lg:block hidden"
                  type="bar"
                  :data="datiMesiChartUscite"
                  :options="opzioniMesiChartUscite"
                  v-on:select="visualizzaMeseUscite($event)" />
              </div>
            </div>
          </template>
        </template>
      </Card>
    </NuxtLayout>

    <Dialog
      :style="isMobile ? 'width: 95vw;' : ''"
      v-model:visible="visualizzaCrea"
      modal
      :header="
        'Crea una nuova' + (visualizzaCreaEntrata ? ' entrata' : ' uscita')
      "
      :show="(nuovoDato = {})">
      <div
        class="flex mb-4 w-full"
        :class="
          isMobile
            ? 'flex-column gap-3 aling-items-center justify-content-center'
            : 'justify-content-between'
        ">
        <div
          class="flex flex-column align-items-center"
          :class="isMobile ? 'w-full' : 'mr-4'">
          <span class="flex align-items-center mb-1 w-full">
            <label for="nomeDato" class="mr-3 font-semibold w-24 text-center">
              Nome
            </label>
            <InputText
              id="nomeDato"
              v-model="nuovoDato.nome"
              class="flex-auto w-full"
              autocomplete="off"
              :update:modelValue="
                nuovoDato.nome?.length > 45
                  ? (nuovoDato.nome = nuovoDato.nome.substring(0, 45))
                  : null
              " />
          </span>
          <small
            v-if="(!nuovoDato.nome || nuovoDato.nome.length === 0) && submit">
            Nome richesto
          </small>
        </div>
        <div
          class="flex flex-column align-items-center"
          :class="isMobile ? 'w-full' : 'w-6'">
          <span class="flex align-items-center mb-1 w-full">
            <label
              for="soldiNuovoDato"
              class="mr-3 font-semibold w-24 text-center">
              Soldi
            </label>
            <InputNumber
              id="soldiNuovoDato"
              v-model="nuovoDato.soldi"
              mode="currency"
            locale="it-IT"
              class="w-full"
              currency="EUR" />
          </span>
          <small v-if="(nuovoDato.soldi <= 0 || !nuovoDato.soldi) && submit">
            Soldi {{ visualizzaCreaEntrata ? "entrata" : "uscita" }} richiesti o
            negativi
          </small>
        </div>
      </div>

      <div
        class="flex mb-4 w-full"
        :class="
          isMobile
            ? 'flex-column gap-3 aling-items-center justify-content-center'
            : 'justify-content-between'
        ">
        <div
          class="flex flex-column align-items-center"
          :class="isMobile ? 'w-full' : 'mr-4'">
          <span class="flex align-items-center mb-1 w-full">
            <label class="mr-3 font-semibold w-24 text-center">Data</label>
            <DatePicker
              v-model="nuovoDato.data"
              showIcon
              class="flex-auto w-full"
              dateFormat="dd/mm/yy" />
          </span>
          <small
            v-if="
              (!nuovoDato.data || !moment(nuovoDato.data).isValid()) && submit
            ">
            Data richesta
          </small>
        </div>
        <div class="flex flex-column align-items-center">
          <span class="flex align-items-center mb-1 w-full">
            <label
              for="categoriaNuovoDato"
              class="mr-3 font-semibold w-24 text-center">
              Categoria
            </label>
            <Select
              id="categoriaNuovoDato"
              v-model="nuovoDato.categoria"
              :options="
                visualizzaCreaEntrata ? categorieEntrate : categorieUscite
              "
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
              (nuovoDato.categoria === '' || !nuovoDato.categoria) && submit
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
            visualizzaCrea = false;
            submit = false;
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
            visualizzaCreaEntrata ? creaEntrata() : creaUscita();
          ">
          <i class="fa-solid fa-floppy-disk"></i>
          Crea
        </Button>
      </div>
    </Dialog>

    <Toast :style="isMobile ? 'width: 65vw' : ''" />
    <ConfirmDialog></ConfirmDialog>
  </div>
</template>

<script setup>
import moment from "moment/moment";
import { navigateTo } from "nuxt/app";
import { useToast } from "primevue";

useHead({ title: "Money Mind | Home" });

const mesi = ref([
  "gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno",
  "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre",
]);
const nomeUtente = ref(
  useCookie("email").value.substring(0, useCookie("email").value.indexOf("@")).toUpperCase()
);
const chartEntrate = ref();
const datiMesiChartEntrate = ref();
const opzioniMesiChartEntrate = ref();
const datiMesiChartUscite = ref();
const opzioniMesiChartUscite = ref();
const conti = ref([]);
const obiettivi = ref([]);
const budget = ref([]);
const categorieEntrate = ref([]);
const categorieUscite = ref([]);
const toast = useToast();
const { isMobile } = useDevice();

const visualizzaCrea = ref(false);
const visualizzaCreaEntrata = ref(false);
const nuovoDato = ref({});
const submit = ref(false);
const bottonePremuto = ref(false);
const loading = ref(false);
const errore = ref(null);

const onHover = (event, elements) => {
  if (event.native) {
    event.native.target.style.cursor = elements.length ? "pointer" : "default";
  }
};

const formatDateOnly = (value) => {
  const parsed = moment(value);
  return parsed.isValid() ? parsed.format("YYYY-MM-DD") : null;
};

const classificaErrore = (err) => {
  if (import.meta.dev) console.error("Errore home:", err);
  if (err?.statusCode === 401 || err?.statusCode === 403)
    return { tipo: "permessi", messaggio: "Non hai i permessi per accedere a questi dati." };
  if (err?.statusCode === 404)
    return { tipo: "non-trovato", messaggio: "Dati non trovati." };
  return { tipo: "server", messaggio: "Errore durante il caricamento. Riprova." };
};

const caricaDati = async () => {
  loading.value = true;
  errore.value = null;
  try {
    const [
      datiMesiEntrate,
      datiMesiUscite,
      contiData,
      obiettiviData,
      budgetData,
      categorieUsciteData,
      categorieEntrateData,
    ] = await Promise.all([
      $fetch("/api/entrate-uscite/prendiResocontoMesi", { method: "POST", body: { entrate: true } }),
      $fetch("/api/entrate-uscite/prendiResocontoMesi", { method: "POST", body: { entrate: false } }),
      $fetch("/api/conti/prendiTutti", { method: "POST", body: true }),
      $fetch("/api/obiettivi/prendiTutti"),
      $fetch("/api/budget/prendiTutti"),
      $fetch("/api/categorie/prendiTutti", { method: "POST", body: { entrate: false, somma: false } }),
      $fetch("/api/categorie/prendiTutti", { method: "POST", body: { entrate: true, somma: false } }),
    ]);

    if (!isMobile) {
      datiMesiChartEntrate.value = datiMesiEntrate[0];
      opzioniMesiChartEntrate.value = { ...datiMesiEntrate[1], onHover };
      datiMesiChartUscite.value = datiMesiUscite[0];
      opzioniMesiChartUscite.value = { ...datiMesiUscite[1], onHover };
    }
    conti.value = contiData ?? [];
    obiettivi.value = obiettiviData ?? [];
    budget.value = budgetData ?? [];
    categorieUscite.value = Array.isArray(categorieUsciteData) ? categorieUsciteData : [];
    categorieEntrate.value = Array.isArray(categorieEntrateData) ? categorieEntrateData : [];
  } catch (err) {
    errore.value = classificaErrore(err);
  } finally {
    loading.value = false;
  }
};

const aggiornaDatiDopo = async () => {
  try {
    const [
      datiMesiEntrate,
      datiMesiUscite,
      contiData,
      obiettiviData,
      budgetData,
    ] = await Promise.all([
      $fetch("/api/entrate-uscite/prendiResocontoMesi", { method: "POST", body: { entrate: true } }),
      $fetch("/api/entrate-uscite/prendiResocontoMesi", { method: "POST", body: { entrate: false } }),
      $fetch("/api/conti/prendiTutti", { method: "POST", body: true }),
      $fetch("/api/obiettivi/prendiTutti"),
      $fetch("/api/budget/prendiTutti"),
    ]);

    if (!isMobile) {
      datiMesiChartEntrate.value = datiMesiEntrate[0];
      opzioniMesiChartEntrate.value = { ...datiMesiEntrate[1], onHover };
      datiMesiChartUscite.value = datiMesiUscite[0];
      opzioniMesiChartUscite.value = { ...datiMesiUscite[1], onHover };
    }
    conti.value = contiData ?? [];
    obiettivi.value = obiettiviData ?? [];
    budget.value = budgetData ?? [];
  } catch (err) {
    if (import.meta.dev) console.error("Errore aggiornamento dati home:", err);
    toast.add({ severity: "warn", summary: "Attenzione", detail: "Dati aggiornati parzialmente. Ricarica se necessario.", life: 4000 });
  }
};

onMounted(async () => {
  await caricaDati();
  if (isMobile) document.querySelector("body").style.backgroundColor = "var(--p-card-background)";
});

const visualizzaMeseUscite = (ev) => {
  navigateTo("/uscite-mesi/" + mesi.value[ev.element.index]);
};

const visualizzaMeseEntrate = (ev) => {
  navigateTo("/entrate-mesi/" + mesi.value[ev.element.index]);
};

const creaEntrata = async () => {
  submit.value = true;
  if (
    nuovoDato.value.nome?.length > 0 &&
    nuovoDato.value.soldi > 0 &&
    moment(nuovoDato.value.data).isValid() &&
    nuovoDato.value.categoria?.length > 0
  ) {
    try {
      await $fetch("/api/entrate-uscite/crea", {
        method: "POST",
        body: {
          ...nuovoDato.value,
          data: formatDateOnly(nuovoDato.value.data),
          entrate: true,
        },
      });
      visualizzaCrea.value = false;
      nuovoDato.value = {};
      submit.value = false;
      toast.add({ severity: "success", summary: "Conferma", detail: "Creazione effettuata con successo", life: 3000 });
      await aggiornaDatiDopo();
    } catch (err) {
      if (import.meta.dev) console.error("Errore creazione entrata:", err);
      if (err?.statusCode === 422 || err?.statusCode === 400)
        toast.add({ severity: "error", summary: "Errore", detail: "Dati non validi. Controlla i campi.", life: 4000 });
      else
        toast.add({ severity: "error", summary: "Errore server", detail: "Errore del server. Riprova più tardi.", life: 4000 });
    }
  }
  bottonePremuto.value = false;
};

const creaUscita = async () => {
  submit.value = true;
  if (
    nuovoDato.value.nome?.length > 0 &&
    nuovoDato.value.soldi > 0 &&
    moment(nuovoDato.value.data).isValid() &&
    nuovoDato.value.categoria?.length > 0
  ) {
    try {
      await $fetch("/api/entrate-uscite/crea", {
        method: "POST",
        body: {
          ...nuovoDato.value,
          data: formatDateOnly(nuovoDato.value.data),
          entrate: false,
        },
      });
      visualizzaCrea.value = false;
      nuovoDato.value = {};
      submit.value = false;
      toast.add({ severity: "success", summary: "Conferma", detail: "Creazione effettuata con successo", life: 3000 });
      await aggiornaDatiDopo();
    } catch (err) {
      if (import.meta.dev) console.error("Errore creazione uscita:", err);
      if (err?.statusCode === 422 || err?.statusCode === 400)
        toast.add({ severity: "error", summary: "Errore", detail: "Dati non validi. Controlla i campi.", life: 4000 });
      else
        toast.add({ severity: "error", summary: "Errore server", detail: "Errore del server. Riprova più tardi.", life: 4000 });
    }
  }
  bottonePremuto.value = false;
};
</script>

<style>
.telefono {
  display: flex;
  flex-direction: column;
}

.stileCard {
  border: 1px #3f3f46 solid;
}

.p-chart {
  width: 100%;
}

.p-datatable-column-title {
  text-align: center;
}

.tableContainer {
  height: calc(100% - 48px);
  overflow: hidden !important;
}

.tableTelefono {
  height: 100% !important;
}
</style>
