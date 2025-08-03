import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { useRouter } from 'vue-router';
import apiClient from '@/services/apiClient';
import { useAppStore } from './app.js';

export const useAuthStore = defineStore('auth', () => {
  // 引入其他 store 和 vue-router
  const router = useRouter();
  const appStore = useAppStore();

  // --- State ---
  // 從 localStorage 初始化使用者狀態，這樣重新整理頁面後也能保持登入
  const user = ref(JSON.parse(localStorage.getItem('user')));
  const token = ref(localStorage.getItem('token'));

  // --- Getters ---
  // computed 屬性，用來衍生出其他狀態
  const isAuthenticated = computed(() => !!token.value);
  const userName = computed(() => user.value?.name || '');
  const userEmail = computed(() => user.value?.email || '');
  const userInitials = computed(() => (user.value?.name ? user.value.name.substring(0, 2).toUpperCase() : ''));

  // --- Actions ---
  // 處理登入邏輯的函式
  async function login(credentials) {
    appStore.setGlobalLoading(true);
    try {
      // 向模擬後端發送請求，檢查 email 是否存在
      const { data } = await apiClient.get(`/users?email=${credentials.email}`);
      
      if (data && data.length > 0) {
        // 如果使用者存在，則登入成功
        const loggedInUser = data[0];
        token.value = `fake-jwt-token-for-${loggedInUser.email}`; // 模擬一個 JWT token
        user.value = loggedInUser;

        // 將使用者資訊和 token 存入 localStorage
        localStorage.setItem('user', JSON.stringify(loggedInUser));
        localStorage.setItem('token', token.value);

        appStore.showSnackbar('登入成功！');
        router.push('/'); // 登入成功後跳轉至首頁 (儀表板)
        return true;
      } else {
        // 如果使用者不存在，登入失敗
        appStore.showSnackbar('帳號或密碼錯誤', 'error');
        return false;
      }
    } catch (error) {
      console.error('Login failed:', error);
      appStore.showSnackbar('登入時發生錯誤', 'error');
      return false;
    } finally {
      appStore.setGlobalLoading(false);
    }
  }

  // 處理登出邏輯的函式
  function logout() {
    // 清除 state
    user.value = null;
    token.value = null;

    // 清除 localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');

    appStore.showSnackbar('您已成功登出');
    router.push('/login'); // 登出後跳轉至登入頁
  }

  // 將 state, getters, actions 回傳，讓元件可以使用
  return { 
    user, 
    token, 
    isAuthenticated, 
    userName, 
    userEmail, 
    userInitials, 
    login, 
    logout 
  };
});
