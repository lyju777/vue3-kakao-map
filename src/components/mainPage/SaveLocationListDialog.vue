<template>
  <!-- 저장 장소 리스트 Dialog -->
  <q-dialog v-model="showSaveLocationListDialog">
    <q-card>
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">저장한 장소</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section ection>
        <div class="q-pa-md flex justify-center">
          <div style="max-width: 100%; width: 300px">
            <q-intersection
              v-for="item in saveLocationList"
              :key="item.address_name"
              once
              transition="scale"
              class="example-item"
            >
              <q-item clickable v-ripple>
                <q-item-section @click="goToSaveLocation(item)">
                  <q-item-label style="font-weight: 700; color: #0063c9">{{
                    item.place_name
                  }}</q-item-label>
                  <q-item-label caption lines="1">{{
                    item.address_name
                  }}</q-item-label>
                </q-item-section>

                <q-item-section side>
                  <div style="display: flex">
                    <div
                      @click="
                        onCheckSaveListCancel(
                          item.address_name,
                          item.road_address_name,
                          item.place_name,
                          item.place_url
                        )
                      "
                      style="font-size: x-large"
                    >
                      💛
                    </div>
                  </div>
                </q-item-section>
              </q-item>
            </q-intersection>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>

  <!-- 저장 장소 리스트 취소 확인팝업 -->
  <q-dialog
    v-model="checkSaveListCancel"
    persistent
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card class="text-black" style="width: 340px">
      <q-card-section>
        <div class="text-h7" style="font-size: medium; margin: 10px">
          <span style="font-size: x-large">🤔</span>저장한 장소를 삭제
          하시겠습니까?
        </div>
      </q-card-section>

      <q-card-actions align="right" class="bg-white text-primary">
        <q-btn flat label="취소" v-close-popup />
        <q-btn
          flat
          label="확인"
          v-close-popup
          @click="
            onSaveLocation(
              saveLocationForm.address_name,
              saveLocationForm.road_address_name,
              saveLocationForm.place_name,
              saveLocationForm.place_url
            )
          "
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { defineEmits, defineProps, defineModel } from "vue";

const showSaveLocationListDialog = defineModel("showSaveLocationListDialog");
const checkSaveListCancel = defineModel("checkSaveListCancel");

const props = defineProps(["saveLocationList", "saveLocationForm"]);
const emit = defineEmits([
  "goToSaveLocation",
  "onCheckSaveListCancel",
  "onSaveLocation",
]);

const onSaveLocation = (
  address_name,
  road_address_name,
  place_name,
  place_url
) => {
  emit(
    "onSaveLocation",
    address_name,
    road_address_name,
    place_name,
    place_url
  );
};

const onCheckSaveListCancel = (
  address_name,
  road_address_name,
  place_name,
  place_url
) => {
  emit(
    "onCheckSaveListCancel",
    address_name,
    road_address_name,
    place_name,
    place_url
  );
};

const goToSaveLocation = (item) => {
  emit("goToSaveLocation", item);
};
</script>

<style lang="scss" scoped></style>
