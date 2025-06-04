import Index from "@/components/Cours/Index.vue";
import Create from "@/components/Cours/Create.vue";
import Edit from "@/components/Cours/Edit.vue";

const routes = [
  { path: "/cours/", component: Index },
  { path: "/cours/create", component: Create, name: "forgotPassword" },
  { path: "/cours/edit/:id", component: Edit, props: true },
];

export default routes;
