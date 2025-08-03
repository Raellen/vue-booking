<script setup>
import { ref, onMounted, reactive } from 'vue';
import apiClient from '@/services/apiClient';
import { useAppStore } from '@/stores/app';

const appStore = useAppStore();
const loading = ref(true);

const days = [
  { text: '星期一', value: 1 },
  { text: '星期二', value: 2 },
  { text: '星期三', value: 3 },
  { text: '星期四', value: 4 },
  { text: '星期五', value: 5 },
  { text: '星期六', value: 6 },
  { text: '星期日', value: 0 },
];

// **FIX:** 建立一個函式來生成完整的預設時程表結構
function createDefaultSchedule() {
  const defaultSchedule = {};
  for (let i = 0; i < 7; i++) {
    defaultSchedule[i] = { active: false, start: '09:00', end: '17:00' };
  }
  return defaultSchedule;
}

// **FIX:** 使用預設結構來初始化 schedule，確保它永遠不是空的
const schedule = reactive(createDefaultSchedule());

async function fetchAvailability() {
  loading.value = true;
  try {
    const { data } = await apiClient.get('/availability');
    // **FIX:** 將 API 回傳的資料合併到現有的 schedule 物件中
    // 確保即使 API 回傳的資料不完整，也不會造成錯誤
    if (data && data.length > 0 && data[0].schedule) {
        Object.assign(schedule, data[0].schedule);
    }
  } catch (error) {
    appStore.showSnackbar('讀取時段資料失敗', 'error');
    console.error("Failed to fetch availability:", error);
  } finally {
    loading.value = false;
  }
}

async function saveAvailability() {
  appStore.setGlobalLoading(true);
  try {
    // 當儲存時，我們需要符合 db.json 的格式，即一個包含物件的陣列
    const payload = [{
        id: "singleton", // 保持固定的 ID
        schedule: schedule 
    }];
    // 使用 PUT /availability 來替換整個陣列
    await apiClient.put('/availability', payload);
    appStore.showSnackbar('可預約時段已更新！', 'success');
  } catch (error) {
    appStore.showSnackbar('儲存失敗', 'error');
    console.error("Failed to save availability:", error);
  } finally {
    appStore.setGlobalLoading(false);
  }
}

onMounted(fetchAvailability);
</script>

<template>
  <v-container>
    <v-card rounded="lg">
      <v-card-title class="text-h5">設定每週可預約時段</v-card-title>
      <v-card-subtitle>勾選開放預約的星期，並設定時間範圍。</v-card-subtitle>
      <v-card-text>
        <v-skeleton-loader v-if="loading" type="list-item-three-line@7"></v-skeleton-loader>
        <!-- **FIX:** 由於 schedule 已被預先初始化，這裡的 v-if 不再是必需的，但保留也無妨 -->
        <div v-else>
          <div v-for="day in days" :key="day.value" class="d-flex align-center my-4 pa-3 border rounded">
            <v-checkbox-btn
              v-model="schedule[day.value].active"
              :label="day.text"
              class="flex-grow-1"
            ></v-checkbox-btn>
            <div class="d-flex" v-if="schedule[day.value].active">
              <v-text-field
                v-model="schedule[day.value].start"
                label="開始時間"
                type="time"
                density="compact"
                hide-details
                class="mx-2"
                style="max-width: 150px;"
              ></v-text-field>
              <v-text-field
                v-model="schedule[day.value].end"
                label="結束時間"
                type="time"
                density="compact"
                hide-details
                class="mx-2"
                style="max-width: 150px;"
              ></v-text-field>
            </div>
          </div>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" size="large" @click="saveAvailability">儲存設定</v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>
