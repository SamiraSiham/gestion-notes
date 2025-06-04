import Index from "@/components/Classes/Index.vue";
import Create from "@/components/Classes/Create.vue";
import Edit from "@/components/Classes/Edit.vue";

const routes = [
  { path: "/classes/", component: Index },
  { path: "/classes/create", component: Create, name: "forgotPassword" },
  { path: "/classes/edit/:id", component: Edit, props: true },
];

export default routes;
