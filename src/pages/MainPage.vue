<template>
  <q-page class="flex flex-center">
    <div class="map_wrap">
      <div
        id="map"
        style="width: 100%; height: 100%; position: relative; overflow: hidden"
      ></div>
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
          <q-tooltip class="bg-black">현위치 이동</q-tooltip>
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
let map = ref(null); // const로 설정하면 에러
let ps = ref(null); // const로 설정하면 에러

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

// notify 검색결과 없음
const noSearchResults = (position) => {
  $q.notify({
    position,
    type: "info",
    color: "yellow",
    textColor: "black",
    message: "검색 결과가 없습니다...😥",
  });
};

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
  const currentLocation = new kakao.maps.LatLng(latitude, longitude);
  map.setCenter(currentLocation);
  map.setLevel(4, { anchor: currentLocation });
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
        if (status != kakao.maps.services.Status.OK) {
          // 기존 마커 제거
          markers.value.forEach((marker) => marker.setMap(null));
          markers.value = [];

          console.error(status);
          noSearchResults("top");
        }
        // 검색 결과 처리
        displayMarkers(data, latitude, longitude);
      },
      {
        location: new kakao.maps.LatLng(latitude, longitude),
        radius: 500, // 반경 500m 내에서 검색
        sort: kakao.maps.services.SortBy.DISTANCE,
      }
    );
  });
};

// 나의 현재 위치로 이동
const returnMyLocation = () => {
  if (!map) {
    return;
  }

  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;
    const currentLocation = new kakao.maps.LatLng(latitude, longitude);

    // 지도 중심 이동 (지도 레벨 4단계)
    map.setCenter(currentLocation);
    map.setLevel(4, { anchor: currentLocation });

    // 기존 마커 제거
    markers.value.forEach((marker) => marker.setMap(null));
    markers.value = [];

    // 사용자 현재 위치 마커 표시
    const marker = new kakao.maps.Marker({
      position: currentLocation,
      map: map,
    });
    markers.value.push(marker);
  });
};

// 호이스팅 이슈 함수 선언 이후 실행
defineExpose({
  findNearBySearch,
});
</script>

<style scoped lang="scss">
.map_wrap {
  position: relative;
  overflow: hidden;
  width: 60%;
  height: 80vh;
}

.currentLocation_btn {
  position: absolute;
  top: 15px;
  right: 15px;
  overflow: hidden;
  z-index: 9999;
  padding: 1px 3px 5px;
  box-shadow: 0 2px -1px rgba(0, 0, 0, 0.3);
  cursor: pointer;
}
</style>
