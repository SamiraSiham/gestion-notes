<template>
  <div
    class="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6"
  >
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-800 dark:text-white/90">
        Distribution des notes
      </h3>
    </div>

    <div class="max-w-full overflow-x-auto custom-scrollbar">
      <div id="chartOne" class="-ml-5 min-w-[650px] xl:min-w-full pl-2">
        <VueApexCharts
          v-if="loaded"
          type="pie"
          :options="chartOptions"
          :series="series"
          width="500"
        />
        <div v-else>Loading...</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import axios, { AxiosError } from "axios";
import VueApexCharts from "vue3-apexcharts";
const errorMessage = ref<string>("");
// let loaded: Boolean = false;
// let series: any = []
// const chartOptions = ref({
//   series: [],
//   chartOptions: {
//     labels: [],
//     title: {
//       text: "Dynamic Pie Chart",
//       align: "center",
//     },
//   },
//   loaded: false,
// });
// let idArray: any = [];
// let countArray: any = [];
// let pourcentageArray: any = [];
// const fetchData = async () => {
//   const token = localStorage.getItem("token");
//   if (!token) return;
//   try {
//     errorMessage.value = "";
//     await axios
//       .get("http://localhost:3005/api/stats/distribution", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       })
//       .then((res) => {
//         const data = res.data?.data;
//         console.log(data);

//         data.forEach((item: any) => {
//           if (item != null) {
//             idArray.push(item.id);
//             countArray.push(item.count);
//             pourcentageArray.push(item.pourcentage);
//           }
//         });
//       })
//       .then(() => {
//         console.log(`ID Array : ${idArray}`);
//         console.log(`Count Array : ${countArray}`);
//         console.log(`Pourcentage Array : ${pourcentageArray}`);
//         series = idArray;
//         chartOptions.value = {
//           series: idArray,
//           chartOptions: {
//             labels: countArray,
//             title: {
//               text: "Dynamic Pie Chart",
//               align: "center",
//             },
//           },
//           loaded: true,
//         };
//       });
//   } catch (error) {
//     const err = error as AxiosError<{ message: string }>;
//     errorMessage.value = err.response?.data?.message || "Unknown Error.";
//     console.log(errorMessage);
//   }
// };
// onMounted(() => {
//   fetchData();
// });
export default defineComponent({
  setup() {
    // State
    const series = ref<number[]>([]);
    const chartOptions = ref({
      labels: [],
      title: {
        text: "Dynamic Pie Chart (with TypeScript)",
        align: "center",
      },
    });
    const loaded = ref(false);

    // Type for API response
    // interface PieChartResponse {
    //   labels: string[];
    //   series: number[];
    // }

    // Fetch data
    const fetchChartData = async () => {
      try {
        errorMessage.value = "";
        const token = localStorage.getItem("token");
        if (!token) return;
        await axios
          .get("http://localhost:3005/api/stats/distribution", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then((res) => {
            const result = res.data.data;
            let ser = [];
            let lab = [];
            result.forEach((el: any) => {
              ser.push(el.id);
              lab.push(el.count);
              series.value = ser;
              chartOptions.value.labels = lab;
              loaded.value = true;
            });
            // series.value = data.series
            // chartOptions.value.labels = data.labels
            // loaded.value = true
            console.log(res.data?.data);
          });
      } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        errorMessage.value = err.response?.data?.message || "Unknown Error.";
        console.log(errorMessage);
      }
    };

    onMounted(fetchChartData);

    return {
      series,
      chartOptions,
      loaded,
    };
  },
});
</script>
