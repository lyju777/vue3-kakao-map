<template>
  <q-page class="flex flex-center">
    <div id="map" style="width: 60%; height: 80vh"></div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, defineProps, defineExpose } from "vue";

const { VITE_KAKAO_APP_KEY } = import.meta.env;

const markers = ref([]);
let map = ref(null); // const로 설정하면 에러
let ps = ref(null); // const로 설정하면 에러
const PlacesResult = ref([]); // places() 검색 결과값

const props = defineProps({
  searchCode: {
    type: String,
    required: true,
  },
});

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

  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;
    const options = {
      center: new kakao.maps.LatLng(latitude, longitude), // 사용자 현재 위치 중심
      level: 4, // 지도 확대 레벨
    };

    map = new kakao.maps.Map(container, options); // 지도 생성
    ps = new kakao.maps.services.Places();

    // 사용자 현재 위치 마커 표시
    const marker = new kakao.maps.Marker({
      position: new kakao.maps.LatLng(latitude, longitude),
      map: map,
    });
    markers.value.push(marker);

    // 사용자 현재 위치 중심 원 표시
    const circle = new kakao.maps.Circle({
      center: new kakao.maps.LatLng(latitude, longitude),
      radius: 500, // 반경 500m
      strokeWeight: 1, // 선 두께
      strokeColor: "#75B8FA", // 선 색깔
      strokeOpacity: 1, // 선 투명도
      strokeStyle: "solid", // 선 스타일
      fillColor: "#CFE7FF", // 채우기 색깔
      fillOpacity: 0.4, // 채우기 투명도
      map: map, // 지도에 표시할 원
    });
  });
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

// 주변 검색
const findNearBySearch = () => {
  if (!map || !ps) {
    return;
  }

  // 현재 위치 가져오기
  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;

    // 원하는 장소 카테고리 클릭하여 마커 표시
    ps.categorySearch(
      props.searchCode,
      (data, status, _pagination) => {
        if (status === kakao.maps.services.Status.OK) {
          PlacesResult.value = data;
          // 검색 결과 처리
          displayMarkers(data, latitude, longitude);
        } else {
          PlacesResult.value = [];

          // 기존 마커 제거
          markers.value.forEach((marker) => marker.setMap(null));
          markers.value = [];

          console.error(status);
          alert("검색결과가 없습니다.");
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

// 호이스팅 이슈 함수 선언 이후 실행
defineExpose({
  findNearBySearch,
});
</script>

<style scoped></style>
