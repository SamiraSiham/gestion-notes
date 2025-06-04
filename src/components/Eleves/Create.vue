<script setup lang="ts">
import { useRouter } from "vue-router";
import axios, { AxiosError } from "axios";
import { useSidebarProvider } from "../../composables/useSidebar";
import { ref, onMounted } from "vue";
const router = useRouter();
const formData = {
  nom: "",
  prenom: "",
  date_naissance: "",
  classe_id: "",
};
useSidebarProvider();
const errorMessage = ref<string>("");
const message = ref<string>("");
const classes: any = ref([]);
const getClasses = async () => {
  const token = localStorage.getItem("token");
  if (!token) return;
  try {
    errorMessage.value = "";
    await axios
      .get("http://localhost:3005/api/classes/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        // console.log(res);
        classes.value = res.data.classes;
        console.log(classes.value);
      });
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    errorMessage.value = err.response?.data?.message || "Unknown error";
    console.log(errorMessage.value);
    message.value = errorMessage.value;
  }
};
const handleSubmit = async () => {
  const token = localStorage.getItem("token");
  if (!token) return;
  try {
    errorMessage.value = "";
    await axios
      .post("http://localhost:3005/api/eleves/", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        console.log(res);
        router.push(`/eleves`);
      });
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    errorMessage.value = err.response?.data?.message || "Unknown error";
    console.log(errorMessage.value);
    message.value = errorMessage.value;
  }
// console.log(formData);
};
onMounted(async ()=>{
    getClasses();
})
</script>
<template>
  <admin-layout>
    <div class="flex items-center justify-between">
      <h1 class="text-black text-4xl text-left py-4 px-2">
        Inscriver un Eleve
      </h1>
      <button
        class="group bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-5 border border-blue-500 hover:border-transparent rounded flex items-center"
      >
        <router-link :to="`/eleves`" class="flex items-center gap-x-2">
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
    </div>
    <div class="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div
        class="rounded-2xl border border-gray-200 bg-white grid grid-cols-1 gap-4"
      >
        <!-- Nom d'eleve -->
        <div class="pt-4 pb-2 px-4">
          <label class="mb-2 block text-sm font-medium text-gray-700 text-left">
            Nom
          </label>
          <input
            v-model="formData.nom"
            type="text"
            placeholder="Nom d'eleve"
            class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10"
          />
        </div>
        <!-- Prenom d'eleve -->
        <div class="py-2 px-4">
          <label class="mb-2 block text-sm font-medium text-gray-700 text-left">
            Prenom
          </label>
          <input
            v-model="formData.prenom"
            type="text"
            placeholder="Prenom d'eleve"
            class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10"
          />
        </div>
        <!-- Classe -->
        <div class="py-2 px-4">
          <label class="mb-2 block text-sm font-medium text-gray-700 text-left">
            Classe
          </label>
          <div class="relative z-20 bg-transparent">
            <select
              v-model="formData.classe_id"
              class="h-11 w-full text-gray-800 appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10"
            >
              <option value="" disabled selected>Select Option</option>
              <option v-for="i in classes" :key="i._id" :value="i._id"> {{ i.nom_classe }}</option>
            </select>
            <span
              class="absolute z-30 text-gray-500 -translate-y-1/2 pointer-events-none right-4 top-1/2"
            >
              <svg
                class="stroke-current"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.79175 7.396L10.0001 12.6043L15.2084 7.396"
                  stroke=""
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
          </div>
        </div>
        <!-- Date de naissance -->
        <div class="py-2 px-4">
          <label class="mb-2 block text-sm font-medium text-gray-700 text-left">
            Date de naissance
          </label>
          <div class="relative">
            <flat-pickr
              v-model="formData.date_naissance"
              :config="flatpickrConfig"
              class="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              placeholder="Select date"
            />
            <span
              class="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400"
            >
              <svg
                class="fill-current"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M6.66659 1.5415C7.0808 1.5415 7.41658 1.87729 7.41658 2.2915V2.99984H12.5833V2.2915C12.5833 1.87729 12.919 1.5415 13.3333 1.5415C13.7475 1.5415 14.0833 1.87729 14.0833 2.2915V2.99984L15.4166 2.99984C16.5212 2.99984 17.4166 3.89527 17.4166 4.99984V7.49984V15.8332C17.4166 16.9377 16.5212 17.8332 15.4166 17.8332H4.58325C3.47868 17.8332 2.58325 16.9377 2.58325 15.8332V7.49984V4.99984C2.58325 3.89527 3.47868 2.99984 4.58325 2.99984L5.91659 2.99984V2.2915C5.91659 1.87729 6.25237 1.5415 6.66659 1.5415ZM6.66659 4.49984H4.58325C4.30711 4.49984 4.08325 4.7237 4.08325 4.99984V6.74984H15.9166V4.99984C15.9166 4.7237 15.6927 4.49984 15.4166 4.49984H13.3333H6.66659ZM15.9166 8.24984H4.08325V15.8332C4.08325 16.1093 4.30711 16.3332 4.58325 16.3332H15.4166C15.6927 16.3332 15.9166 16.1093 15.9166 15.8332V8.24984Z"
                  fill=""
                />
              </svg>
            </span>
          </div>
        </div>
        <!-- Date de fin -->
        <!-- <div class="py-2 px-4">
          <label class="mb-2 block text-sm font-medium text-gray-700 text-left">
            Date de fin
          </label>
          <div class="relative">
            <flat-pickr
              v-model="formData.date_fin"
              :config="flatpickrConfig"
              class="dark:bg-dark-900 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent bg-none px-4 py-2.5 pl-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              placeholder="Select date"
            />
            <span
              class="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400"
            >
              <svg
                class="fill-current"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M6.66659 1.5415C7.0808 1.5415 7.41658 1.87729 7.41658 2.2915V2.99984H12.5833V2.2915C12.5833 1.87729 12.919 1.5415 13.3333 1.5415C13.7475 1.5415 14.0833 1.87729 14.0833 2.2915V2.99984L15.4166 2.99984C16.5212 2.99984 17.4166 3.89527 17.4166 4.99984V7.49984V15.8332C17.4166 16.9377 16.5212 17.8332 15.4166 17.8332H4.58325C3.47868 17.8332 2.58325 16.9377 2.58325 15.8332V7.49984V4.99984C2.58325 3.89527 3.47868 2.99984 4.58325 2.99984L5.91659 2.99984V2.2915C5.91659 1.87729 6.25237 1.5415 6.66659 1.5415ZM6.66659 4.49984H4.58325C4.30711 4.49984 4.08325 4.7237 4.08325 4.99984V6.74984H15.9166V4.99984C15.9166 4.7237 15.6927 4.49984 15.4166 4.49984H13.3333H6.66659ZM15.9166 8.24984H4.08325V15.8332C4.08325 16.1093 4.30711 16.3332 4.58325 16.3332H15.4166C15.6927 16.3332 15.9166 16.1093 15.9166 15.8332V8.24984Z"
                  fill=""
                />
              </svg>
            </span>
          </div>
        </div> -->
        <!-- error messages -->
        <div v-if="errorMessage">
          <span class="text-red-600">{{ message }}</span>
        </div>
        <!-- submit button -->
        <div class="py-2 px-4 flex items-center justify-end">
          <button
            @click="handleSubmit"
            class="group bg-transparent hover:bg-green-500 text-green-700 font-semibold hover:text-white py-1 px-4 border border-green-500 hover:border-transparent rounded flex items-center gap-x-1"
          >
            Ajouter
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="stroke-green-700 group-hover:stroke-white"
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
                  class="stroke-green-700 group-hover:stroke-white"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                ></path>
              </g>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </admin-layout>
</template>
<script lang="ts">
// import AdminLayout from "./layout/AdminLayout.vue";
import AdminLayout from "../layout/AdminLayout.vue";
import flatPickr from "vue-flatpickr-component";
import "flatpickr/dist/flatpickr.css";

const flatpickrConfig = {
  dateFormat: "Y-m-d",
  altInput: true,
  altFormat: "F j, Y",
  wrap: true,
};
export default {
  components: {
    AdminLayout,
  },
};
</script>
