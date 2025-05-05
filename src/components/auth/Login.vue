<script setup lang="ts">
// import bgImg from "./public/bg.jpg";
</script>

<template>
  <!-- component -->
  <div
    class="w-screen relative h-[100vh] bg-[url('../../../bg.jpg')] bg-cover bg-center bg-no-repeat flex items-center"
  >
    <!-- <h1 class="text-white">Test</h1> -->
    <div
      class="w-screen h-[100vh] bg-black opacity-30 absolute top-0 left-0"
    ></div>
    <div class="relative z-30 text-center flex flex-col gap-4 mx-auto border-2 rounded-md px-4 w-[50%] py-6 shadow-xl shadow-amber-800">
      <h1 class="text-4xl uppercase font-semibold">Se connecter</h1>
      <div class="flex flex-col gap-2 w-[60%] mx-auto">
        <label class="text-xl font-semibold text-left " for="">Email : </label>
        <input class="outline-none px-4 py-2 rounded-full bg-transparent border-2 text-white" type="text" placeholder="Entrer votre email" />
      </div>
      <div class="flex flex-col gap-2 w-[60%] mx-auto">
        <label class="text-xl font-semibold text-left " for="">Mot de passe : </label>
        <input class="outline-none px-4 py-2 rounded-full bg-transparent border-2 text-white" type="password" placeholder="Entrer votre mot de passe" />
      </div>
      <div class="text-md lex gap-4 mx-auto ">
        <input type="checkbox" name="Remember" id="">
        <a href="#">Se souvenir de moi</a> <br/>
        <a href="#" class="hover:underline">Mot de passe oublié</a>
      </div>
      <div>
        <input type="submit" value="Se connecter" class="bg-amber-800 px-4 py-2 rounded-md text-xl w-[200px] mx-auto
        hover:bg-transparent hover:border-amber-800 border-2 cursor-pointer border-amber-800">
      </div>
    </div>
  </div>
</template>
