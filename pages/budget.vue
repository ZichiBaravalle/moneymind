<template>
  <div>
    <NuxtLayout name="sidebar">
      <Card
        :style="isMobile ? 'box-shadow: none;' : ''"
        :class="isMobile ? 'h-full w-full' : 'cardPrincipale'">
        <template #title>
          <div
            class="flex lg:flex-row flex-column justify-content-between align-items-center">
            <h2 style="font-size: 26px" class="lg:text-2xl mb-3">
              Budget - {{ nomeUtente }}
            </h2>
            <Button
              @click="
                visualizzaCrea = true;
                visualizzaModifica = false;
                erroreEsisteGia = false;
              "
              class="h-min">
              <i class="fa-solid fa-plus"></i>
              Aggiungi budget
            </Button>
          </div>
          <Divider />
        </template>
        <template #content>
          <DataView
            :value="budget"
            layout="grid"
            :pt="
              isMobile
                ? { content: 'w-full' }
                : { content: 'w-full grid-custom' }
            ">
            <template #empty>
              <h3 class="text-center">Non ci sono elementi disponibili</h3>
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
                :style="
                  item.soldiUsati >= item.soldiMassimi
                    ? 'border: 4px red solid'
                    : 'border: 4px green solid'
                "
                class="w-full h-18rem text-center lg:mb-0 mb-4"
                v-for="item in slotProps.items">
                <template #title>
                  <span class="text-4xl">{{ item.nome }}</span>
                </template>
                <template #content>
                  <div class="mb-3">
                    Limite budget: {{ item.soldiMassimi }}€
                  </div>
                  <div class="mb-3">Soldi usati: {{ item.soldiUsati }}€</div>
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
                      datiBudget.id = item.id;
                      datiBudget.nome = item.nome;
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
                      datiBudget.id = item.id;
                      datiBudget.nome = item.nome;
                      nomeVecchioBudget = item.nome;
                      datiBudget.soldiMassimi = item.soldiMassimi;
                      datiBudget.soldiUsati = item.soldiUsati;
                      datiBudget.contoCollegato = item.contoCollegato;
                      datiBudget.soldiUscita = item.soldiUscita
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
      :style="isMobile ? 'width: 95vw; height: 80%' : ''"
      v-model:visible="visualizzaCrea"
      modal
      :header="
        visualizzaModifica
          ? 'Modifica budget ' + nomeVecchioBudget
          : 'Crea un nuovo budget'
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
              for="nomeBudget"
              class="mr-3 font-semibold lg:w-24 w-7rem text-center">
              Nome
            </label>
            <InputText
              id="nomeBudget"
              v-model="datiBudget.nome"
              class="flex-auto w-full"
              autocomplete="off"
              @keydown="datiBudget.modificato = true"
              :update:modelValue="
                datiBudget.nome?.length > 45
                  ? (datiBudget.nome = datiBudget.nome.substring(0, 45))
                  : null
              " />
          </span>
          <small
            v-if="(!datiBudget.nome || datiBudget.nome.length === 0) && submit">
            Nome richesto
          </small>
        </div>
        <div class="flex flex-column align-items-center">
          <span class="flex align-items-center mb-1 w-full">
            <label
              for="budgetSoldiMassimi"
              class="mr-3 font-semibold w-24 text-center">
              Soldi massimi
            </label>
            <InputNumber
              id="budgetSoldiMassimi"
              v-model="datiBudget.soldiMassimi"
              mode="currency"
            locale="it-IT"
              class="w-full"
              currency="EUR"
              @keydown="datiBudget.modificato = true" />
          </span>
          <small v-if="datiBudget.soldiMassimi <= 0 && submit">
            budget soldi richesto o negativi
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
            for="budgetsoldiUsati"
            class="mr-3 font-semibold w-24 text-center">
            Soldi usati
          </label>
          <Slider
            v-if="opzioneInput.value === 'slider'"
            id="budgetsoldiUsati"
            v-model="datiBudget.soldiUsati"
            class="w-full"
            :max="datiBudget.soldiMassimi"
            @change="datiBudget.modificato = true" />
          <InputNumber
            v-if="opzioneInput.value === 'number'"
            id="budgetSoldiCrea"
            v-model="datiBudget.soldiUsati"
            mode="currency"
            locale="it-IT"
            currency="EUR"
            class="w-full"
            @keyDown="datiBudget.modificato = true" />
          <span
            v-if="opzioneInput.value === 'slider'"
            style="white-space: nowrap"
            class="ml-3 text-xl mb-1">
            {{ datiBudget.soldiUsati || 0 }} €
          </span>
        </span>
        <small v-if="datiBudget.soldiUsati < 0 && submit">
          Soldi usati richiesti o negativi
        </small>
      </div>
      <div
        class="flex mb-4 w-full"
        :class="
          isMobile
            ? 'flex-column gap-3 aling-items-center justify-content-center'
            : 'align-items-center'
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
                !datiBudget.ripetizioneModificata && visualizzaModifica
              "
              v-on:update:modelValue="datiBudget.modificato = true"
              :step="1"
              class="flex-auto lg:w-full w-5rem"
              id="budgetRipetizione"
              v-model="datiBudget.periodoRipetizione"
              @keyDown="datiBudget.modificato = true"
              fluid
              :min="0"
              :max="31" />
            <Select
              v-model="datiBudget.periodoNome"
              :options="periodo"
              :disabled="
                !datiBudget.ripetizioneModificata && visualizzaModifica
              "
              v-on:update:model-value="datiBudget.modificato = true"
              @change="datiBudget.modificato = true"
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
              v-model="datiBudget.ripetizioneModificata"
              :binary="true" />
          </span>
        </span>
        <small
          class="lg:ml-2 text-center"
          v-if="
            (datiBudget.periodoRipetizione < 0 || !datiBudget.periodoNome) &&
            submit &&
            (datiBudget.ripetizioneModificata || !visualizzaModifica)
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
            v-model="datiBudget.dataIniziale"
            showIcon
            class="flex-auto w-full"
            dateFormat="dd/mm/yy" />
        </span>
        <small
          v-if="
            (!datiBudget.dataIniziale ||
              !moment(datiBudget.dataIniziale).isValid()) &&
            submit
          ">
          Data iniziale richiesta
        </small>
      </div>
      <div
        class="flex mb-4 w-full"
        :class="
          isMobile
            ? 'flex-column gap-3 align-items-center justify-content-center'
            : 'align-items-center justify-content-between'
        ">
        <label
          for="nomeCreaCategoria"
          class="mr-3 font-semibold w-24 text-center">
          Conto da associare
        </label>
        <Select
          v-model:model-value="datiBudget.contoCollegato"
          :options="conti"
          optionLabel="nome"
          :modelValue="datiBudget.contoCollegato"
          placeholder="Seleziona il conto da associare o lascia vuoto"
          fluid
          class="w-full"
          showClear
          @change="datiBudget.modificato = true">
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
          Un budget con questo nome esiste già
        </small>
        <Button
          type="button"
          class="font-bold"
          severity="save"
          :disabled="bottonePremuto"
          @click="
            bottonePremuto = true;
            visualizzaModifica
              ? datiBudget.modificato
                ? modificabudget()
                : ((erroreModifica = true), (bottonePremuto = false))
              : creabudget();
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
  title: "Money Mind | Budget",
});
let budget = ref();
let conti = ref();
let opzioneInput = ref({
  value: "slider",
  icon: "fa-solid fa-slider",
});
let submit = ref(false);
let erroreModifica = ref(false);
let erroreEsisteGia = ref(false);
let visualizzaCrea = ref(false);
let visualizzaModifica = ref(false);
let datiBudget = ref({
  id: 0,
  nome: "",
  soldiMassimi: 0,
  soldiUsati: 0,
  periodoRipetizione: null,
  periodoNome: "",
  ripetizioneModificata: false,
  dataIniziale: new Date(),
  modificato: false,
});
let bottonePremuto = ref(false);
const nomeVecchioBudget = ref();
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

onMounted(async () => {
  try {
    budget.value = await $fetch("/api/budget/prendiTutti");
    conti.value = await $fetch("/api/conti/prendiTutti");
  } catch (error) {}
  if (isMobile)
    document.querySelector("body").style.backgroundColor =
      "var(--p-card-background)";
});

const apriInfoModRipetizione = (event) => {
  infoRip.value.toggle(event);
};

const creabudget = async () => {
  if (budget.value.find((b) => b.nome.trim() === datiBudget.value.nome.trim()))
    erroreEsisteGia.value = true;
  else erroreEsisteGia.value = false;
  submit.value = true;
  if (
    datiBudget.value.nome?.length > 0 &&
    datiBudget.value.soldiMassimi > 0 &&
    datiBudget.value.soldiUsati >= 0 &&
    datiBudget.value.periodoRipetizione &&
    datiBudget.value.periodoNome &&
    datiBudget.value.dataIniziale &&
    moment(datiBudget.value.dataIniziale).isValid() &&
    !erroreEsisteGia.value
  ) {
    visualizzaCrea.value = false;
    bottonePremuto.value = false;
    await $fetch("/api/budget/crea", {
      method: "POST",
      body: datiBudget.value,
    });
    cancellaDati();
    toast.add({
      severity: "success",
      summary: "Conferma",
      detail: "Creazione effettuata con successo",
      life: 3000,
    });
    budget.value = await $fetch("/api/budget/prendiTutti");
  }
  bottonePremuto.value = false;
};

const modificabudget = async () => {
  erroreModifica.value = false;
  if (
    budget.value.find(
      (b) =>
        b.nome.trim() === datiBudget.value.nome.trim() &&
        b.id !== datiBudget.value.id
    )
  )
    erroreEsisteGia.value = true;
  else erroreEsisteGia.value = false;
  let errore = false;
  if (datiBudget.value.ripetizioneModificata)
    if (
      !(
        datiBudget.value.periodoRipetizione &&
        datiBudget.value.periodoNome.length > 0
      )
    )
      errore = true;
  if (
    datiBudget.value.nome?.length > 0 &&
    datiBudget.value.soldiUsati >= 0 &&
    datiBudget.value.soldiMassimi > 0 &&
    !errore &&
    !erroreEsisteGia.value
  ) {
    visualizzaCrea.value = false;
    bottonePremuto.value = false;
    visualizzaModifica.value = false;
    await $fetch("/api/budget/modifica", {
      method: "POST",
      body: datiBudget.value,
    });
    toast.add({
      severity: "success",
      summary: "Conferma",
      detail: "Modifica effettuata con successo",
      life: 3000,
    });
    budget.value = await $fetch("/api/budget/prendiTutti");
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
      toast.add({
        severity: "success",
        summary: "Conferma",
        detail: "Eliminazione effettuata con successo",
        life: 3000,
      });
      await $fetch("/api/budget/elimina", {
        method: "POST",
        body: datiBudget.value,
      });
      budget.value = await $fetch("/api/budget/prendiTutti");
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
  if (!datiBudget.value.modificato) {
    erroreModifica.value = false;
    setTimeout(() => {
      datiBudget.value.contoCollegato = conti.value.find(
        (c) => c.nome === datiBudget.value.contoCollegato
      );
    }, 10);
  }
};

const cancellaDati = () => {
  datiBudget.value.nome = "";
  datiBudget.value.soldiMassimi = 0;
  datiBudget.value.soldiUsati = 0;
  datiBudget.value.periodoRipetizione = null;
  datiBudget.value.periodoNome = "";
  datiBudget.value.ripetizioneModificata = false;
  datiBudget.value.modificato = false;
  datiBudget.value.dataIniziale = new Date();
  datiBudget.value.contoCollegato = null;
  submit.value = false;
  erroreModifica.value = false;
};
</script>

<style></style>
