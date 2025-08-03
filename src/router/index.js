import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/LoginView.vue'),
      meta: { title: '登入', requiresAuth: false }
    },
    {
      path: '/',
      name: 'Dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { title: '儀表板', requiresAuth: true } 
    },
    {
      path: '/book-appointment',
      name: 'BookAppointment',
      component: () => import('../views/BookingView.vue'),
      meta: { title: '預約服務', requiresAuth: true }
    },
    {
      path: '/my-bookings',
      name: 'MyBookings',
      component: () => import('../views/MyBookingsView.vue'),
      meta: { title: '我的預約', requiresAuth: true }
    },
    {
      path: '/admin',
      name: 'Admin',
      component: () => import('../views/AdminView.vue'),
      meta: { title: '管理者設定', requiresAuth: true }
    },
    {
      path: '/all-bookings',
      name: 'AllBookings',
      component: () => import('../views/AllBookingsView.vue'),
      meta: { title: '所有預約', requiresAuth: true } 
    },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  
  if (to.meta.requiresAuth && !token) {
    next({ name: 'Login' });
  } 
  else if (to.name === 'Login' && token) {
    next({ name: 'Dashboard' });
  } 
  else {
    next();
  }
});

export default router;
