<script lang="ts" setup>
import { useSidebar } from "../../composables/useSidebar";
const { isExpanded, isHovered } = useSidebar();
import AppSidebar from "./AppSidebar.vue";
import AppHeader from "./AppHeader.vue";
import axios, { AxiosError } from "axios";
import { onMounted, ref } from "vue";
const errorMessage = ref<string>("");
const props = defineProps({
  id: String,
});
const prof = ref({
  id: '',
  nom: '',
  prenom: '',
  email: '',
  matiere_specialite: ''
})
onMounted(async () => {
  const token = localStorage.getItem("token");
  if (!token) return;
  try {
    errorMessage.value = "";
    await axios
      .get("http://localhost:3005/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          id: props.id
        },
      })
      .then((res) => {
        // console.log(res.data.professeur);
        prof.value = {
          id: res.data.professeur._id,
          nom: res.data.professeur.nom,
          prenom: res.data.professeur.prenom,
          email: res.data.professeur.email,
          matiere_specialite: res.data.professeur.matiere_specialite,
        };
        // console.log(prof.value);
      });
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    errorMessage.value =
      err.response?.data?.message || "Login failed. Please try again.";
    console.log(errorMessage);
  }
});
</script>
<template>
  <div class="min-h-screen xl:flex">
    <app-sidebar />
    <!-- <Backdrop /> -->
    <div
      class="flex-1 transition-all duration-300 ease-in-out"
      :class="[isExpanded || isHovered ? 'lg:ml-[290px]' : 'lg:ml-[90px]']"
    >
      <app-header :prof="prof" />
      <div class="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
        <slot></slot>
      </div>
    </div>
  </div>
</template>
