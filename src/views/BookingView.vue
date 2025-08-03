<script setup>
import { ref, watch, computed } from 'vue';
import apiClient from '@/services/apiClient';
import { useAppStore } from '@/stores/app';
import { useAuthStore } from '@/stores/auth';

const appStore = useAppStore();
const authStore = useAuthStore();
const { user, userName } = authStore;

const selectedDate = ref(new Date());
const availability = ref(null);
const bookings = ref([]);
const loadingSlots = ref(false);

const timeSlots = computed(() => {
  if (!availability.value || !selectedDate.value) return [];

  const dayOfWeek = selectedDate.value.getDay();
  const daySchedule = availability.value.schedule[dayOfWeek];

  if (!daySchedule || !daySchedule.active) return [];

  const slots = [];
  const slotDuration = 30; // 每個時段 30 分鐘
  let currentTime = new Date(selectedDate.value);
  const [startHour, startMinute] = daySchedule.start.split(':');
  currentTime.setHours(startHour, startMinute, 0, 0);

  const endTime = new Date(selectedDate.value);
  const [endHour, endMinute] = daySchedule.end.split(':');
  endTime.setHours(endHour, endMinute, 0, 0);

  while (currentTime < endTime) {
    const slotTime = new Date(currentTime);
    const isBooked = bookings.value.some(b => new Date(b.dateTime).getTime() === slotTime.getTime());
    
    slots.push({
      time: slotTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      dateTime: slotTime.toISOString(),
      isBooked: isBooked,
    });
    currentTime.setMinutes(currentTime.getMinutes() + slotDuration);
  }
  return slots;
});

async function fetchDataForDate(date) {
  loadingSlots.value = true;
  try {
    // **FIX:** 使用 /availability/singleton 來直接獲取物件，或處理陣列
    // 這裡我們採用處理陣列的方式，更具彈性
    const [availRes, bookingsRes] = await Promise.all([
      apiClient.get('/availability'),
      apiClient.get(`/bookings?dateTime_like=${date.toISOString().slice(0, 10)}`)
    ]);
    
    // **FIX:** 因為 API 現在回傳的是陣列，我們需要取出第一個元素
    availability.value = availRes.data[0]; 
    bookings.value = bookingsRes.data;

  } catch (error) {
    appStore.showSnackbar('讀取資料失敗', 'error');
    console.error("API 請求失敗:", error);
  } finally {
    loadingSlots.value = false;
  }
}

watch(selectedDate, (newDate) => {
  if (newDate) {
    fetchDataForDate(newDate);
  }
}, { immediate: true });

async function handleBookSlot(slot) {
  if (slot.isBooked) return;
  
  const confirmation = confirm(`您確定要預約 ${new Date(slot.dateTime).toLocaleString()} 的時段嗎？`);
  if (!confirmation) return;

  appStore.setGlobalLoading(true);
  try {
    const newBooking = {
      userId: user.id,
      userName: userName,
      dateTime: slot.dateTime,
    };
    await apiClient.post('/bookings', newBooking);
    appStore.showSnackbar('預約成功！', 'success');
    // 重新整理時段資料
    await fetchDataForDate(selectedDate.value);
  } catch (error) {
    appStore.showSnackbar('預約失敗，請稍後再試', 'error');
  } finally {
    appStore.setGlobalLoading(false);
  }
}

function isDateAllowed(date) {
    // 只能選擇今天之後的日期
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
}
</script>

<template>
  <v-container>
    <v-row>
      <v-col md="5" cols="12">
        <v-card rounded="lg">
          <v-card-title>1. 選擇日期</v-card-title>
          <v-date-picker 
            v-model="selectedDate"
            full-width
            color="primary"
            :allowed-dates="isDateAllowed"
          ></v-date-picker>
        </v-card>
      </v-col>
      <v-col md="7" cols="12">
        <v-card rounded="lg" class="fill-height">
          <v-card-title>2. 選擇時段</v-card-title>
          <v-card-subtitle v-if="selectedDate">{{ selectedDate.toLocaleDateString() }}</v-card-subtitle>
          <v-card-text>
            <v-skeleton-loader v-if="loadingSlots" type="chip@12"></v-skeleton-loader>
            <div v-else-if="timeSlots.length > 0" class="d-flex flex-wrap ga-2">
              <v-chip
                v-for="slot in timeSlots"
                :key="slot.time"
                :color="slot.isBooked ? '' : 'primary'"
                :disabled="slot.isBooked"
                @click="handleBookSlot(slot)"
                size="large"
                label
              >
                {{ slot.time }}
              </v-chip>
            </div>
            <div v-else class="text-center text-grey py-8">
              <v-icon icon="mdi-calendar-remove" size="48"></v-icon>
              <p class="mt-2">本日無可預約時段</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
