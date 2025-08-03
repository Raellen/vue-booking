<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const email = ref('admin@example.com'); // 預填管理者 email 以方便測試
const password = ref('password');
const loading = ref(false);
const form = ref(null);

const handleLogin = async () => {
  const { valid } = await form.value.validate();
  if (!valid) return;

  loading.value = true;
  await authStore.login({ email: email.value, password: password.value });
  loading.value = false;
};
</script>

<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12" rounded="lg">
          <v-toolbar color="primary">
            <v-toolbar-title>預約服務系統登入</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form ref="form" @submit.prevent="handleLogin">
              <v-text-field
                label="電子郵件"
                v-model="email"
                prepend-inner-icon="mdi-email"
                type="email"
                :rules="[v => !!v || 'Email 為必填欄位']"
                required
              ></v-text-field>
              <v-text-field
                label="密碼"
                v-model="password"
                prepend-inner-icon="mdi-lock"
                type="password"
                hint="在此範例中，密碼欄位可為任意值"
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="handleLogin" :loading="loading" size="large">登入</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
