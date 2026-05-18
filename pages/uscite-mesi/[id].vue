<template>
  <div>
    <NuxtLayout name="sidebar">
      <Card
        :class="isMobile ? 'h-full w-full' : 'cardPrincipale'"
        :pt="{ content: 'h-full', body: 'h-full' }">
        <template #content>
          <DataTable
            selectionMode="single"
            @rowSelect="
              visualizzaModifica = true;
              visualizzaCrea = true;
              datiUscite = { ...$event.data };
              nomeUscitaModifica = datiUscite.nome;
            "
            paginator
            :rows="5"
            :rowsPerPageOptions="[5, 10, 20, 50]"
            :pt="{ root: 'root' }"
            :value="uscite">
            <template #header>
              <div
                class="flex lg:flex-row flex-column justify-content-between align-items-center">
                <h2 style="font-size: 32px" class="lg:text-2xl mb-3">
                  Uscite di {{ route.params.id }}
                </h2>
                <div style="float: right">
                  <Button
                    @click="
                      visualizzaCrea = true;
                      visualizzaModifica = false;
                    "
                    class="lg:text-base text-xl">
                    <i class="fa-solid fa-plus"></i>
                    Aggiungi uscita in
                    {{ route.params.id }}
                  </Button>
                </div>
              </div>
            </template>
            <template #empty>
              <h3 class="text-center">Non ci sono elementi disponibili</h3>
            </template>
            <Column sortable field="nome" header="Nome"></Column>
            <Column sortable field="soldi" header="Soldi"></Column>
            <Column sortable field="data" header="Data"></Column>
            <Column sortable field="categoria" header="Categoria"></Column>
            <Column>
              <template #body="slotProps">
                <Button
                  severity="danger"
                  @click="eliminaUscita(slotProps.data)">
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
          ? 'Modifica uscita ' + nomeUscitaModifica
          : 'Crea una nuova uscita'
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
            <label for="nomeUscita" class="mr-3 font-semibold w-24 text-center">
              Nome
            </label>
            <InputText
              id="nomeUscita"
              v-model="datiUscite.nome"
              class="flex-auto w-full"
              autocomplete="off"
              @keydown="datiUscite.modificato = true"
              :update:modelValue="
                datiUscite.nome?.length > 45
                  ? (datiUscite.nome = datiUscite.nome.substring(0, 45))
                  : null
              " />
          </span>
          <small
            v-if="(!datiUscite.nome || datiUscite.nome.length === 0) && submit">
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
              v-model="datiUscite.soldi"
              mode="currency"
            locale="it-IT"
              class="w-full"
              currency="EUR"
              @keydown="datiUscite.modificato = true" />
          </span>
          <small v-if="datiUscite.soldi <= 0 && submit">
            Soldi Uscita richiesti o negativi
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
              v-model="datiUscite.data"
              showIcon
              class="flex-auto w-full"
              dateFormat="dd/mm/yy"
              @update:modelValue="datiUscite.modificato = true" />
          </span>
          <small
            v-if="
              (datiUscite.data === null ||
                !moment(datiUscite.data).isValid()) &&
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
              v-model="datiUscite.categoria"
              :options="categorie"
              placeholder="Seleziona la categoria"
              class="w-full"
              @change="datiUscite.modificato = true">
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
          <small v-if="datiUscite.categoria === '' && submit">
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
              ? datiUscite.modificato
                ? modificaUscita()
                : ((erroreModifica = true), (bottonePremuto = false))
              : creaUscita();
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
import { useConfirm } from "primevue";

const route = useRoute();
useHead({
  title: "Money Mind | Uscite " + route.params.id,
});
definePageMeta({
  middleware: "controllo-id",
});
let uscite = ref();
let nomeUscitaModifica = ref("");
let categorie = ref();
let submit = ref(false);
let erroreModifica = ref(false);
let visualizzaCrea = ref(false);
let visualizzaModifica = ref(false);
let datiUscite = ref({
  id: 0,
  nome: "",
  soldi: 0,
  data: null,
  categoria: "",
  uscite: true,
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

onMounted(async () => {
  try {
    uscite.value = await $fetch("/api/entrate-uscite/prendiTutti", {
      method: "POST",
      body: {
        mese: route.params.id,
        entrate: false,
      },
    });
    categorie.value = await $fetch("/api/categorie/prendiTutti", {
      method: "POST",
      body: { entrate: false },
    });
  } catch (error) {}
  if (isMobile)
    document.querySelector("body").style.backgroundColor =
      "var(--p-card-background)";
});

const creaUscita = async () => {
  if (mesi[route.params.id] !== moment(datiUscite.value.data).month())
    erroreMese.value = true;
  else erroreMese.value = false;
  submit.value = true;
  if (
    datiUscite.value.nome?.length > 0 &&
    datiUscite.value.soldi > 0 &&
    moment(datiUscite.value.data).isValid() &&
    datiUscite.value.categoria?.length > 0 &&
    !erroreMese.value
  ) {
    visualizzaCrea.value = false;
    bottonePremuto.value = false;
    await $fetch("/api/entrate-uscite/crea", {
      method: "POST",
      body: { ...datiUscite.value, entrate: false },
    });
    cancellaDati();
    toast.add({
      severity: "success",
      summary: "Conferma",
      detail: "Creazione effettuata con successo",
      life: 3000,
    });
    uscite.value = await $fetch("/api/entrate-uscite/prendiTutti", {
      method: "POST",
      body: {
        mese: route.params.id,
        entrate: false,
      },
    });
  }
  bottonePremuto.value = false;
};

const modificaUscita = async () => {
  if (mesi[route.params.id] !== moment(datiUscite.data).month())
    erroreMese.value = true;
  else erroreMese.value = false;
  submit.value = true;
  if (
    datiUscite.value.nome?.length > 0 &&
    datiUscite.value.soldi > 0 &&
    moment(datiUscite.data).isValid() &&
    datiUscite.value.categoria?.length > 0 &&
    !erroreMese.value
  ) {
    visualizzaCrea.value = false;
    bottonePremuto.value = false;
    visualizzaModifica.value = false;
    await $fetch("/api/entrate-uscite/modifica", {
      method: "POST",
      body: { ...datiUscite.value, entrate: false },
    });
    cancellaDati();
    toast.add({
      severity: "success",
      summary: "Conferma",
      detail: "Modifica effettuata con successo",
      life: 3000,
    });
    uscite.value = await $fetch("/api/entrate-uscite/prendiTutti", {
      method: "POST",
      body: {
        mese: route.params.id,
        entrate: false,
      },
    });
  }
  bottonePremuto.value = false;
};

const eliminaUscita = (uscita) => {
  confirm.require({
    message: "Sei sicuro di voler eliminare l'uscita " + uscita.nome,
    header: "Eliminazione uscita",
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
      await $fetch("/api/entrate-uscite/elimina", {
        method: "POST",
        body: {
          id: uscita.id,
          entrate: false,
        },
      });
      toast.add({
        severity: "success",
        summary: "Conferma",
        detail: "Eliminazione effettuata con successo",
        life: 3000,
      });
      uscite.value = await $fetch("/api/entrate-uscite/prendiTutti", {
        method: "POST",
        body: {
          mese: route.params.id,
          entrate: false,
        },
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
  datiUscite.value.nome = "";
  datiUscite.value.soldi = 0;
  datiUscite.value.categoria = "";
  datiUscite.value.data = null;
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
