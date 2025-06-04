<script lang="ts">
import { useRouter } from "vue-router";
import { defineComponent } from "vue";
import { ref, onMounted } from "vue";
import axios, { AxiosError } from "axios";
// onMounted(() => {
//   const token = localStorage.getItem("token");
//   if (token) {
//     console.log("token found");
//     router.push("/dashboard");
//   } else {
//     console.log("token not found");
//     return;
//   }
// });
export default defineComponent({
  name: "Login",
  setup() {
    const router = useRouter();
    const email = ref<string>("");
    const mdp = ref<string>("");
    const errorMessage = ref<string>("");
    const handleLogin = async (): Promise<void> => {
      try {
        errorMessage.value = "";
        await axios
          .post("http://localhost:3005/api/auth/login", {
            email: email.value,
            mdp: mdp.value,
          })
          .then((res) => {
            const token = res.data.token;
            localStorage.setItem("token", token);
            router.push(`/dashboard`);
            // console.log(res.data.professeur)
          });
      } catch (error) {
        const err = error as AxiosError<{ message: string }>;
        errorMessage.value =
          err.response?.data?.message || "Login failed. Please try again.";
        console.log(errorMessage);
      }
    };
    const forgotPassword = () => {
      router.push("/forgotpassword");
    };
    return {
      email,
      mdp,
      errorMessage,
      forgotPassword,
      handleLogin,
    };
  },
  mounted() {
    const router = useRouter();
    const token = localStorage.getItem("token");
    if (token) {
      // console.log("token found");
      router.push("/dashboard");
    } else {
      // console.log("token not found");
      return;
    }
  },
});
</script>
<template>
  <div
    class="w-screen relative h-[100vh] bg-[url('../../../bg.jpg')] bg-cover bg-center bg-no-repeat flex items-center"
  >
    <div
      class="w-screen h-[100vh] bg-black opacity-30 absolute top-0 left-0"
    ></div>
    <div
      class="relative z-30 text-center flex flex-col gap-4 mx-auto border-2 rounded-md px-4 w-[50%] py-6 shadow-xl shadow-amber-800"
    >
      <h1 class="text-4xl uppercase font-semibold">Se connecter</h1>
      <form action="" @submit.prevent="handleLogin">
        <div class="flex flex-col gap-2 w-[60%] mx-auto">
          <label class="text-xl font-semibold text-left" for="">Email : </label>
          <input
            class="outline-none px-4 py-2 rounded-full bg-transparent border-2 text-white"
            type="text"
            placeholder="Entrer votre email"
            v-model="email"
          />
        </div>
        <div class="flex flex-col gap-2 w-[60%] mx-auto">
          <label class="text-xl font-semibold text-left" for=""
            >Mot de passe :
          </label>
          <input
            class="outline-none px-4 py-2 rounded-full bg-transparent border-2 text-white"
            type="password"
            placeholder="Entrer votre mot de passe"
            v-model="mdp"
          />
        </div>
        <div class="text-md lex gap-4 mx-auto">
          <input type="checkbox" name="Remember" id="" />
          <a href="#">Se souvenir de moi</a> <br />
          <span @click="forgotPassword" class="hover:underline cursor-pointer"
            >Mot de passe oublié</span
          >
        </div>
        <div>
          <input
            type="submit"
            value="Se connecter"
            class="bg-amber-800 px-4 py-2 rounded-md text-xl w-[200px] mx-auto hover:bg-transparent hover:border-amber-800 border-2 cursor-pointer border-amber-800"
          />
        </div>
        <p v-if="errorMessage" class="text-red-500 text-center mt-4">
          {{ errorMessage }}
        </p>
      </form>
    </div>
  </div>
</template>
