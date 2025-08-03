<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '@/services/apiClient';
import { useAppStore } from '@/stores/app';
import { useAuthStore } from '@/stores/auth';

const appStore = useAppStore();
const authStore = useAuthStore();
const { user } = authStore;

const bookings = ref([]);
const loading = ref(true);

async function fetchMyBookings() {
  loading.value = true;
  try {
    const { data } = await apiClient.get(`/bookings?userId=${user.id}&_sort=dateTime&_order=asc`);
    bookings.value = data;
  } catch (error) {
    appStore.showSnackbar('讀取預約紀錄失敗', 'error');
  } finally {
    loading.value = false;
  }
}

async function cancelBooking(bookingId) {
  const confirmation = confirm('您確定要取消這個預約嗎？');
  if (!confirmation) return;

  appStore.setGlobalLoading(true);
  try {
    await apiClient.delete(`/bookings/${bookingId}`);
    appStore.showSnackbar('預約已取消', 'success');
    await fetchMyBookings(); // 重新整理列表
  } catch (error) {
    appStore.showSnackbar('取消失敗', 'error');
  } finally {
    appStore.setGlobalLoading(false);
  }
}

onMounted(fetchMyBookings);
</script>

<template>
  <v-container>
    <v-card rounded="lg">
      <v-card-title>我的預約紀錄</v-card-title>
      <v-card-text>
        <v-skeleton-loader v-if="loading" type="table-row-divider@5"></v-skeleton-loader>
        <v-list v-else-if="bookings.length > 0" lines="two">
          <template v-for="(booking, index) in bookings" :key="booking.id">
            <v-list-item>
              <template v-slot:prepend>
                <v-icon color="primary">mdi-calendar-check</v-icon>
              </template>
              <v-list-item-title class="font-weight-bold">
                {{ new Date(booking.dateTime).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' }) }}
              </v-list-item-title>
              <v-list-item-subtitle>
                時間：{{ new Date(booking.dateTime).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }) }}
              </v-list-item-subtitle>
              <template v-slot:append>
                <v-btn
                  color="red"
                  variant="text"
                  @click="cancelBooking(booking.id)"
                >取消預約</v-btn>
              </template>
            </v-list-item>
            <v-divider v-if="index < bookings.length - 1" inset></v-divider>
          </template>
        </v-list>
        <div v-else class="text-center text-grey py-16">
          <v-icon icon="mdi-calendar-multiple-check" size="64"></v-icon>
          <p class="mt-4 text-h6">您目前沒有任何預約</p>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>
