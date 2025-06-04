<template>
  <admin-layout>
  <div>
    <div
      class="p-5 mb-6 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6"
    >
      <button
        class="group bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-5 border border-blue-500 hover:border-transparent rounded flex items-center"
      >
        <router-link :to="`/cours`" class="flex items-center gap-x-2">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            class="stroke-blue-700 group-hover:stroke-white"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g
              id="SVGRepo_tracerCarrier"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></g>
            <g id="SVGRepo_iconCarrier">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M15.7071 4.29289C16.0976 4.68342 16.0976 5.31658 15.7071 5.70711L9.41421 12L15.7071 18.2929C16.0976 18.6834 16.0976 19.3166 15.7071 19.7071C15.3166 20.0976 14.6834 20.0976 14.2929 19.7071L7.29289 12.7071C7.10536 12.5196 7 12.2652 7 12C7 11.7348 7.10536 11.4804 7.29289 11.2929L14.2929 4.29289C14.6834 3.90237 15.3166 3.90237 15.7071 4.29289Z"
                class="fill-blue-700 group-hover:fill-white"
              ></path>
            </g>
          </svg>
          Retourner
        </router-link>
      </button>
      <div class="flex flex-col gap-5">
      <!-- Informations du cours -->
        <div class="flex flex-col items-center w-full gap-6">
          <div class="order-3 xl:order-2">
            <h4 class="mb-2 text-2xl font-semibold text-center text-gray-800">
              {{ cours.titre }}
            </h4>
            <div
              class="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3"
            >
              <p class="text-md text-gray-500">
                {{ cours.description }}
              </p>
              <div
                class="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"
              ></div>
              <p class="text-md text-gray-500">Niveau : {{ cours.niveau }}</p>
            </div>
          </div>
        </div>
      </div>
      <!-- Parties de cours -->
      <div>
        <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h4 class="text-black text-2xl text-center py-4 px-2">
            Parties de Cours
          </h4>
          <button
            class="group bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded flex flex-row flex-nowrap items-center"
          >
            <router-link
              :to="`/cours/create`"
              class="flex items-center gap-x-2"
            >
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
        <div class="max-w-full overflow-x-auto custom-scrollbar">
          <table class="min-w-full">
            <thead>
              <tr class="border-b border-gray-200 dark:border-gray-700">
                <th class="px-5 py-3 text-left w-3/11 sm:px-6">
                  <p
                    class="font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center"
                  >
                    Titre de partie
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
                    Ordre
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
                v-for="(c, i) in parties"
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
                    {{ c.ordre }}
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
      <!-- Eleves inscrits dans le cours -->
      <div>
        <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h4 class="text-black text-2xl text-center py-4 px-2">
            Eleves inscrits
          </h4>
          <button
            class="group bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded flex flex-row flex-nowrap items-center"
          >
            <router-link
              :to="`/cours/create`"
              class="flex items-center gap-x-2"
            >
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
        <div class="max-w-full overflow-x-auto custom-scrollbar">
          <table class="min-w-full">
            <thead>
              <tr class="border-b border-gray-200 dark:border-gray-700">
                <th class="px-5 py-3 text-left w-3/11 sm:px-6">
                  <p
                    class="font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center"
                  >
                    Nom
                  </p>
                </th>
                <th class="px-5 py-3 text-left w-2/11 sm:px-6">
                  <p
                    class="font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center"
                  >
                    Prenom
                  </p>
                </th>
                <th class="px-5 py-3 text-left w-2/11 sm:px-6">
                  <p
                    class="font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center"
                  >
                    Date de naissance
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
                v-for="(c, i) in eleves"
                :key="i"
                class="border-t border-gray-100 dark:border-gray-800"
              >
                <td class="px-5 py-4 sm:px-6">
                  <div class="flex items-center gap-3">
                    <div class="text-center">
                      <p
                        class="text-gray-800 text-theme-sm dark:text-gray-400 text-left"
                      >
                        {{ c.nom }}
                      </p>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-4 sm:px-6">
                  <p
                    class="text-gray-800 text-theme-sm dark:text-gray-400 text-left"
                  >
                    {{ c.prenom }}
                  </p>
                </td>
                <td class="px-5 py-4 sm:px-6">
                  <span
                    class="block font-medium text-gray-800 text-theme-sm dark:text-white/90"
                  >
                    {{ formatDate(c.date_naissance) }}
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
    </div>
  </div>
  </admin-layout>
</template>

<script setup lang="ts">
import AdminLayout from "../layout/AdminLayout.vue";
import { onMounted } from "vue";
import { ref } from "vue";
import { formatDate } from "@fullcalendar/core";
import axios, { AxiosError } from "axios";
const coursResponse: any = ref({});
const cours: any = ref({});
const eleves: any = ref({});
const parties: any = ref({});
const props = defineProps({
  id: String,
});
// const isProfileInfoModal = ref(false);
const errorMessage = ref<string>("");
const message = ref<string>("");

// const saveProfile = () => {
//   // Implement save profile logic here
//   console.log('Profile saved')
//   isProfileInfoModal.value = false
// }
const getCoursById = async () => {
  const token = localStorage.getItem("token");
  if (!token) return;
  try {
    errorMessage.value = "";
    await axios
      .get(`http://localhost:3005/api/cours/${props.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        // console.log(res);
        coursResponse.value = res.data;
        // console.log(coursResponse.value);
      })
      .then(() => {
        cours.value = coursResponse.value?.cours;
        eleves.value = coursResponse.value?.eleves;
        parties.value = coursResponse.value?.parties;
      });
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    errorMessage.value = err.response?.data?.message || "Unknown error";
    console.log(errorMessage.value);
    message.value = errorMessage.value;
  }
};
onMounted(() => {
  // console.log(props.id);
  getCoursById();
});
</script>
