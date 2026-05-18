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
                  <Column field="soldi" header="Soldi totali" sortable></Column>
                  <Column
                    field="soldiSenzaObiettivi"
                    header="Soldi disponibili"
                    sortable></Column>
                  <template #empty>
                    <h4 class="p-4">Non ci sono elementi disponibili</h4>
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
                  <Column
                    field="obiettivoSoldi"
                    header="Obiettivo soldi"
                    sortable></Column>
                  <Column
                    field="soldiAttuali"
                    header="Soldi attuali"
                    sortable></Column>
                  <template #empty>
                    <h4 class="p-4">Non ci sono elementi disponibili</h4>
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
                  <Column
                    field="soldiMassimi"
                    header="Soldi massimi"
                    sortable></Column>
                  <Column
                    field="soldiUsati"
                    header="Soldi usati"
                    sortable></Column>
                  <template #empty>
                    <h4 class="p-4">Non ci sono elementi disponibili</h4>
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

useHead({
  title: "Money Mind | Home",
});
const mesi = ref([
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
]);
const nomeUtente = ref(
  useCookie("email")
    .value.substring(0, useCookie("email").value.indexOf("@"))
    .toUpperCase()
);
const chartEntrate = ref();
const datiMesiChartEntrate = ref();
const opzioniMesiChartEntrate = ref();
const datiMesiChartUscite = ref();
const opzioniMesiChartUscite = ref();
const conti = ref();
const obiettivi = ref();
const budget = ref();
const categorieEntrate = ref();
const categorieUscite = ref();
const toast = useToast();
const { isMobile } = useDevice();

let visualizzaCrea = ref(false);
let visualizzaCreaEntrata = ref(false);
let nuovoDato = ref();
let submit = ref(false);
let bottonePremuto = ref(false);
const onHover = (event, elements) => {
  if (event.native) {
    event.native.target.style.cursor = elements.length ? "pointer" : "default";
  }
};

onMounted(async () => {
  // Parallelizzazione con Promise.all per migliorare le performance
  const [
    datiMesiEntrate,
    datiMesiUscite,
    contiData,
    obiettiviData,
    budgetData,
    categorieUsciteData,
    categorieEntrateData
  ] = await Promise.all([
    $fetch("/api/entrate-uscite/prendiResocontoMesi", {
      method: "POST",
      body: { entrate: true },
    }),
    $fetch("/api/entrate-uscite/prendiResocontoMesi", {
      method: "POST",
      body: { entrate: false },
    }),
    $fetch("/api/conti/prendiTutti", {
      method: "POST",
      body: true,
    }),
    $fetch("/api/obiettivi/prendiTutti"),
    $fetch("/api/budget/prendiTutti"),
    $fetch("/api/categorie/prendiTutti", {
      method: "POST",
      body: { entrate: false, somma: false },
    }),
    $fetch("/api/categorie/prendiTutti", {
      method: "POST",
      body: { entrate: true, somma: false },
    })
  ]);

  // Assegna i dati ai chart solo se non mobile
  if (!isMobile) {
    datiMesiChartEntrate.value = datiMesiEntrate[0];
    opzioniMesiChartEntrate.value = {
      ...datiMesiEntrate[1],
      onHover: onHover,
    };
    datiMesiChartUscite.value = datiMesiUscite[0];
    opzioniMesiChartUscite.value = {
      ...datiMesiUscite[1],
      onHover: onHover,
    };
  }

  // Assegna tutti gli altri dati
  conti.value = contiData;
  obiettivi.value = obiettiviData;
  budget.value = budgetData;
  categorieUscite.value = categorieUsciteData;
  categorieEntrate.value = categorieEntrateData;

  // Imposta background mobile
  if (isMobile) {
    document.querySelector("body").style.backgroundColor =
      "var(--p-card-background)";
  }
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
    await $fetch("/api/entrate-uscite/crea", {
      method: "POST",
      body: { ...nuovoDato.value, entrate: true },
    });
    visualizzaCrea.value = false;
    bottonePremuto.value = false;
    nuovoDato.value = {};
    submit.value = false;

    toast.add({
      severity: "success",
      summary: "Conferma",
      detail: "Creazione effettuata con successo",
      life: 3000,
    });

    let datiMesi = await $fetch("/api/entrate-uscite/prendiResocontoMesi", {
      method: "POST",
      body: { entrate: true },
    });

    if (!isMobile) {
      datiMesiChartEntrate.value = datiMesi[0];
      opzioniMesiChartEntrate.value = {
        ...datiMesi[1],
        onHover: onHover,
      };
    }

    datiMesi = await $fetch("/api/entrate-uscite/prendiResocontoMesi", {
      method: "POST",
      body: { entrate: false },
    });

    if (!isMobile) {
      datiMesiChartUscite.value = datiMesi[0];
      opzioniMesiChartUscite.value = {
        ...datiMesi[1],
        onHover: onHover,
      };
    }

    conti.value = await $fetch("/api/conti/prendiTutti", {
      method: "POST",
      body: true,
    });

    obiettivi.value = await $fetch("/api/obiettivi/prendiTutti");
    budget.value = await $fetch("/api/budget/prendiTutti");
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
    await $fetch("/api/entrate-uscite/crea", {
      method: "POST",
      body: { ...nuovoDato.value, entrate: false },
    });
    visualizzaCrea.value = false;
    bottonePremuto.value = false;
    nuovoDato.value = {};
    submit.value = false;
    toast.add({
      severity: "success",
      summary: "Conferma",
      detail: "Creazione effettuata con successo",
      life: 3000,
    });

    let datiMesi = await $fetch("/api/entrate-uscite/prendiResocontoMesi", {
      method: "POST",
      body: { entrate: false },
    });

    if (!isMobile) {
      datiMesiChartUscite.value = datiMesi[0];
      opzioniMesiChartUscite.value = {
        ...datiMesi[1],
        onHover: onHover,
      };
    }

    datiMesi = await $fetch("/api/entrate-uscite/prendiResocontoMesi", {
      method: "POST",
      body: { entrate: false },
    });

    if (!isMobile) {
      datiMesiChartUscite.value = datiMesi[0];
      opzioniMesiChartUscite.value = {
        ...datiMesi[1],
        onHover: onHover,
      };
    }

    conti.value = await $fetch("/api/conti/prendiTutti", {
      method: "POST",
      body: true,
    });

    obiettivi.value = await $fetch("/api/obiettivi/prendiTutti");
    budget.value = await $fetch("/api/budget/prendiTutti");
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
