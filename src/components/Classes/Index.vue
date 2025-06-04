<script setup lang="ts">
import axios from "axios";
// import { AxiosError } from "axios";
import { useSidebarProvider } from "../../composables/useSidebar";
import { ref, onMounted } from "vue";
import { computed } from "vue";

interface Classe{
	_id: string
	nom_classe: string,
	annee_scolaire: string,
	niveau: string,
	effectif: number,
	salle_reference: string
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
  classes: Classe[];
  pagination: Pagination;
}
useSidebarProvider();
// const errorMessage = ref<string>("");
const classes: any = ref([]);
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
// const formatDate = (dateString: string) => {
//   return new Date(dateString).toLocaleDateString("en-US", {
//     year: "numeric",
//     month: "short",
//     day: "numeric",
//   });
// };
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
      .get(`http://localhost:3005/api/classes/?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        data = res.data;
        console.log(data);
        classes.value = data.classes;
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
  fetchItems();
});
</script>
<template>
  <admin-layout>
    <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <h1 class="text-black text-4xl text-left py-4 px-2">Liste des Classes</h1>
      <button
        class="group bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded flex flex-row flex-nowrap items-center"
      >
        <router-link :to="`/classes/create`" class="flex items-center gap-x-2">
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
        <table class="min-w-full">
          <thead>
            <tr class="border-b border-gray-200 dark:border-gray-700">
              <th class="px-5 py-3 text-left w-3/11 sm:px-6">
                <p
                  class="font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center"
                >
                  Nom de classe
                </p>
              </th>
              <th class="px-5 py-3 text-left w-2/11 sm:px-6">
                <p
                  class="font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center"
                >
                  Annee scolaire
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
                  effectif
                </p>
              </th>
              <th class="px-5 py-3 text-left w-2/11 sm:px-6">
                <p
                  class="font-medium text-gray-500 text-theme-xs dark:text-gray-400 text-center"
                >
                  Salle de reference
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
              v-for="(c, i) in classes"
              :key="i"
              class="border-t border-gray-100 dark:border-gray-800"
            >
              <td class="px-5 py-4 sm:px-6">
                <div class="flex items-center gap-3">
                  <div class="text-center">
                    <span
                      class="block font-medium text-gray-800 text-theme-sm dark:text-white/90"
                    >
                      {{ c.nom_classe }}
                    </span>
                  </div>
                </div>
              </td>
              <td class="px-5 py-4 sm:px-6">
                <p
                  class="text-gray-800 text-theme-sm dark:text-gray-400 text-left"
                >
                  {{ c.annee_scolaire }}
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
                  {{ c.effectif }}
                </span>
              </td>
              <td class="px-5 py-4 sm:px-6">
                <span
                  class="block font-medium text-gray-800 text-theme-sm dark:text-white/90"
                >
                  {{ c.salle_reference }}
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
