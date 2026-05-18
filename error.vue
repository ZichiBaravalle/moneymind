<template>
  <div class="h-full w-full flex align-items-center justify-content-center">
    <Card
      id="card"
      :pt="{ title: 'text-center', content: 'text-center text-xl', footer: 'text-center text-xl' }"
    >
      <template #title>
        <h1>Errore {{ error?.statusCode || '500' }}</h1>
      </template>
      <template #content>
        <p>{{ error?.statusMessage || 'Errore non identificato' }}</p>
      </template>
      <template #footer>
        <Button class="font-bold text-xl" @click="clearError({ redirect: '/' })">Ritorna al login</Button>
      </template>
    </Card>
  </div>
</template>

<script setup>
defineProps({
  error: Object,
});
</script>

<style>
#card {
  height: 350px;
  width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

#__nuxt {
  height: 100vh;
}
</style>
