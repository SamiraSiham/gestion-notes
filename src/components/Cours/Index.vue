<script setup lang="ts">
import { onMounted } from "vue";
import axios, { AxiosError } from "axios";
import { useSidebarProvider } from "../../composables/useSidebar";
import { ref } from "vue";
useSidebarProvider();
const errorMessage = ref<string>("");
const cours: any = ref([]);
onMounted(async () => {
  // console.log(`id prof : ${props.id}`);
  const token = localStorage.getItem("token");
  if (!token) return;
  try {
    errorMessage.value = "";
    await axios
      .get("http://localhost:3005/api/cours/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        // console.log(res.data?.cours);
        cours.value = res.data?.cours;
        // console.log(cours.value);
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
  <admin-layout>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <h1 class="text-black text-4xl text-left py-4 px-2">Liste de Cours</h1>
      <button
        class="group bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded flex flex-row flex-nowrap items-center"
      >
        <router-link :to="`/cours/create`" class="flex items-center gap-x-2">
          Ajouter
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="stroke-blue-700 group-hover:stroke-white"
          >
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g
              id="SVGRepo_tracerCarrier"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></g>
            <g id="SVGRepo_iconCarrier">
              <path
                d="M6 12H18M12 6V18"
                class="stroke-blue-700 group-hover:stroke-white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></path>
            </g>
          </svg>
        </router-link>
      </button>
    </div>
    <div
      class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"
    >
      <div class="max-w-full overflow-x-auto custom-scrollbar">
        <table class="min-w-full">
          <thead>
            <tr class="border-b border-gray-200 dark:border-gray-700">
              <th class="px-5 py-3 text-left w-3/11 sm:px-6">
                <p
                  class="font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center"
                >
                  Titre de cours
                </p>
              </th>
              <th class="px-5 py-3 text-left w-2/11 sm:px-6">
                <p
                  class="font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center"
                >
                  Description
                </p>
              </th>
              <th class="px-5 py-3 text-left w-2/11 sm:px-6">
                <p
                  class="font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center"
                >
                  Niveau
                </p>
              </th>
              <th class="px-5 py-3 text-left w-2/11 sm:px-6">
                <p
                  class="font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center"
                >
                  Date Début
                </p>
              </th>
              <th class="px-5 py-3 text-left w-2/11 sm:px-6">
                <p
                  class="font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center"
                >
                  Date fin
                </p>
              </th>
              <th class="px-5 py-3 text-left w-2/11 sm:px-6">
                <p
                  class="font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center"
                >
                  Actions
                </p>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="(c, i) in cours"
              :key="i"
              class="border-t border-gray-100 dark:border-gray-800"
            >
              <td class="px-5 py-4 sm:px-6">
                <div class="flex items-center gap-3">
                  <div class="text-center">
                    <p
                      class="text-gray-800 text-theme-sm dark:text-gray-400 text-left"
                    >
                      {{ c.titre }}
                    </p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-4 sm:px-6">
                <p
                  class="text-gray-800 text-theme-sm dark:text-gray-400 text-left"
                >
                  {{ c.description }}
                </p>
              </td>
              <td class="px-5 py-4 sm:px-6">
                <span
                  class="block font-medium text-gray-800 text-theme-sm dark:text-white/90"
                >
                  {{ c.niveau }}
                </span>
              </td>
              <td class="px-5 py-4 sm:px-6">
                <span
                  class="block font-medium text-gray-800 text-theme-sm dark:text-white/90"
                >
                  {{ formatDate(c.date_debut) }}
                </span>
              </td>
              <td class="px-5 py-4 sm:px-6">
                <span
                  class="block font-medium text-gray-800 text-theme-sm dark:text-white/90"
                >
                  {{ formatDate(c.date_fin) }}
                </span>
              </td>
              <td class="px-5 py-4 sm:px-6">
                <span
                  class="block font-medium text-gray-800 text-theme-sm dark:text-white/90"
                >
                  <router-link
                    :to="`/cours/${c._id}`"
                    class="text-blue-500 underline"
                  >
                    Details
                  </router-link>
                  Delete
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </admin-layout>
</template>
<script lang="ts">

import AdminLayout from "../layout/AdminLayout.vue";
import { formatDate } from "@fullcalendar/core";

export default {
  components: {
    AdminLayout,
  },
};
</script>
