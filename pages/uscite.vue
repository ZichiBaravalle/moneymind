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
              Uscite - {{ nomeUtente }}
            </h2>
          </div>
          <Divider />
        </template>
        <template #content>
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
                <template #title>Gestione uscite</template>
                <template #content>
                  <Button
                    class="flex w-full align-items-center justify-content-center"
                    severity="success"
                    @click="
                      visualizzaCreaUscita = true;
                      submit = false;
                      visualizzaErrore = false;
                    ">
                    <span
                      class="font-medium lg:block flex align-items-center lg:vertical-align-middle">
                      <i
                        class="fa-regular fa-plus lg:text-base text-2xl mr-2"></i>
                      Aggiungi uscita
                    </span>
                  </Button>
                </template>
              </Card>
            </div>
            <Chart
              type="bar"
              :data="datiMesiChart"
              :options="opzioniMesiChart"
              v-on:select="visualizzaMeseUscite($event)" />
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
                :value="categorieUscite"
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
            categorieUscite
              .filter((x) => !categorieSelezionate.includes(x))
              .map((x) => x.nome)
          "
          placeholder="Seleziona la categoria dove spostare le uscite associate o lascia vuoto"
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
          placeholder="Seleziona il conto o il budget da associare o lascia vuoto"
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
      v-model:visible="visualizzaCreaUscita"
      modal
      header="Crea una nuova uscita"
      :show="(nuovaUscita = {})">
      <div
        class="flex lg:mb-4 mb-3 w-full"
        :class="
          isMobile
            ? 'flex-column gap-3 aling-items-center justify-content-center'
            : 'justify-content-between'
        ">
        <div class="flex flex-column align-items-center lg:mr-4">
          <span class="flex align-items-center lg:mb-1 w-full">
            <label for="nomeUscita" class="mr-3 font-semibold w-24 text-center">
              Nome
            </label>
            <InputText
              id="nomeUscita"
              v-model="nuovaUscita.nome"
              class="flex-auto w-full"
              autocomplete="off"
              :update:modelValue="
                nuovaUscita.nome?.length > 45
                  ? (nuovaUscita.nome = nuovaUscita.nome.substring(0, 45))
                  : null
              " />
          </span>
          <small
            v-if="
              (!nuovaUscita.nome || nuovaUscita.nome.length === 0) && submit
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
              v-model="nuovaUscita.soldi"
              mode="currency"
            locale="it-IT"
              class="w-full"
              currency="EUR" />
          </span>
          <small
            v-if="(nuovaUscita.soldi <= 0 || !nuovaUscita.soldi) && submit">
            Soldi Uscita richiesti o negativi
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
              v-model="nuovaUscita.data"
              showIcon
              class="flex-auto w-full"
              dateFormat="dd/mm/yy" />
          </span>
          <small
            v-if="
              (!nuovaUscita.data || !moment(nuovaUscita.data).isValid()) &&
              submit
            ">
            Data richesta
          </small>
        </div>
        <div class="flex flex-column align-items-center">
          <span class="flex align-items-center mb-1 w-full">
            <label for="categoria" class="mr-3 font-semibold w-24 text-center">
              Categoria
            </label>
            <Select
              id="categoria"
              v-model="nuovaUscita.categoria"
              :options="categorieUscite.map((x) => x.nome)"
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
              (nuovaUscita.categoria === '' || !nuovaUscita.categoria) && submit
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
            creaUscita();
          ">
          <i class="fa-solid fa-floppy-disk"></i>
          Crea
        </Button>
      </div>
    </Dialog>

    <Toast :style="isMobile ? 'width: 90vw' : ''" />
    <ConfirmDialog></ConfirmDialog>
  </div>
</template>

<script setup>
import moment from "moment";

useHead({
  title: "Money Mind | Uscite",
});
const nomeUtente = ref(
  useCookie("email")
    .value.substring(0, useCookie("email").value.indexOf("@"))
    .toUpperCase()
);
const opzioniMesiChart = ref();
const datiMesiChart = ref();
const categorieUscite = ref();
const serviziDaAssociare = ref([]);
let categorieSelezionate = ref();
let visualizzaCrea = ref(false);
let visualizzaModifica = ref(false);
let visualizzaElimina = ref(false);
let visualizzaErrore = ref(false);
let visualizzaCreaUscita = ref(false);
let submit = ref(false);
let nuovaCategoria = ref({});
let nuovaUscita = ref({});
let bottonePremuto = ref(false);
let erroreEsisteGia = ref(false);
const toast = useToast();
const { isMobile } = useDevice();

onMounted(async () => {
  try {
    const datiMesi = await $fetch("/api/entrate-uscite/prendiResocontoMesi", {
      method: "POST",
      body: { entrate: false },
    });
    datiMesiChart.value = datiMesi[0];
    opzioniMesiChart.value = {
      ...datiMesi[1],
      onHover: (event, elements) => {
        if (event.native) {
          event.native.target.style.cursor = elements.length
            ? "pointer"
            : "default";
        }
      },
    };
    categorieUscite.value = await $fetch("/api/categorie/prendiTutti", {
      method: "POST",
      body: { entrate: false, somma: true },
    });
    const conti = await $fetch("/api/conti/prendiTutti");
    conti.map((x) => (x.servizio = "conto"));
    const budget = await $fetch("/api/budget/prendiTutti");
    budget.map((x) => (x.servizio = "budget"));
    if (conti?.length > 0)
      serviziDaAssociare.value.push({ nome: "Conti", items: conti });
    if (budget?.length > 0)
      serviziDaAssociare.value.push({ nome: "Budget", items: budget });
  } catch (error) {}
  if (isMobile)
    document.querySelector("body").style.backgroundColor =
      "var(--p-card-background)";
});

const creaCategoria = async () => {
  if (
    categorieUscite.value.find(
      (c) => c.nome.trim() === nuovaCategoria.value.nome.trim()
    )
  )
    erroreEsisteGia.value = true;
  else erroreEsisteGia.value = false;
  submit.value = true;
  if (nuovaCategoria.value.nome?.length > 0 && !erroreEsisteGia.value) {
    await $fetch("/api/categorie/crea", {
      method: "POST",
      body: { ...nuovaCategoria.value, entrate: false },
    });
    visualizzaCrea.value = false;
    bottonePremuto.value = false;
    nuovaCategoria.value = {};
    submit.value = false;
    toast.add({
      severity: "success",
      summary: "Conferma",
      detail: "Creazione effettuata con successo",
      life: 3000,
    });
    categorieUscite.value = await $fetch("/api/categorie/prendiTutti", {
      method: "POST",
      body: { entrate: false, somma: true },
    });
  }
  bottonePremuto.value = false;
};

const creaUscita = async () => {
  submit.value = true;
  if (
    nuovaUscita.value.nome?.length > 0 &&
    nuovaUscita.value.soldi > 0 &&
    moment(nuovaUscita.value.data).isValid() &&
    nuovaUscita.value.categoria?.length > 0
  ) {
    visualizzaCreaUscita.value = false;
    bottonePremuto.value = false;
    await $fetch("/api/entrate-uscite/crea", {
      method: "POST",
      body: { ...nuovaUscita.value, entrate: false },
    });
    toast.add({
      severity: "success",
      summary: "Conferma",
      detail: "Creazione effettuata con successo",
      life: 3000,
    });
    const datiMesi = await $fetch("/api/entrate-uscite/prendiResocontoMesi", {
      method: "POST",
      body: { entrate: false },
    });
    datiMesiChart.value = datiMesi[0];
    opzioniMesiChart.value = {
      ...datiMesi[1],
      onHover: (event, elements) => {
        if (event.native) {
          event.native.target.style.cursor = elements.length
            ? "pointer"
            : "default";
        }
      },
    };
    categorieUscite.value = await $fetch("/api/categorie/prendiTutti", {
      method: "POST",
      body: { entrate: false, somma: true },
    });
  }
  bottonePremuto.value = false;
};

const modificaCategoria = async () => {
  if (
    categorieUscite.value.find(
      (c) =>
        c.nome.trim() === nuovaCategoria.value.nome.trim() &&
        c.id !== nuovaCategoria.value.id
    )
  )
    erroreEsisteGia.value = true;
  else erroreEsisteGia.value = false;
  visualizzaErrore.value = false;
  if (nuovaCategoria.value.nome?.length > 0 && !erroreEsisteGia.value) {
    await $fetch("/api/categorie/modifica", {
      method: "POST",
      body: { ...nuovaCategoria.value, entrate: false },
    });
    visualizzaCrea.value = false;
    bottonePremuto.value = false;
    visualizzaModifica.value = false;
    nuovaCategoria.value = {};
    toast.add({
      severity: "success",
      summary: "Conferma",
      detail: "Modifica effettuata con successo",
      life: 3000,
    });
    categorieUscite.value = await $fetch("/api/categorie/prendiTutti", {
      method: "POST",
      body: { entrate: false, somma: true },
    });
  }
  bottonePremuto.value = false;
};
const eliminaCategorie = async () => {
  visualizzaElimina.value = false;
  bottonePremuto.value = false;
  await $fetch("/api/categorie/elimina", {
    method: "POST",
    body: { categorie: categorieSelezionate.value, entrate: false },
  });
  toast.add({
    severity: "success",
    summary: "Conferma",
    detail: "Eliminazione effettuata con successo",
    life: 3000,
  });
  pulisciCategorieSelezionate();
  categorieUscite.value = await $fetch("/api/categorie/prendiTutti", {
    method: "POST",
    body: { entrate: false, somma: true },
  });
};

const controllaEliminaCategorie = () => {
  if (
    categorieSelezionate.value?.length >= 1 &&
    categorieUscite.value?.length !== categorieSelezionate.value?.length
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

      case "budget":
        nuovaCategoria.value.servizioAssociato =
          serviziDaAssociare.value[1].items.find(
            (x) => x.nome === nomeServizio
          );
        break;
    }
  }
};

const visualizzaMeseUscite = (ev) => {
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
  navigateTo("/uscite-mesi/" + mesi[ev.element.index]);
};

const pulisciCategorieSelezionate = () => {
  categorieSelezionate.value = [];
};
</script>

<style scoped>
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
