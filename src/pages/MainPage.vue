<template>
  <q-page class="flex flex-center">
    <div class="map_wrap">
      <div
        id="map"
        style="width: 100%; height: 100%; position: relative; overflow: hidden"
      ></div>

      <q-dialog v-model="showSarchLocationDialog" persistent>
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">찾는 장소가 있나요?🧐</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-input
              dense
              v-model="searchKeyword"
              autofocus
              @keyup.enter="
                searchLocation();
                showSarchLocationDialog = false;
              "
            />
          </q-card-section>

          <q-card-actions align="right" class="text-primary">
            <q-btn flat label="취소" v-close-popup />
            <q-btn @click="searchLocation" flat label="찾기" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>

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

      <div class="searchLocation_btn">
        <q-btn
          id="searchLocation"
          class="selected_btn"
          push
          color="white"
          text-color="primary"
          padding="7px 7px"
          icon="search"
          @click="showSarchLocationDialog = true"
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

      <div class="saveLocation_btn">
        <q-btn
          id="saveLocation"
          class="selected_btn"
          push
          color="white"
          text-color="primary"
          padding="7px 7px"
          icon="star"
          @click="returnMyLocation"
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
import { ref, onMounted, defineProps, defineExpose } from "vue";
import { useQuasar } from "quasar";

const { VITE_KAKAO_APP_KEY } = import.meta.env;
const $q = useQuasar();

const markers = ref([]);
let map = null;
let ps = null;

const overlays = ref([]);

const showSarchLocationDialog = ref(false);
const searchKeyword = ref("");

const props = defineProps({
  searchCode: {
    type: String,
    required: true,
  },
});

// CustomOverlay적용
// 카카오맵 CustomOverlay 이슈 https://devtalk.kakao.com/t/topic/105513 (template적용 불가)
const overlayContents = (overlay) => {
  return `
    <div class="wrap">
      <div class="info">
        <div class="title">
          ${overlay.place.place_name}
          <div class="close" title="닫기" onclick="this.parentElement.parentElement.parentElement.style.display='none'"></div>
        </div>
        <div class="body">
          <div class="desc">
            <div class="ellipsis">${overlay.place.address_name}</div>
            <div class="jibun ellipsis">${overlay.place.road_address_name}</div>
              ${
                overlay.place.place_url
                  ? `<div><a href="${overlay.place.place_url}" target="_blank" class="link" style="text-decoration : none;">🔗</a></div>`
                  : ""
              }
          </div>
        </div>
      </div>
    </div>`;
};

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
});

const noSearchResults = (position, message) => {
  $q.notify({
    position,
    type: "info",
    color: "yellow",
    textColor: "black",
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

    // const circle = new kakao.maps.Circle({
    //   center: new kakao.maps.LatLng(latitude, longitude),
    //   radius: 500,
    //   strokeWeight: 1,
    //   strokeColor: "#75B8FA",
    //   strokeOpacity: 1,
    //   strokeStyle: "solid",
    //   fillColor: "#CFE7FF",
    //   fillOpacity: 0.4,
    //   map: map,
    // });

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
          noSearchResults("top", "검색 결과가 없습니다...😥");
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
  if (!map) {
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

  ps.keywordSearch(searchKeyword.value, (data, status, _pagination) => {
    if (status != kakao.maps.services.Status.OK) {
      markers.value.forEach((marker) => marker.setMap(null));
      markers.value = [];

      console.error(status);
      if (searchKeyword.value === "") {
        noSearchResults("top", "장소를 입력해주세요...😵");
      } else {
        noSearchResults("top", "검색 결과가 없습니다...😥");
      }
    }
    displayMarkers(data, data[0].y, data[0].x);
  });
};

defineExpose({
  findNearBySearch,
});
</script>

<style src="../css/MainPage.scss" lang="scss"></style>
