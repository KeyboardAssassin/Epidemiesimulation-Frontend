/*
  Vue's best practice and convention is to use “PascalCase” for the pages,
  and include the word page in it. Same for layouts.

  But it's also valid to use “kebab-case” as in template attributes.
*/

const routes = [
  {
    path: "/",
    component: () => import("layouts/main/MainLayout.vue"),
    children: [
      { path: "", component: () => import("pages/IndexPage.vue") },
      {
        path: "states",
        component: () => import("pages/StatesPage.vue"),
      },
      {
        path: "cities",
        component: () => import("pages/CitiesPage.vue"),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFoundPage.vue"),
  },
];

export default routes;
