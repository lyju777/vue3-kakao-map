<template>
  <div class="q-pa-md">
    <q-layout view="1Hh lpr 1Ff" class="shadow-2 rounded-borders">
      <q-header bordered class="bg-grey-3 text-primary">
        <q-toolbar>
          <q-toolbar-title class="text-center">
            <q-avatar>
              <img
                src="https://developers.kakao.com/tool/resource/static/img/logo/map/kakaomap_basic.png"
              />
            </q-avatar>
            뷰카오맵
          </q-toolbar-title>
        </q-toolbar>
      </q-header>

      <q-footer bordered class="bg-grey-3 text-primary">
        <q-tabs
          no-caps
          active-color="primary"
          indicator-color="transparent"
          class="text-grey-8"
          v-model="tab"
        >
          <q-tab
            ref="food"
            name="food"
            label="배고파"
            @click="onCategorySearch"
          />
          <q-tab
            ref="stay"
            name="stay"
            label="피곤해"
            @click="onCategorySearch"
          />
          <q-tab
            ref="play"
            name="play"
            label="심심해"
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

const onCategorySearch = () => {
  switch (tab.value) {
    case "food":
      searchCode.value = "FD6";
      break;
    case "stay":
      searchCode.value = "AD5";
      break;
    case "play":
      searchCode.value = "CT1";
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
