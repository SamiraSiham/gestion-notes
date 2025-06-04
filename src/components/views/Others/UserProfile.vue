<template>
  <admin-layout>
    <PageBreadcrumb :pageTitle="currentPageTitle" />

    <div
      class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6"
    >
      <h3 class="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">Profile</h3>
      <profile-card />
      <personal-info-card />
      <address-card />
    </div>
  </admin-layout>
</template>

<script setup>
import AdminLayout from '../../layout/AdminLayout.vue'
import PageBreadcrumb from '../../common/PageBreadcrumb.vue'
import { ref } from 'vue'
import ProfileCard from '../../profile/ProfileCard.vue'
import PersonalInfoCard from '../../profile/PersonalInfoCard.vue'
import AddressCard from '../../profile/AddressCard.vue'
const currentPageTitle = ref('User Profile')
</script>
