<template>
  <div class="express-demo">
    <h2>Express Server Integration Demo</h2>

    <div class="card">
      <h3>Server Status</h3>
      <div class="status" :class="{ 'status-online': serverOnline }">
        {{
          serverOnline ? "Express Server Online" : "Checking server status..."
        }}
      </div>

      <button @click="fetchData" :disabled="!serverOnline" class="btn">
        Fetch Data from Server
      </button>

      <div v-if="responseData" class="response-data">
        <h4>Server Response:</h4>
        <pre>{{ JSON.stringify(responseData, null, 2) }}</pre>
      </div>
    </div>

    <div class="card">
      <h3>Send Data to Server</h3>
      <div class="form-group">
        <label for="message">Message:</label>
        <input
          id="message"
          v-model="formData.message"
          type="text"
          placeholder="Enter a message"
          class="placeholder-black text-black"
        />
      </div>

      <button @click="submitData" :disabled="!serverOnline" class="btn">
        Submit to Server
      </button>

      <div v-if="submitResponse" class="response-data">
        <h4>Submit Response:</h4>
        <pre class="text-black">{{ JSON.stringify(submitResponse, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted } from "vue";

interface ApiData {
  message: string;
  timestamp: string;
  error?: string;
}

interface FormData {
  message: string;
  timestamp: string;
}

interface SubmitResponse {
  success: boolean;
  receivedData?: any;
  error?: string;
}

export default defineComponent({
  name: "ExpressDemo",
  setup() {
    const serverOnline = ref<boolean>(false);
    const responseData = ref<ApiData | null>(null);
    const formData = reactive<FormData>({
      message: "",
      timestamp: "",
    });
    const submitResponse = ref<SubmitResponse | null>(null);

    const checkServerStatus = async (): Promise<void> => {
      try {
        const response = await fetch("http://localhost:3002/api/data", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          serverOnline.value = true;
        }
      } catch (error) {
        console.error("Server check failed:", error);
        serverOnline.value = false;

        // Retry after 3 seconds
        setTimeout(() => {
          checkServerStatus();
        }, 3000);
      }
    };

    const fetchData = async (): Promise<void> => {
      try {
        const response = await fetch("http://localhost:3002/api/data");
        responseData.value = (await response.json()) as ApiData;
      } catch (error) {
        console.error("Error fetching data:", error);
        responseData.value = {
          message: "Error",
          timestamp: new Date().toISOString(),
          error: "Failed to fetch data from server",
        };
      }
    };

    const submitData = async (): Promise<void> => {
      try {
        formData.timestamp = new Date().toISOString();

        const response = await fetch("http://localhost:3002/api/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        submitResponse.value = (await response.json()) as SubmitResponse;
      } catch (error) {
        console.error("Error submitting data:", error);
        submitResponse.value = {
          success: false,
          error: "Failed to submit data to server",
        };
      }
    };

    onMounted(() => {
      checkServerStatus();
    });

    return {
      serverOnline,
      responseData,
      formData,
      submitResponse,
      fetchData,
      submitData,
    };
  },
});
</script>

<style scoped>
.express-demo {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.card {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.status {
  padding: 10px;
  margin: 10px 0;
  border-radius: 4px;
  background-color: #f8d7da;
  color: #721c24;
}

.status-online {
  background-color: #d4edda;
  color: #155724;
}

.btn {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin: 10px 0;
}

.btn:hover {
  background-color: #45a049;
}

.btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.response-data {
  margin-top: 15px;
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: auto;
}

pre {
  margin: 0;
  white-space: pre-wrap;
}
</style>
