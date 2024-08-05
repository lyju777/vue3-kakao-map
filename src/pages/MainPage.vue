<template>
  <q-page class="flex flex-center">
    <div class="map_wrap">
      <div
        id="map"
        style="width: 100%; height: 100%; position: relative; overflow: hidden"
      ></div>

      <!-- 장소검색 Dialog -->
      <SearchLocationDialog
        v-model:showSearchLocationDialog="showSearchLocationDialog"
        v-model:searchKeyword="searchKeyword"
        :isSearchKeyword="isSearchKeyword"
        @searchLocation="searchLocation"
      ></SearchLocationDialog>

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

      <!-- 현위치 이동 Button -->
      <div class="currentLocation_btn">
        <q-btn
          id="currentLocation"
          class="selected_btn"
          push
          color="white"
          text-color="primary"
          padding="7px 7px"
          icon="my_location"
          @click="returnMyLocation"
        >
          <q-tooltip
            anchor="center left"
            self="center right"
            :offset="[7, 7]"
            class="bg-black"
            >현위치 이동</q-tooltip
          >
        </q-btn>
      </div>

      <!-- 장소검색 Button-->
      <div class="searchLocation_btn">
        <q-btn
          id="searchLocation"
          class="selected_btn"
          push
          color="white"
          text-color="primary"
          padding="7px 7px"
          icon="search"
          @click="showSearchLocationDialog = true"
        >
          <q-tooltip
            anchor="center left"
            self="center right"
            :offset="[7, 7]"
            class="bg-black"
            >장소검색</q-tooltip
          >
        </q-btn>
      </div>

      <!-- 저장 장소리스트 Button -->
      <div class="saveLocation_btn">
        <q-btn
          id="saveLocation"
          class="selected_btn"
          push
          color="white"
          text-color="primary"
          padding="7px 7px"
          icon="favorite"
          @click="showSaveLocationListDialog = true"
        >
          <q-tooltip
            anchor="center left"
            self="center right"
            :offset="[7, 7]"
            class="bg-black"
            >저장 장소리스트</q-tooltip
          >
        </q-btn>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import {
  ref,
  onMounted,
  defineProps,
  defineExpose,
  watch,
  computed,
} from "vue";
import { useQuasar } from "quasar";
import SearchLocationDialog from "src/components/mainPage/SearchLocationDialog.vue";

const { VITE_KAKAO_APP_KEY } = import.meta.env;
const $q = useQuasar();

let map = null;
let ps = null;

const markers = ref([]);
const overlays = ref([]);

// 장소검색 다이얼로그
const showSearchLocationDialog = ref(false);
// 저장 장소 리스트 다이얼로그
const showSaveLocationListDialog = ref(false);
// 저장 장소 리스트 취소 확인
const checkSaveListCancel = ref(false);

// 장소검색 입력값
const searchKeyword = ref("");

// 저장하고 싶은 장소 정보
const saveLocationForm = ref({
  address_name: "",
  road_address_name: "",
  place_name: "",
  place_url: "",
});

// 저장된 장소 리스트
const saveLocationList = ref([]);

const props = defineProps({
  searchCode: {
    type: String,
    required: true,
  },
});

// 저장된 장소로 이동
const goToSaveLocation = (item) => {
  if (!map || !ps) {
    return;
  }

  hideAllOverlays();
  const geocoder = new kakao.maps.services.Geocoder();

  geocoder.addressSearch(item.address_name, (result, status) => {
    if (status === kakao.maps.services.Status.OK) {
      const { y: latitude, x: longitude } = result[0];

      // 기존 마커 제거
      markers.value.forEach((marker) => marker.setMap(null));
      markers.value = [];

      // 새로운 마커 생성
      const marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(latitude, longitude),
        map: map,
      });

      // 마커 배열에 추가
      markers.value.push(marker);

      // 지도 중심을 검색된 주소로 이동
      const currentLocation = new kakao.maps.LatLng(latitude, longitude);
      map.setCenter(currentLocation);
      map.setLevel(4, { anchor: currentLocation });

      showSaveLocationListDialog.value = false;

      overlays.value.push({
        place: {
          place_name: item.place_name,
          address_name: item.address_name,
          road_address_name: item.road_address_name,
          place_url: item.place_url,
        },
      });

      const overlayIndex = overlays.value.length - 1;

      const overlay = new kakao.maps.CustomOverlay({
        content: overlayContents(overlays.value[overlayIndex]),
        map: null,
        position: marker.getPosition(),
      });

      kakao.maps.event.addListener(marker, "click", function () {
        hideAllOverlays();
        overlay.setContent(overlayContents(overlays.value[overlayIndex]));
        overlay.setMap(map);
      });
    }
  });
};

// 저장된 장소 리스트에서 삭제
const onCheckSaveListCancel = (
  address_name,
  road_address_name,
  place_name,
  place_url
) => {
  saveLocationForm.value = {
    address_name: address_name,
    road_address_name: road_address_name,
    place_name: place_name,
    place_url: place_url,
  };

  checkSaveListCancel.value = true;
};

// 검색어 입력 체크
const isSearchKeyword = computed(() => searchKeyword.value.trim() !== "");

// 해당 overlayContents의 주소(address_name)가 localStorage에 저장되었는지 체크
const isAddressSaved = (address_name, place_name) => {
  const savedAddresses = localStorage.getItem("saved_address");
  if (savedAddresses) {
    const parsedAddresses = JSON.parse(savedAddresses);
    return parsedAddresses.some(
      (data) =>
        data.address_name === address_name && data.place_name === place_name
    );
  }
  return false;
};

// CustomOverlay적용
// 카카오맵 CustomOverlay 이슈 https://devtalk.kakao.com/t/topic/105513 (template적용 불가)
const overlayContents = (overlay) => {
  const isSaved = isAddressSaved(
    overlay.place.address_name,
    overlay.place.place_name
  );
  const saveButtonText = isSaved ? "💛" : "🤍";
  return `
    <div id="overlayWrap" class="wrap">
      <div class="info">
        <div class="title">
          ${
            overlay.place.place_name.length > 14
              ? overlay.place.place_name.slice(0, 14) + "..."
              : overlay.place.place_name
          }
          <div id="overlayClose" class="close" title="닫기" onclick="closeOverlay()"></div>
        </div>
        <div class="body">
          <div class="desc">
            <div class="ellipsis">${overlay.place.address_name}</div>
            <div class="jibun ellipsis">${overlay.place.road_address_name}</div>
              ${
                overlay.place.place_url
                  ? `<div style="font-size:large;"><a href="${overlay.place.place_url}" target="_blank" class="link" style="text-decoration : none;">🔗</a>
                     <span style="margin-left: 10px;" class="saveButton" onclick="onSaveLocation('${overlay.place.address_name}','${overlay.place.road_address_name}','${overlay.place.place_name}','${overlay.place.place_url}')" class="q-gutter-sm">${saveButtonText}</span>
                      </div>`
                  : ""
              }
          </div>
        </div>
      </div>
    </div>`;
};

// overlayContents 닫기
const closeOverlay = () => {
  document.getElementById("overlayWrap").style.display = "none";
};

// 전역 범위에 함수 노출 (overlayContents에서 onClick이벤트로 사용하기 위함)
window.closeOverlay = closeOverlay;

// 저장하고 싶은 장소 저장
const onSaveLocation = (
  address_name,
  road_address_name,
  place_name,
  place_url
) => {
  const element = document.querySelector(".saveButton");

  saveLocationForm.value = {
    address_name: address_name,
    road_address_name: road_address_name,
    place_name: place_name,
    place_url: place_url,
  };

  // 기존 배열을 가져오기
  let getSavedAddress = localStorage.getItem("saved_address");
  getSavedAddress = getSavedAddress ? JSON.parse(getSavedAddress) : [];

  // 이미 저장된 장소인지 확인
  if (getSavedAddress.some((data) => data.address_name === address_name)) {
    const index = getSavedAddress.findIndex(
      (data) => data.address_name === address_name
    );
    getSavedAddress.splice(index, 1);
    SearchResultsPopup(
      "top",
      "positive",
      "장소 저장이 취소 되었습니다.🤗",
      "positive"
    );

    // 배열을 다시 로컬 스토리지에 저장
    localStorage.setItem("saved_address", JSON.stringify(getSavedAddress));
    if (element) {
      element.textContent = "🤍";
    }

    return;
  }
  // 새로운 장소 저장
  getSavedAddress.push(saveLocationForm.value);

  // 배열을 다시 로컬 스토리지에 저장
  localStorage.setItem("saved_address", JSON.stringify(getSavedAddress));
  SearchResultsPopup(
    "top",
    "positive",
    "장소가 저장 되었습니다.😎",
    "positive"
  );
  if (element) {
    element.textContent = "💛";
  }
  console.log("저장완료");
};

// 전역 범위에 함수 노출 (overlayContents에서 onClick이벤트로 사용하기 위함)
window.onSaveLocation = onSaveLocation;

onMounted(() => {
  const script = document.createElement("script");
  script.type = "text/javascript";
  script.src = `//dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=${VITE_KAKAO_APP_KEY}&libraries=services`;

  script.onload = () => {
    kakao.maps.load(() => {
      initKakaoMap();
    });
  };
  document.head.appendChild(script);

  const getSavedAddress = localStorage.getItem("saved_address");
  saveLocationList.value = getSavedAddress ? JSON.parse(getSavedAddress) : [];
});

// localStorage 데이터 변경 감지
watch(
  () => saveLocationForm.value,
  (newVal, oldVal) => {
    const getSavedAddress = localStorage.getItem("saved_address");
    saveLocationList.value = getSavedAddress ? JSON.parse(getSavedAddress) : [];
    console.log("LocalStorage 변경 감지");
  }
);

// 검색결과 팝업
const SearchResultsPopup = (position, type, message, badgeColor) => {
  $q.notify({
    position,
    type: type,
    color: "yellow",
    textColor: "black",
    badgeColor: badgeColor,
    badgeTextColor: "white",
    message: message,
  });
};

// 카카오맵 초기화
const initKakaoMap = () => {
  const container = document.getElementById("map");

  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;
    const options = {
      center: new kakao.maps.LatLng(latitude, longitude),
      level: 4,
    };

    map = new kakao.maps.Map(container, options);
    ps = new kakao.maps.services.Places();

    const marker = new kakao.maps.Marker({
      position: new kakao.maps.LatLng(latitude, longitude),
      map: map,
    });
    markers.value.push(marker);

    overlays.value.push({
      place: {
        place_name: "현위치",
        address_name: "현재 나의 위치입니다.",
        road_address_name: "",
        place_url: "",
      },
    });

    const overlayIndex = overlays.value.length - 1;

    const overlay = new kakao.maps.CustomOverlay({
      content: overlayContents(overlays.value[overlayIndex]),
      map: null,
      position: marker.getPosition(),
    });

    kakao.maps.event.addListener(marker, "click", function () {
      hideAllOverlays();
      overlay.setContent(overlayContents(overlays.value[overlayIndex]));
      overlay.setMap(map);
    });
  });
};

// 검색마커 노출
const displayMarkers = (places, latitude, longitude) => {
  markers.value.forEach((marker) => marker.setMap(null));
  markers.value = [];
  overlays.value = [];

  places.forEach((place, index) => {
    const marker = new kakao.maps.Marker({
      position: new kakao.maps.LatLng(place.y, place.x),
      map: map,
    });
    markers.value.push(marker);

    overlays.value.push({
      place: {
        place_name: place.place_name,
        address_name: place.address_name,
        road_address_name: place.road_address_name,
        place_url: place.place_url,
      },
    });

    const overlayIndex = overlays.value.length - 1;

    const overlay = new kakao.maps.CustomOverlay({
      content: overlayContents(overlays.value[overlayIndex]),
      map: null,
      position: marker.getPosition(),
    });

    kakao.maps.event.addListener(marker, "click", function () {
      hideAllOverlays();
      overlay.setContent(overlayContents(overlays.value[overlayIndex]));
      overlay.setMap(map);
    });
  });

  const currentLocation = new kakao.maps.LatLng(latitude, longitude);
  map.setCenter(currentLocation);
  map.setLevel(4, { anchor: currentLocation });
};

// 내 주변 주요시설 빠른검색(음식점🍴,카페☕,숙박🛏️,편의점🏪,주차장🚗)
const findNearBySearch = () => {
  if (!map || !ps) {
    return;
  }

  hideAllOverlays();

  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;

    ps.categorySearch(
      props.searchCode,
      (data, status, _pagination) => {
        if (status != kakao.maps.services.Status.OK) {
          markers.value.forEach((marker) => marker.setMap(null));
          markers.value = [];

          console.error(status);
          SearchResultsPopup(
            "top",
            "info",
            "검색 결과가 없습니다.😥",
            "negative"
          );
        }
        displayMarkers(data, latitude, longitude);
      },
      {
        location: new kakao.maps.LatLng(latitude, longitude),
        radius: 500,
        sort: kakao.maps.services.SortBy.DISTANCE,
      }
    );
  });
};

// 기존의 모든 .wrap div 요소를 화면에서 제거
const hideAllOverlays = () => {
  const wrapElements = document.querySelectorAll(".wrap");
  wrapElements.forEach((element) => {
    element.parentNode.removeChild(element);
  });
};

// 현위치로 이동
const returnMyLocation = () => {
  if (!map || !ps) {
    return;
  }

  hideAllOverlays();

  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;
    const currentLocation = new kakao.maps.LatLng(latitude, longitude);

    map.setCenter(currentLocation);
    map.setLevel(4, { anchor: currentLocation });

    markers.value.forEach((marker) => marker.setMap(null));
    markers.value = [];

    const marker = new kakao.maps.Marker({
      position: currentLocation,
      map: map,
    });
    markers.value.push(marker);

    overlays.value.push({
      place: {
        place_name: "현위치",
        address_name: "현재 나의 위치입니다.",
        road_address_name: "",
        place_url: "",
      },
    });

    const overlayIndex = overlays.value.length - 1;

    const overlay = new kakao.maps.CustomOverlay({
      content: overlayContents(overlays.value[overlayIndex]),
      map: null,
      position: marker.getPosition(),
    });

    overlays.value[overlayIndex].overlay = overlay; // CustomOverlay 객체 저장

    kakao.maps.event.addListener(marker, "click", function () {
      hideAllOverlays();
      overlay.setContent(overlayContents(overlays.value[overlayIndex]));
      overlay.setMap(map);
    });
  });
};

// 장소검색
const searchLocation = () => {
  if (!map || !ps) {
    return;
  }

  hideAllOverlays();

  ps.keywordSearch(searchKeyword.value, (data, status) => {
    if (status !== kakao.maps.services.Status.OK) {
      markers.value.forEach((marker) => marker.setMap(null));
      markers.value = [];

      console.error(status);

      SearchResultsPopup("top", "info", "검색 결과가 없습니다.😥", "negative");
    } else {
      displayMarkers(data, data[0].y, data[0].x);
    }
  });
};

// 외부에서 호출할 함수 정의
defineExpose({
  findNearBySearch,
});
</script>

<style src="../css/MainPage.scss" lang="scss"></style>
