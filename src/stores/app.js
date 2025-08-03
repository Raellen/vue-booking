import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useAppStore = defineStore('app', () => {
  // --- State ---
  // 控制全域載入動畫的顯示與否
  const globalLoading = ref(false);
  
  // 控制全域通知訊息的狀態
  const snackbar = ref({
    show: false,
    text: '',
    color: 'success',
  });

  // --- Actions ---
  // 用於顯示通知訊息的函式
  function showSnackbar(text, color = 'success') {
    snackbar.value.text = text;
    snackbar.value.color = color;
    snackbar.value.show = true;
  }

  // 用於設定全域載入狀態的函式
  function setGlobalLoading(isLoading) {
    globalLoading.value = isLoading;
  }

  // 將 state 和 actions 回傳，讓元件可以使用
  return { 
    globalLoading, 
    snackbar, 
    showSnackbar, 
    setGlobalLoading 
  };
});
