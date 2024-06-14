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
          <q-tab name="images" label="주변맛집" />
          <q-tab name="videos" label="Videos" />
          <q-tab name="articles" label="Articles" />
        </q-tabs>
      </q-footer>

      <q-page-container>
        <q-page class="q-pa-md">
          <router-view />
        </q-page>
      </q-page-container>
    </q-layout>
  </div>
</template>

<script>
import { ref } from "vue";

export default {
  setup() {
    return {
      tab: ref("images"),
    };
  },
};
</script>

<style scoped>
.q-pa-md {
  padding: 0px;
}
</style>
