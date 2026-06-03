<template>
  <div>
    <NuxtLayout name="sidebar">
      <Card
        :class="isMobile ? 'h-full w-full' : 'cardPrincipale'"
        :pt="{ content: 'h-full', body: 'h-full' }">
        <template #content>
          <!-- Loading state -->
          <div v-if="loading" class="flex flex-column gap-3 p-4">
            <div class="flex justify-content-between align-items-center mb-3">
              <Skeleton height="2.5rem" class="w-16rem" />
              <Skeleton height="2.5rem" class="w-12rem" />
            </div>
            <Skeleton height="1rem" v-for="i in 5" :key="i" class="mb-2" />
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

          <DataTable
            v-else
            selectionMode="single"
            @rowSelect="
              visualizzaModifica = true;
              visualizzaCrea = true;
              datiEntrate = {
                ...$event.data,
                entrate: true,
                mese: route.params.id,
              };
              nomeEntrataModifica = datiEntrate.nome;
            "
            paginator
            :rows="5"
            :rowsPerPageOptions="[5, 10, 20, 50]"
            :pt="{ root: 'root' }"
            :value="entrate">
            <template #header>
              <div
                class="flex lg:flex-row flex-column justify-content-between align-items-center">
                <h2 style="font-size: 30px" class="lg:text-2xl mb-3">
                  Entrate di {{ route.params.id }}
                </h2>
                <div style="float: right">
                  <Button
                    @click="
                      visualizzaCrea = true;
                      visualizzaModifica = false;
                    "
                    class="lg:text-base text-xl">
                    <i class="fa-solid fa-plus"></i>
                    Aggiungi entrata in
                    {{ route.params.id }}
                  </Button>
                </div>
              </div>
            </template>
            <template #empty>
              <h3 class="text-center">Non ci sono elementi disponibili</h3>
            </template>
            <Column field="nome" header="Nome"></Column>
            <Column field="soldi" header="Soldi"></Column>
            <Column field="data" header="Data"></Column>
            <Column field="categoria" header="Categoria"></Column>
            <Column>
              <template #body="slotProps">
                <Button
                  severity="danger"
                  @click="eliminaEntrata(slotProps.data)">
                  <i class="fa-solid fa-trash-xmark"></i>
                </Button>
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>
    </NuxtLayout>

    <Dialog
      :style="isMobile ? 'width: 95vw;' : ''"
      v-model:visible="visualizzaCrea"
      modal
      :header="
        visualizzaModifica
          ? 'Modifica entrata ' + nomeEntrataModifica
          : 'Crea una nuova entrata'
      "
      :show="
        (visualizzaModifica ? (erroreModifica = false) : cancellaDati(),
        (erroreMese = false))
      ">
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
              for="nomeEntrata"
              class="mr-3 font-semibold w-24 text-center">
              Nome
            </label>
            <InputText
              id="nomeEntrata"
              v-model="datiEntrate.nome"
              class="flex-auto w-full"
              autocomplete="off"
              @keydown="datiEntrate.modificato = true"
              :update:modelValue="
                datiEntrate.nome?.length > 45
                  ? (datiEntrate.nome = datiEntrate.nome.substring(0, 45))
                  : null
              " />
          </span>
          <small
            v-if="
              (!datiEntrate.nome || datiEntrate.nome.length === 0) && submit
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
              v-model="datiEntrate.soldi"
              mode="currency"
            locale="it-IT"
              class="w-full"
              currency="EUR"
              @keydown="datiEntrate.modificato = true" />
          </span>
          <small v-if="datiEntrate.soldi <= 0 && submit">
            Soldi entrata richiesti o negativi
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
        <div class="flex flex-column align-items-center lg:mr-4">
          <span class="flex align-items-center mb-1 w-full">
            <label class="mr-3 font-semibold w-24 text-center">Data</label>
            <DatePicker
              v-model="datiEntrate.data"
              showIcon
              class="flex-auto w-full"
              dateFormat="dd/mm/yy"
              @update:modelValue="datiEntrate.modificato = true" />
          </span>
          <small
            v-if="
              (datiEntrate.data === null ||
                !moment(datiEntrate.data).isValid()) &&
              submit
            ">
            Data richesta
          </small>
          <small v-else-if="erroreMese">
            Mese non corrispondente a {{ route.params.id }}
          </small>
        </div>
        <div class="flex flex-column align-items-center">
          <span class="flex align-items-center mb-1 w-full">
            <label for="categoria" class="mr-3 font-semibold w-24 text-center">
              Categoria
            </label>
            <Select
              id="categoria"
              v-model="datiEntrate.categoria"
              :options="categorie"
              placeholder="Seleziona la categoria"
              class="w-full"
              @change="datiEntrate.modificato = true">
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
          <small v-if="datiEntrate.categoria === '' && submit">
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
        <Button
          type="button"
          class="font-bold"
          severity="save"
          :disabled="bottonePremuto"
          @click="
            bottonePremuto = true;
            visualizzaModifica
              ? datiEntrate.modificato
                ? modificaEntrata()
                : ((erroreModifica = true), (bottonePremuto = false))
              : creaEntrata();
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
import moment from "moment";

const route = useRoute();
useHead({
  title: "Money Mind | Entrate " + route.params.id,
});
definePageMeta({
  middleware: "controllo-id",
});
const loading = ref(false);
const errore = ref(null);
let entrate = ref([]);
let nomeEntrataModifica = ref("");
let categorie = ref([]);
let submit = ref(false);
let erroreModifica = ref(false);
let visualizzaCrea = ref(false);
let visualizzaModifica = ref(false);
let datiEntrate = ref({
  id: 0,
  nome: "",
  soldi: 0,
  data: null,
  categoria: "",
  entrate: true,
  modificato: false,
  mese: route.params.id,
});
let bottonePremuto = ref(false);
let erroreMese = ref(false);
const mesi = {
  gennaio: 0,
  febbraio: 1,
  marzo: 2,
  aprile: 3,
  maggio: 4,
  giugno: 5,
  luglio: 6,
  agosto: 7,
  settembre: 8,
  ottobre: 9,
  novembre: 10,
  dicembre: 11,
};
const toast = useToast();
const confirm = useConfirm();
const { isMobile } = useDevice();

const formatDateOnly = (value) => {
  const parsed = moment(value);
  return parsed.isValid() ? parsed.format("YYYY-MM-DD") : null;
};

const caricaDati = async () => {
  loading.value = true;
  errore.value = null;
  try {
    const [entrateData, categorieData] = await Promise.all([
      $fetch("/api/entrate-uscite/prendiTutti", { method: "POST", body: { mese: route.params.id, entrate: true } }),
      $fetch("/api/categorie/prendiTutti", { method: "POST", body: { entrate: true } }),
    ]);
    entrate.value = entrateData ?? [];
    categorie.value = categorieData ?? [];
  } catch (err) {
    if (import.meta.dev) console.error("Errore caricamento entrate mese:", err);
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

const creaEntrata = async () => {
  if (mesi[route.params.id] !== moment(datiEntrate.value.data).month())
    erroreMese.value = true;
  else erroreMese.value = false;
  submit.value = true;
  if (
    datiEntrate.value.nome?.length > 0 &&
    datiEntrate.value.soldi > 0 &&
    moment(datiEntrate.value.data).isValid() &&
    datiEntrate.value.categoria?.length > 0 &&
    !erroreMese.value
  ) {
    visualizzaCrea.value = false;
    bottonePremuto.value = false;
    try {
      await $fetch("/api/entrate-uscite/crea", {
        method: "POST",
        body: {
          ...datiEntrate.value,
          data: formatDateOnly(datiEntrate.value.data),
        },
      });
      cancellaDati();
      toast.add({ severity: "success", summary: "Conferma", detail: "Creazione effettuata con successo", life: 3000 });
      entrate.value = await $fetch("/api/entrate-uscite/prendiTutti", {
        method: "POST",
        body: { mese: route.params.id, entrate: true },
      });
    } catch (err) {
      if (import.meta.dev) console.error("Errore creazione entrata:", err);
      toast.add({ severity: "error", summary: "Errore server", detail: "Impossibile creare l'entrata. Riprova.", life: 4000 });
    }
  }
  bottonePremuto.value = false;
};

const modificaEntrata = async () => {
  if (mesi[route.params.id] !== moment(datiEntrate.value.data).month())
    erroreMese.value = true;
  else erroreMese.value = false;
  submit.value = true;
  if (
    datiEntrate.value.nome?.length > 0 &&
    datiEntrate.value.soldi > 0 &&
    moment(datiEntrate.value.data).isValid() &&
    datiEntrate.value.categoria?.length > 0 &&
    !erroreMese.value
  ) {
    visualizzaCrea.value = false;
    bottonePremuto.value = false;
    visualizzaModifica.value = false;
    try {
      await $fetch("/api/entrate-uscite/modifica", {
        method: "POST",
        body: {
          ...datiEntrate.value,
          data: formatDateOnly(datiEntrate.value.data),
        },
      });
      cancellaDati();
      toast.add({ severity: "success", summary: "Conferma", detail: "Modifica effettuata con successo", life: 3000 });
      entrate.value = await $fetch("/api/entrate-uscite/prendiTutti", {
        method: "POST",
        body: { mese: route.params.id, entrate: true },
      });
    } catch (err) {
      if (import.meta.dev) console.error("Errore modifica entrata:", err);
      toast.add({ severity: "error", summary: "Errore server", detail: "Impossibile modificare l'entrata. Riprova.", life: 4000 });
    }
  }
  bottonePremuto.value = false;
};

const eliminaEntrata = (entrata) => {
  confirm.require({
    message: "Sei sicuro di voler eliminare l'entrata " + entrata.nome,
    header: "Eliminazione entrata",
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
        await $fetch("/api/entrate-uscite/elimina", { method: "POST", body: { id: entrata.id, entrate: true } });
        toast.add({ severity: "success", summary: "Conferma", detail: "Eliminazione effettuata con successo", life: 3000 });
        entrate.value = await $fetch("/api/entrate-uscite/prendiTutti", {
          method: "POST",
          body: { mese: route.params.id, entrate: true },
        });
      } catch (err) {
        if (import.meta.dev) console.error("Errore eliminazione entrata:", err);
        toast.add({ severity: "error", summary: "Errore server", detail: "Impossibile eliminare l'entrata. Riprova.", life: 4000 });
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
  datiEntrate.value.nome = "";
  datiEntrate.value.soldi = 0;
  datiEntrate.value.categoria = "";
  datiEntrate.value.data = null;
  submit.value = false;
  erroreModifica.value = false;
};
</script>

<style>
.root {
  min-height: 100%;
  width: 100%;
}
</style>
