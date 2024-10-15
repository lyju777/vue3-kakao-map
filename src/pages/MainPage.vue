<template>
  <q-page class="flex flex-center">
    <div class="map_wrap">
      <div id="map"></div>

      <!-- 장소검색 Dialog -->
      <search-location-dialog
        v-model:showSearchLocationDialog="showSearchLocationDialog"
        v-model:searchKeyword="searchKeyword"
        :isSearchKeyword="isSearchKeyword"
        @searchLocation="searchLocation"
      ></search-location-dialog>

      <!-- 저장 장소 리스트 Dialog -->
      <save-location-list-dialog
        v-model:showSaveLocationListDialog="showSaveLocationListDialog"
        v-model:checkSaveListCancel="checkSaveListCancel"
        :saveLocationList="saveLocationList"
        :saveLocationForm="saveLocationForm"
        @goToSaveLocation="goToSaveLocation"
        @onCheckSaveListCancel="onCheckSaveListCancel"
        @onSaveLocation="onSaveLocation"
      ></save-location-list-dialog>

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
import SearchLocationDialog from "src/components/mainPage/SearchLocationDialog.vue";
import SaveLocationListDialog from "src/components/mainPage/SaveLocationListDialog.vue";

import useSearchResult from "src/hooks/useSearchResult";
import useOverlayContents from "src/hooks/useOverlayContents";
import useSaveLocation from "src/hooks/useSaveLocation";

const props = defineProps({
  searchCode: {
    type: String,
    required: true,
  },
});

const { VITE_KAKAO_APP_KEY } = import.meta.env;

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

onMounted(() => {
  const script = document.createElement("script");
  script.type = "text/javascript";
  script.src = `//dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=${VITE_KAKAO_APP_KEY}&libraries=services`;

  script.onload = () => {
    window.kakao.maps.load(() => {
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

// 카카오맵 초기화
const initKakaoMap = () => {
  const container = document.getElementById("map");

  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;
    const options = {
      center: new window.kakao.maps.LatLng(latitude, longitude),
      level: 3,
    };

    map = new window.kakao.maps.Map(container, options);
    ps = new window.kakao.maps.services.Places();

    const marker = new window.kakao.maps.Marker({
      position: new window.kakao.maps.LatLng(latitude, longitude),
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

    const overlay = new window.kakao.maps.CustomOverlay({
      clickable: true,
      content: overlayContents(overlays.value[overlayIndex]),
      map: null,
      position: marker.getPosition(),
    });

    window.kakao.maps.event.addListener(marker, "click", function () {
      hideAllOverlays();
      overlay.setContent(overlayContents(overlays.value[overlayIndex]));
      overlay.setMap(map);
    });

    window.kakao.maps.event.addListener(map, "click", function () {
      hideAllOverlays();
    });

    window.kakao.maps.event.addListener(map, "dragstart", function () {
      hideAllOverlays();
    });
  });
};

// 저장된 장소로 이동
const goToSaveLocation = (item) => {
  if (!map || !ps) {
    return;
  }

  hideAllOverlays();
  const geocoder = new window.kakao.maps.services.Geocoder();

  geocoder.addressSearch(item.address_name, (result, status) => {
    if (status === window.kakao.maps.services.Status.OK) {
      const { y: latitude, x: longitude } = result[0];

      // 기존 마커 제거
      markers.value.forEach((marker) => marker.setMap(null));
      markers.value = [];

      // 새로운 마커 생성
      const marker = new window.kakao.maps.Marker({
        position: new window.kakao.maps.LatLng(latitude, longitude),
        map: map,
      });

      // 마커 배열에 추가
      markers.value.push(marker);

      // 지도 중심을 검색된 주소로 이동
      const currentLocation = new window.kakao.maps.LatLng(latitude, longitude);
      map.setCenter(currentLocation);
      map.setLevel(3, { anchor: currentLocation });

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

      const overlay = new window.kakao.maps.CustomOverlay({
        clickable: true,
        content: overlayContents(overlays.value[overlayIndex]),
        map: null,
        position: marker.getPosition(),
      });

      window.kakao.maps.event.addListener(marker, "click", function () {
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

// 장소검색
const searchLocation = () => {
  if (!map || !ps) {
    return;
  }

  hideAllOverlays();

  ps.keywordSearch(searchKeyword.value, (data, status) => {
    if (status !== window.kakao.maps.services.Status.OK) {
      markers.value.forEach((marker) => marker.setMap(null));
      markers.value = [];

      console.error(status);

      searchResultsPopup("top", "info", "검색 결과가 없습니다.😥", "negative");
    } else {
      displayMarkers(data, data[0].y, data[0].x);
    }
  });
};

// 검색어 입력 체크
const isSearchKeyword = computed(() => searchKeyword.value.trim() !== "");

// 검색마커 노출
const displayMarkers = (places, latitude, longitude) => {
  markers.value.forEach((marker) => marker.setMap(null));
  markers.value = [];
  overlays.value = [];

  places.forEach((place, index) => {
    const marker = new window.kakao.maps.Marker({
      position: new window.kakao.maps.LatLng(place.y, place.x),
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

    const overlay = new window.kakao.maps.CustomOverlay({
      clickable: true,
      content: overlayContents(overlays.value[overlayIndex]),
      map: null,
      position: marker.getPosition(),
    });

    window.kakao.maps.event.addListener(marker, "click", function () {
      hideAllOverlays();
      overlay.setContent(overlayContents(overlays.value[overlayIndex]));
      overlay.setMap(map);
    });
  });

  const currentLocation = new window.kakao.maps.LatLng(latitude, longitude);
  map.setCenter(currentLocation);
  map.setLevel(3, { anchor: currentLocation });
};

// 현위치로 이동
const returnMyLocation = () => {
  if (!map || !ps) {
    return;
  }

  hideAllOverlays();

  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;
    const currentLocation = new window.kakao.maps.LatLng(latitude, longitude);

    map.setCenter(currentLocation);
    map.setLevel(3, { anchor: currentLocation });

    markers.value.forEach((marker) => marker.setMap(null));
    markers.value = [];

    const marker = new window.kakao.maps.Marker({
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

    const overlay = new window.kakao.maps.CustomOverlay({
      clickable: true,
      content: overlayContents(overlays.value[overlayIndex]),
      map: null,
      position: marker.getPosition(),
    });

    overlays.value[overlayIndex].overlay = overlay; // CustomOverlay 객체 저장

    window.kakao.maps.event.addListener(marker, "click", function () {
      hideAllOverlays();
      overlay.setContent(overlayContents(overlays.value[overlayIndex]));
      overlay.setMap(map);
    });
  });
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
      (data, status) => {
        if (status != window.kakao.maps.services.Status.OK) {
          markers.value.forEach((marker) => marker.setMap(null));
          markers.value = [];

          console.error(status);
          searchResultsPopup(
            "top",
            "info",
            "검색 결과가 없습니다.😥",
            "negative"
          );
        }
        displayMarkers(data, latitude, longitude);
      },
      {
        location: new window.kakao.maps.LatLng(latitude, longitude),
        radius: 500,
        sort: window.kakao.maps.services.SortBy.DISTANCE,
      }
    );
  });
};

const { searchResultsPopup } = useSearchResult();
const { overlayContents, hideAllOverlays } = useOverlayContents();
const { onSaveLocation } = useSaveLocation(saveLocationForm);

// 외부에서 호출할 함수 정의
defineExpose({
  findNearBySearch,
});
</script>

<style src="../css/MainPage.scss" lang="scss"></style>
