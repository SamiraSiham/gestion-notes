<template>
  <div
    class="w-screen relative h-[100vh] bg-[url('../../../bg.jpg')] bg-cover bg-center bg-no-repeat flex items-center"
  >
    <div
      class="w-screen h-[100vh] bg-black opacity-30 absolute top-0 left-0"
    ></div>
    <div
      class="relative z-30 text-center flex flex-col gap-4 mx-auto border-2 rounded-md px-4 w-[70%] py-6 shadow-xl shadow-amber-800"
    >
      <div>
        <button class="flex flex-row items-center gap-x-3 cursor-pointer" @click="returnHome">
          <img src="../../assets/left-arrow.svg" class="w-10" alt="" />
          <span>Return</span>
        </button>
      </div>

      <h1 class="text-2xl uppercase font-semibold">
        Réinitialiser votre mot de passe
      </h1>
      <div class="flex flex-col gap-2 w-[60%] mx-auto">
        <label class="text-xl font-semibold text-left" for="">Email : </label>
        <input
          class="outline-none px-4 py-2 rounded-full bg-transparent border-2 text-white"
          type="text"
          placeholder="Entrer votre email"
        />
      </div>
      <div class="flex flex-col gap-2 w-[60%] mx-auto">
        <label class="text-xl font-semibold text-left" for=""
          >Nouveau Mot de passe :
        </label>
        <input
          class="outline-none px-4 py-2 rounded-full bg-transparent border-2 text-white"
          type="password"
          placeholder="Entrer votre mot de passe"
        />
      </div>
      <div class="flex flex-col gap-2 w-[60%] mx-auto">
        <label class="text-xl font-semibold text-left" for=""
          >Confirmer le Mot de passe :
        </label>
        <input
          class="outline-none px-4 py-2 rounded-full bg-transparent border-2 text-white"
          type="password"
          placeholder="Entrer votre mot de passe"
        />
      </div>
      <div>
        <input
          type="submit"
          value="Réinitialiser"
          class="bg-amber-800 px-4 py-2 rounded-md text-xl w-[200px] mx-auto hover:bg-transparent hover:border-amber-800 border-2 cursor-pointer border-amber-800"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { useRouter } from "vue-router";
import { defineComponent } from "vue";
export default defineComponent({
  name: "ResetPassword",
  setup() {
    const router = useRouter();
    const returnHome = () => {
      router.push("/");
    };
    return {
      returnHome,
    };
  },
});
</script>
