<script setup lang="ts">
import axios from "axios";
// import { AxiosError } from "axios";
import { useSidebarProvider } from "../../composables/useSidebar";
import { ref, onMounted } from "vue";
import { computed } from "vue";
interface Eleve {
  id: string;
  nom: string;
  prenom: string;
  date_naissance: Date;
  id_classe: {
    _id: string;
    nom_classe: string;
  };
}
interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}
interface ApiResponse {
  eleves: Eleve[];
  pagination: Pagination;
}
useSidebarProvider();
// const errorMessage = ref<string>("");
const eleves: any = ref([]);
const pagination = ref<Pagination>({
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 10,
  hasNext: false,
  hasPrev: false,
});
const itemsPerPage = ref("10");
const jumpToPage = ref(1);
// const props = defineProps({
//   id: String,
// });
const visiblePages = computed(() => {
  const current = pagination.value.currentPage;
  const total = pagination.value.totalPages;
  const pages: number[] = [];

  // Show up to 5 pages around current page
  const start = Math.max(1, current - 2);
  const end = Math.min(total, current + 2);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
const fetchItems = async (page: number = 1) => {
  try {
    let data: ApiResponse;
    const params = new URLSearchParams({
      page: page.toString(),
      limit: itemsPerPage.value,
    });
    const token = localStorage.getItem("token");
    if (!token) return;
    // const response =
    await axios
      .get(`http://localhost:3005/api/eleves/?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        data = res.data;
        console.log(data);
        eleves.value = data.eleves;
        pagination.value = data.pagination;
        jumpToPage.value = data.pagination.currentPage;
      })
      .catch((err) => {
        console.log(err);
      });

    // if (!response.ok) {
    //   throw new Error(`HTTP error! status: ${response.status}`)
    // }
  } catch (err) {
    console.error("Error fetching items:", err);
  }
};

const goToPage = (page: number) => {
  if (page >= 1 && page <= pagination.value.totalPages) {
    fetchItems(page);
  }
};
onMounted(async () => {
  // console.log(`id prof : ${props.id}`);
  // const token = localStorage.getItem("token");
  // if (!token) return;
  fetchItems();
  // try {
  //   errorMessage.value = "";
  //   await axios
  //     .get("http://localhost:3005/api/eleves/", {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     })
  //     .then((res) => {
  //       console.log(res?.data);
  //       // eleves.value = res.data?.eleves;
  //       // console.log(eleves.value);
  //     });
  // } catch (error) {
  //   const err = error as AxiosError<{ message: string }>;
  //   errorMessage.value =
  //     err.response?.data?.message || "Login failed. Please try again.";
  //   console.log(errorMessage);
  // }
});
</script>
<template>
  <admin-layout>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <h1 class="text-black text-4xl text-left py-4 px-2">Liste des Eleves</h1>
      <button
        class="group bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded flex flex-row flex-nowrap items-center"
      >
        <router-link :to="`/eleves/create`" class="flex items-center gap-x-2">
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
    <!-- Simple Controls -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div
        class="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0"
      >
        <div class="flex items-center space-x-4">
          <label class="text-sm font-medium text-gray-700"
            >Items per page:</label
          >
          <select
            v-model="itemsPerPage"
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            @change="fetchItems(1)"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>

        <div class="text-sm text-gray-600">
          Total Items: {{ pagination.totalItems }}
        </div>
      </div>
    </div>
    <div
      class="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]"
    >
      <div class="max-w-full overflow-x-auto custom-scrollbar">
        <!-- Items Table -->
        <div v-if="eleves.length > 0" class="space-y-6">
          <div
            class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Nom
                    </th>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium text-gray-900"
                    >
                      Prenom
                    </th>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date de naissance
                    </th>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Classe
                    </th>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr
                    v-for="item in eleves"
                    :key="item.id"
                    class="hover:bg-gray-50 transition-colors"
                  >
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">
                        {{ item.nom }}
                      </div>
                    </td>
                    <td class="px-6 py-4 font-medium text-gray-900">
                      {{ item.prenom }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">
                        {{ formatDate(item.date_naissance) }}
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-500">
                        {{ item.id_classe.nom_classe }}
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <!-- <div class="text-xs text-gray-400 font-mono">
                        {{ item.id.slice(-8) }}
                      </div> -->
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Pagination Controls -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div
              class="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0"
            >
              <!-- Pagination Info -->
              <div class="text-sm text-gray-700">
                Showing
                {{ (pagination.currentPage - 1) * pagination.itemsPerPage + 1 }}
                to
                {{
                  Math.min(
                    pagination.currentPage * pagination.itemsPerPage,
                    pagination.totalItems
                  )
                }}
                of {{ pagination.totalItems }} results
              </div>

              <!-- Pagination Buttons -->
              <div class="flex items-center space-x-2 text-black">
                <!-- Previous Button -->
                <button
                  @click="goToPage(pagination.currentPage - 1)"
                  :disabled="!pagination.hasPrev"
                  class="px-4 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>

                <!-- Page Numbers -->
                <div class="flex space-x-1">
                  <button
                    v-for="page in visiblePages"
                    :key="page"
                    @click="goToPage(page)"
                    :class="[
                      'px-3 py-2 text-sm border rounded-md transition-colors',
                      page === pagination.currentPage
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50',
                    ]"
                  >
                    {{ page }}
                  </button>
                </div>

                <!-- Next Button -->
                <button
                  @click="goToPage(pagination.currentPage + 1)"
                  :disabled="!pagination.hasNext"
                  class="px-4 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>

            <!-- Quick Jump -->
            <div class="mt-4 pt-4 border-t border-gray-200 text-black">
              <div class="flex items-center justify-center space-x-2">
                <span class="text-sm text-gray-600">Go to page:</span>
                <input
                  v-model="jumpToPage"
                  type="number"
                  :min="1"
                  :max="pagination.totalPages"
                  class="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  @keyup.enter="goToPage(Number(jumpToPage))"
                />
                <button
                  @click="goToPage(Number(jumpToPage))"
                  class="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Go
                </button>
              </div>
            </div>
          </div>
        </div>
        <!-- <table class="min-w-full">
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
                  Classe
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
                    <span
                      class="block font-medium text-gray-800 text-theme-sm dark:text-white/90"
                    >
                      {{ c.nom }}
                    </span>
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
                  {{ c.id_classe.nom_classe }}
                </span>
              </td>
              <td class="px-5 py-4 sm:px-6">
                <span
                  class="block font-medium text-gray-800 text-theme-sm dark:text-white/90"
                >
                  Edit | Delete
                </span>
              </td>
            </tr>
          </tbody>
        </table> -->
      </div>
    </div>
  </admin-layout>
</template>
<script lang="ts">
// import AdminLayout from "./layout/AdminLayout.vue";
import AdminLayout from "../layout/AdminLayout.vue";
// import axios from "axios";
// import { formatDate } from "@fullcalendar/core";

export default {
  components: {
    AdminLayout,
  },
};
</script>
