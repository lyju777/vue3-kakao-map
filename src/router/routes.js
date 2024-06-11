const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("pages/MainPage.vue") }],
  },

  {
    path: "/test",
    component: () => import("layouts/MainLayoutTest.vue"),
    children: [{ path: "", component: () => import("pages/MainPageTest.vue") }],
  },

  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
