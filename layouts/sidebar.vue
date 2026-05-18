<template>
  <div class="sidebar">
    <Button
      v-if="isMobile"
      style="position: fixed; z-index: 1; top: 10px; left: 10px"
      severity="secondary"
      rounded
      icon="fa-solid fa-bars"
      @click="visualizzaSidebar = !visualizzaSidebar" />
    <Drawer
      v-if="isMobile"
      v-model:visible="visualizzaSidebar"
      :pt="{ footer: 'flex flex-column gap-3' }">
      <template #header>
        <i
          class="fa-regular fa-square-dollar ml-2 mr-2 text-4xl text-purple-500"></i>
        <span class="text-center text-2xl">Money Mind</span>
        <i
          class="fa-regular fa-square-dollar ml-2 mr-2 text-4xl text-purple-500"></i>
      </template>
        <Menu
          :model="items"
          class="w-full"
          :pt="{
            item: 'item',
          }">
          <template #item="{ item }">
            <i
              style="float: left; margin-top: 2px"
              class="mr-2 text-purple-500"
              :class="item.icon"></i>
            <span>{{ item.label }}</span>
          </template>
        </Menu>
      <template #footer>
        <Button severity="danger" @click="logout">
          <i class="fa-solid fa-right-from-bracket"></i>
          <strong>Logout</strong>
        </Button>
        <Button
          severity="danger"
          style="float: right"
          @click="deleteAccount">
          <i class="fa-solid fa-user-large-slash"></i>
          <strong>Elimina account</strong>
        </Button>
      </template>
    </Drawer>
    <Card
      v-else
      style="
        float: right;
        width: calc(25% - 10px);
        margin: 10px;
        height: calc(100% - 40px);
      "
      :pt="{
        title: 'text-center',
        content: 'h-full content overflow-y-auto w-full',
        body: 'h-full',
        footer: 'flex flex-column gap-3',
      }">
      <template #title>
        <i
          class="fa-regular fa-square-dollar ml-2 mr-2 text-4xl text-purple-500"></i>
        <span class="text-5xl">Money Mind</span>
        <i
          class="fa-regular fa-square-dollar ml-2 mr-2 text-4xl text-purple-500"></i>
      </template>
      <template #content>
        <Menu
          :model="items"
          class="w-full"
          :pt="{
            item: 'item',
          }">
          <template #item="{ item }">
            <i
              style="float: left; margin-top: 2px"
              class="mr-2 text-purple-500"
              :class="item.icon"></i>
            <span>{{ item.label }}</span>
          </template>
        </Menu>
      </template>
      <template #footer>
        <Button severity="danger" @click="logout">
          <i class="fa-solid fa-right-from-bracket"></i>
          <strong>Logout</strong>
        </Button>
        <Button
          severity="danger"
          style="float: right"
          @click="deleteAccount">
          <i class="fa-solid fa-user-large-slash"></i>
          <strong>Elimina account</strong>
        </Button>
      </template>
    </Card>
    <slot />
  </div>
</template>

<script setup>
const confirm = useConfirm();
const toast = useToast();
const nomeUtente = ref(
  useCookie("email")
    .value.substring(0, useCookie("email").value.indexOf("@"))
    .toUpperCase()
);
const { isMobile } = useDevice();
let visualizzaSidebar = ref(false);

const deleteAccount = () => {
  confirm.require({
    message:
      "Sei sicuro di voler eliminare l'account " + nomeUtente.value + "?",
    header: "Elimina account",
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
      await $fetch("./api/eliminaAccount", {
        method: "POST",
      });
      visualizzaSidebar = !visualizzaSidebar;
      logout();
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

const items = ref([
  {
    label: "Home",
    icon: "fa-solid fa-house",
    command: () => {
      visualizzaSidebar = !visualizzaSidebar;
      navigateTo("/home");
    },
  },
  {
    label: "Conti",
    icon: "fa-solid fa-piggy-bank",
    command: () => {
      visualizzaSidebar = !visualizzaSidebar;
      navigateTo("/conti");
    },
  },
  {
    label: "Obiettivi",
    icon: "fa-solid fa-bullseye-arrow",
    command: () => {
      visualizzaSidebar = !visualizzaSidebar;
      navigateTo("/obiettivi");
    },
  },
  {
    label: "Budget",
    icon: "fa-solid fa-money-bill",
    command: () => {
      visualizzaSidebar = !visualizzaSidebar;
      navigateTo("/budget");
    },
  },
  {
    label: "Entrate fisse",
    icon: "fa-solid fa-envelope-open-dollar",
    command: () => {
      visualizzaSidebar = !visualizzaSidebar;
      navigateTo("/entrate-fisse");
    },
  },
  {
    label: "Entrate",
    icon: "fa-solid fa-chart-line-up",
    command: () => {
      visualizzaSidebar = !visualizzaSidebar;
      navigateTo("/entrate");
    },
  },
  {
    label: "Uscite",
    icon: "fa-solid fa-chart-line-down",
    command: () => {
      visualizzaSidebar = !visualizzaSidebar;
      navigateTo("/uscite");
    },
  },
]);

const logout = () => {
  const email = useCookie("email");
  email.value = "";
  const token = useCookie("token");
  token.value = "";
  navigateTo("/");
};
</script>

<style>
.p-menu {
  border: 0 !important;
  min-width: none;
}
.content {
  max-width: 643px;
}
.sidebar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100vh;
  width: 100%;
}
.item {
  border: 1px solid #3f3f46;
  border-radius: 15px;
  display: flex;
  align-items: center;
  margin-top: 10px;
  padding: 8px;
  cursor: pointer;
}
</style>
