<template>
  <q-dialog v-model="showSearchLocationDialog" persistent>
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6" style="font-size: large">
          <span style="font-size: x-large">🧐</span>찾으시는 장소가 있나요?
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-input
          dense
          v-model="searchKeyword"
          autofocus
          placeholder="키워드를 입력하세요. ex) 제주도 맛집"
          @keyup.enter="
            if (isSearchKeyword) {
              searchLocation();
              showSearchLocationDialog = false;
            }
          "
        />
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn flat label="취소" v-close-popup />
        <q-btn
          :disable="!isSearchKeyword"
          @click="searchLocation"
          flat
          label="찾기"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { defineEmits, defineProps, defineModel } from "vue";

const showSearchLocationDialog = defineModel("showSearchLocationDialog");
const searchKeyword = defineModel("searchKeyword");

const props = defineProps(["isSearchKeyword"]);
const emit = defineEmits(["searchLocation"]);

const searchLocation = () => {
  emit("searchLocation");
};
</script>

<style lang="scss" scoped></style>
