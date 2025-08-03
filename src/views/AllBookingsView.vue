<script setup>
import { ref } from 'vue';
import apiClient from '@/services/apiClient';

const itemsPerPage = ref(10);
const headers = ref([
  { title: '預約ID', key: 'id' },
  { title: '客戶名稱', key: 'userName', align: 'start' },
  { title: '預約時間', key: 'dateTime' },
]);

const serverItems = ref([]);
const loading = ref(true);
const totalItems = ref(0);
const search = ref('');

async function loadItems({ page, itemsPerPage, sortBy }) {
  loading.value = true;
  try {
    let url = `/bookings?_page=${page}&_limit=${itemsPerPage}`;
    
    // 處理排序
    if (sortBy && sortBy.length > 0) {
      url += `&_sort=${sortBy[0].key}&_order=${sortBy[0].order}`;
    } else {
      // 預設按時間倒序排列
      url += `&_sort=dateTime&_order=desc`;
    }

    // 處理搜尋
    if (search.value) {
      url += `&q=${search.value}`;
    }

    const response = await apiClient.get(url);
    serverItems.value = response.data;
    totalItems.value = parseInt(response.headers['x-total-count']) || 0;
  } catch (error) {
    console.error('Failed to load all bookings data:', error);
  } finally {
    loading.value = false;
  }
}

function formatDateTime(dateTimeString) {
  if (!dateTimeString) return 'N/A';
  return new Date(dateTimeString).toLocaleString('zh-TW');
}
</script>

<template>
  <v-container fluid>
    <v-card rounded="lg">
      <v-toolbar flat>
        <v-toolbar-title>所有預約紀錄</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          append-inner-icon="mdi-magnify"
          label="搜尋客戶名稱"
          single-line
          hide-details
          density="compact"
          style="max-width: 300px;"
        ></v-text-field>
      </v-toolbar>

      <v-data-table-server
        v-model:items-per-page="itemsPerPage"
        :headers="headers"
        :items="serverItems"
        :items-length="totalItems"
        :loading="loading"
        :search="search"
        item-value="id"
        @update:options="loadItems"
      >
        <template v-slot:item.dateTime="{ value }">
          {{ formatDateTime(value) }}
        </template>
      </v-data-table-server>
    </v-card>
  </v-container>
</template>
