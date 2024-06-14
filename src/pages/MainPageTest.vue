<template>
  <q-page class="flex flex-center">
    <button @click="findNearbyRestaurants">내 주변 맛집 찾기</button>
    <div id="map" style="width: 60%; height: 80vh"></div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from "vue";

const { VITE_KAKAO_APP_KEY } = import.meta.env;

const markers = ref([]);
let map = ref(null); // const로 설정하면 에러
let ps = ref(null); // const로 설정하면 에러

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

const initKakaoMap = () => {
  const container = document.getElementById("map");

  const options = {
    center: new kakao.maps.LatLng(33.450701, 126.570667), // 지도 중심 좌표
    level: 4, // 지도 확대 레벨
  };

  map = new kakao.maps.Map(container, options); // 지도 생성
  ps = new kakao.maps.services.Places();
};

const displayMarkers = (places, latitude, longitude) => {
  // 기존 마커 제거
  markers.value.forEach((marker) => marker.setMap(null));
  markers.value = [];

  // 새 마커 생성 및 지도에 표시
  places.forEach((place) => {
    const marker = new kakao.maps.Marker({
      position: new kakao.maps.LatLng(place.y, place.x),
      map: map,
    });
    markers.value.push(marker);
  });

  // 지도 중심 이동
  map.setCenter(new kakao.maps.LatLng(latitude, longitude));
};

// 주변 맛집 검색
const findNearbyRestaurants = () => {
  if (!map || !ps) {
    return;
  }

  // 현재 위치 가져오기
  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;

    // 맛집 검색
    ps.categorySearch(
      "FD6",
      (data, status, _pagination) => {
        if (status === kakao.maps.services.Status.OK) {
          // 검색 결과 처리
          displayMarkers(data, latitude, longitude);
        }
      },
      {
        location: new kakao.maps.LatLng(latitude, longitude),
        radius: 500, // 반경 500m 내에서 검색
        sort: kakao.maps.services.SortBy.DISTANCE,
      }
    );
  });
};
</script>

<style scoped></style>
