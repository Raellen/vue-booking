<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/services/apiClient';
import { useAuthStore } from '@/stores/auth';
import { useAppStore } from '@/stores/app';

const router = useRouter();
const authStore = useAuthStore();
const appStore = useAppStore();
const { user, userName } = authStore;

const loading = ref(true);
const stats = ref({});
const nextBooking = ref(null);

const welcomeMessage = computed(() => `歡迎回來，${userName}！`);

async function fetchData() {
  loading.value = true;
  try {
    if (user.role === 'admin') {
      const { data } = await apiClient.get('/bookings');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const upcomingBookings = data.filter(b => new Date(b.dateTime) >= today);
      stats.value = {
        totalBookings: data.length,
        upcomingBookings: upcomingBookings.length,
      };
    } else if (user.role === 'client') {
      const { data } = await apiClient.get(`/bookings?userId=${user.id}&_sort=dateTime&_order=asc`);
      const now = new Date();
      nextBooking.value = data.find(b => new Date(b.dateTime) > now);
    }
  } catch (error) {
    appStore.showSnackbar('無法載入儀表板資訊', 'error');
  } finally {
    loading.value = false;
  }
}

function formatDateTime(dateTimeString) {
  if (!dateTimeString) return 'N/A';
  const date = new Date(dateTimeString);
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

onMounted(fetchData);
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold">{{ welcomeMessage }}</h1>
        <p class="text-grey-darken-1">這是您的預約系統總覽。</p>
      </v-col>
    </v-row>

    <v-skeleton-loader v-if="loading" type="card@2"></v-skeleton-loader>

    <!-- 管理者儀表板 -->
    <div v-if="!loading && user.role === 'admin'">
      <v-row>
        <v-col md="6" cols="12">
          <v-card color="primary" dark rounded="lg" @click="router.push('/all-bookings')" hover>
            <v-card-text class="d-flex justify-space-between align-center">
              <div>
                <div class="text-h3">{{ stats.totalBookings }}</div>
                <div class="text-subtitle-1">總預約數 (點擊查看)</div>
              </div>
              <v-icon size="64">mdi-calendar-multiple</v-icon>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col md="6" cols="12">
          <v-card rounded="lg">
            <v-card-text class="d-flex justify-space-between align-center">
              <div>
                <div class="text-h3">{{ stats.upcomingBookings }}</div>
                <div class="text-subtitle-1">待處理預約</div>
              </div>
              <v-icon size="64" color="warning">mdi-calendar-clock</v-icon>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-card rounded="lg" @click="router.push('/admin')" hover>
            <v-list-item prepend-icon="mdi-cog" title="前往設定" subtitle="管理您的每週可預約時段"></v-list-item>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- 客戶儀表板 -->
    <div v-if="!loading && user.role === 'client'">
      <v-row>
        <v-col cols="12">
          <v-card color="teal" dark rounded="lg">
            <v-card-title>您的下一個預約</v-card-title>
            <v-card-text v-if="nextBooking">
              <div class="text-h5 font-weight-bold">{{ formatDateTime(nextBooking.dateTime) }}</div>
            </v-card-text>
            <v-card-text v-else>
              <div class="text-h6">您目前沒有即將到來的預約。</div>
            </v-card-text>
            <v-card-actions>
              <v-btn variant="outlined" @click="router.push('/my-bookings')">查看所有預約</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-card rounded="lg" @click="router.push('/book-appointment')" hover>
            <v-list-item prepend-icon="mdi-calendar-plus" title="預約新時段" subtitle="查看可預約的時間並安排您的下一次服務"></v-list-item>
          </v-card>
        </v-col>
      </v-row>
    </div>

  </v-container>
</template>
