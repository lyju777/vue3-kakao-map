<template>
  <div class="q-pa-md">
    <q-layout view="1Hh lpr 1Ff" class="shadow-2 rounded-borders">
      <q-header class="bg-white" style="top: 8px; color: rgb(19 120 225)">
        <q-toolbar>
          <q-toolbar-title class="text-center">
            <q-avatar>
              <img
                src="https://developers.kakao.com/tool/resource/static/img/logo/map/kakaomap_basic.png"
              />
            </q-avatar>
            <span style="font-weight: 600; margin-left: 10px">Vuekao map</span>
          </q-toolbar-title>
        </q-toolbar>
      </q-header>

      <q-footer bordered class="bg-white text-primary">
        <q-tabs inline-label active-color="primary" v-model="tab">
          <q-tab
            ref="food"
            name="food"
            label="음식점🍴"
            @click="onCategorySearch"
          />
          <q-tab
            ref="cafe"
            name="cafe"
            label="카페☕"
            @click="onCategorySearch"
          />
          <q-tab
            ref="stay"
            name="stay"
            label="숙박🛏️"
            @click="onCategorySearch"
          />
          <q-tab
            ref="store"
            name="store"
            label="편의점🏪"
            @click="onCategorySearch"
          />
          <q-tab
            ref="carPark"
            name="carPark"
            label="주차장🚗"
            @click="onCategorySearch"
          />
        </q-tabs>
      </q-footer>

      <q-page-container>
        <q-page class="q-pa-md">
          <MainPage :searchCode="searchCode" ref="$childRef" />
        </q-page>
      </q-page-container>
    </q-layout>
  </div>
</template>

<script setup>
import MainPage from "src/pages/MainPage.vue";
import { ref } from "vue";

const tab = ref("food");
const searchCode = ref("FD6");
const $childRef = ref();

// 카테고리별 검색 코드 설정
const onCategorySearch = () => {
  switch (tab.value) {
    case "food":
      searchCode.value = "FD6";
      break;
    case "cafe":
      searchCode.value = "CE7";
      break;
    case "stay":
      searchCode.value = "AD5";
      break;
    case "store":
      searchCode.value = "CS2";
      break;
    case "carPark":
      searchCode.value = "OL7";
      break;
  }
  $childRef.value.findNearBySearch(); // MainPage의 findNearBySearch() 호출
};
</script>

<style scoped>
.q-pa-md {
  padding: 0px;
}
</style>
