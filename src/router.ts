import { createRouter, createMemoryHistory } from "vue-router";
import Login from "./components/auth/Login.vue";
import ResetPassword from "./components/auth/ResetPassword.vue";
import Dashboard from "./components/Dashboard.vue";
const routes = [
  { path: "/", component: Login, name: "/" },
  { path: "/dashboard/:id", component: Dashboard, name: "dashboard", props: true },
  { path: "/dashboard", component: Dashboard, name: "dashboard" },
  { path: "/forgotpassword", component: ResetPassword, name: "forgotPassword" },
  {
    path: "/profile",
    name: "Profile",
    component: () => import("./components/views/Others/UserProfile.vue"),
    meta: {
      title: "Profile",
    },
  },
  {
    path: "/cours",
    name: "Cours",
    component: ()=> import("./components/Cours/Index.vue"),
    meta:{
      title: "Cours"
    }
  },
  {
    path: "/cours/create",
    name: "Create Cours",
    component: ()=> import("./components/Cours/Create.vue"),
    meta:{
      title: "Create Cours"
    }
  },
  {
    path: "/cours/:id",
    name: "ProfileCours",
    component: ()=>import("./components/Cours/Profile.vue"),
    props: true,
    meta: {
      title: "Profile Cours"
    }
  },
  {
    path: "/eleves",
    name: "Eleves",
    component: ()=> import("./components/Eleves/Index.vue"),
    meta:{
      title: "Eleves"
    }
  },
  {
    path: "/eleves/create",
    name: "Create Eleve",
    component: ()=> import("./components/Eleves/Create.vue"),
    meta:{
      title: "Create Eleve"
    }
  },
  {
    path: "/classes",
    name: "Classes",
    component: ()=> import("./components/Classes/Index.vue"),
    meta:{
      title: "Classes"
    }
  },
  {
    path: "/classes/create",
    name: "Create Classe",
    component: ()=> import("./components/Classes/Create.vue"),
    meta:{
      title: "Create Classe"
    }
  },
  {
    path: "/evaluation",
    name: "Evaluations",
    component: () => import('./components/Evaluations/Calendrier.vue'),
    meta: {
      title: "Calendrier Evaluations"
    }
  }
];

const router = createRouter({
  history: createMemoryHistory(),
  routes: routes,
});

// router.beforeEach((to, from, next)=>{
//   const token = localStorage.getItem('token');
//   if (to.path === '/login' && token) {
//     // Redirect to dashboard if already logged in
//     return next('/dashboard');
//   }
//   if (to.path === '/dashboard' && !token) {
//     // Redirect to login if trying to access protected route
//     return next('/login');
//   }
//   next();
// })

export default router;
