<script setup lang="ts">
import { onMounted } from "vue";
import axios, { AxiosError } from "axios";
import { useSidebarProvider } from "../composables/useSidebar";
import { ref } from "vue";
useSidebarProvider();
const errorMessage = ref<string>("");
const metricData = ref({
  nbProfesseurs: 0,
  nbCours: 0,
  nbEleves: 0,
  nbEvaluations: 0,
  nbNotes: 0,
});
// const props = defineProps({
//   id: String,
// });
const id = ref("");
const getProfile = async () => {
  const token = localStorage.getItem("token");
  if (!token) return;
  try {
    errorMessage.value = "";
    await axios
      .get("http://localhost:3005/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        // console.log(res.data);
        id.value = res.data.professeur.id
      });
  } catch (error) {
    const err = error as AxiosError<{ message: string }>;
    errorMessage.value =
      err.response?.data?.message || "Login failed. Please try again.";
    console.log(errorMessage);
  }
};
onMounted(async () => {
  const token = localStorage.getItem("token");
  if (!token) return;
  getProfile()
  try {
    errorMessage.value = "";
    await axios
      .get("http://localhost:3005/api/stats/metrics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        // console.log(res.data);
        metricData.value = {
          nbProfesseurs: res.data.nbProfesseurs,
          nbCours: res.data.nbCours,
          nbEleves: res.data.nbEleves,
          nbEvaluations: res.data.nbEvaluations,
          nbNotes: res.data.nbNotes,
        };
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
  <admin-layout :id="id">
    <div class="grid grid-cols-12 gap-4 md:gap-6">
      <div class="col-span-12 xl:col-span-5">
        <!-- <statistics-chart /> -->
      </div>

      <div class="col-span-12">
        <Metrics :metricData="metricData" />
      </div>
      <div class="col-span-12 space-y-6 xl:col-span-12">
        <Distribution />
        <!-- <PieChart/> -->
      </div>

      <!-- <div class="col-span-12 xl:col-span-5">
        <customer-demographic />
      </div> -->

      <!-- <div class="col-span-12 xl:col-span-7">
        <recent-orders />
      </div> -->
    </div>
  </admin-layout>
</template>
<script lang="ts">
import AdminLayout from "./layout/AdminLayout.vue";
import Metrics from "./ecommerce/Metrics.vue";
import Distribution from "./ecommerce/Distribution.vue";
// import PieChart from "./ecommerce/PieChart.vue";
// import CustomerDemographic from './ecommerce/CustomerDemographic.vue'
// import StatisticsChart from './ecommerce/StatisticsChart.vue'
// import RecentOrders from './ecommerce/RecentOrders.vue'

export default {
  components: {
    AdminLayout,
    Metrics,
    Distribution,
    // PieChart,
    // CustomerDemographic,
    // StatisticsChart,
    // RecentOrders,
  },
};
</script>
