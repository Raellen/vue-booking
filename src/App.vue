<template>
  <v-app>
    <v-main>
      <v-container fluid>
        <!-- 頁面標題 -->
        <v-row align="center">
          <v-col cols="12" md="8">
            <h1 class="text-h4 font-weight-bold text-grey-darken-3">會議室即時預訂系統</h1>
            <p class="text-subtitle-1 text-grey">點擊日曆上的日期或事件來新增/編輯預訂</p>
          </v-col>
           <v-col cols="12" md="4" class="text-md-right">
            <v-alert
              v-if="!store.isLoading"
              type="success"
              icon="mdi-wifi"
              variant="tonal"
              closable
              class="mb-2"
            >
              資料已同步，可接收即時更新。
            </v-alert>
          </v-col>
        </v-row>

        <!-- 日曆元件 -->
        <v-row>
          <v-col>
            <v-card elevation="2" class="rounded-lg">
               <v-overlay v-model="store.isLoading" contained class="align-center justify-center">
                  <v-progress-circular color="primary" indeterminate size="64"></v-progress-circular>
               </v-overlay>
              <v-calendar
                :events="store.events"
                color="primary"
                type="month"
                @click:event="handleEventClick"
                @click:date="handleDateClick"
              ></v-calendar>
            </v-card>
          </v-col>
        </v-row>

        <!-- 彈出視窗元件 -->
        <BookingDialog
          v-model="isDialogVisible"
          :event-data="selectedEvent"
          :rooms="store.rooms"
          @save="handleSave"
          @delete="handleDelete"
        />

        <!-- 操作結果提示 (Snackbar) -->
        <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
          {{ snackbar.text }}
          <template v-slot:actions>
            <v-btn color="white" variant="text" @click="snackbar.show = false">關閉</v-btn>
          </template>
        </v-snackbar>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useBookingStore } from '@/stores/bookingStore'; // 請確認路徑是否正確
import BookingDialog from '@/components/BookingDialog.vue'; // 請確認路徑是否正確

// 初始化 Store
const store = useBookingStore();

// 本地狀態
const isDialogVisible = ref(false);
const selectedEvent = ref({});
const snackbar = ref({ show: false, text: '', color: 'success' });

// --- 事件處理 (Event Handlers) ---
const handleEventClick = ({ event }) => {
  selectedEvent.value = { ...event.raw }; // 取得原始資料
  isDialogVisible.value = true;
};

const handleDateClick = ({ date }) => {
  selectedEvent.value = {
    title: '',
    roomId: null,
    start: date.toISOString().split('T')[0],
    end: date.toISOString().split('T')[0],
    color: '#3F51B5',
  };
  isDialogVisible.value = true;
};

const handleSave = async (eventData) => {
  try {
    await store.saveBooking(eventData);
    showSnackbar('預訂已成功儲存！');
    isDialogVisible.value = false;
  } catch (error) {
    showSnackbar('儲存失敗，請稍後再試。', 'error');
  }
};

const handleDelete = async (bookingId) => {
  if (confirm('您確定要刪除這個預訂嗎？')) {
    try {
      await store.deleteBooking(bookingId);
      showSnackbar('預訂已刪除。', 'info');
      isDialogVisible.value = false;
    } catch (error) {
      showSnackbar('刪除失敗，請稍後再試。', 'error');
    }
  }
};

const showSnackbar = (text, color = 'success') => {
  snackbar.value.text = text;
  snackbar.value.color = color;
  snackbar.value.show = true;
};

// --- 生命週期 ---
onMounted(() => {
  store.initializeData();
});
</script>
