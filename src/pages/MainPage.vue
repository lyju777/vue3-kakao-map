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
let map = null;
let ps = null;

const overlays = ref([]);

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
            <div>
              <a href="${overlay.place.place_url}" target="_blank" class="link" style="text-decoration : none;">바로가기📍</a>
            </div>
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

const noSearchResults = (position) => {
  $q.notify({
    position,
    type: "info",
    color: "yellow",
    textColor: "black",
    message: "검색 결과가 없습니다...😥",
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

    const circle = new kakao.maps.Circle({
      center: new kakao.maps.LatLng(latitude, longitude),
      radius: 500,
      strokeWeight: 1,
      strokeColor: "#75B8FA",
      strokeOpacity: 1,
      strokeStyle: "solid",
      fillColor: "#CFE7FF",
      fillOpacity: 0.4,
      map: map,
    });

    overlays.value.push({
      place: {
        place_name: "현위치",
        address_name: "현재 위치",
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

// 내 주변 버튼 클릭 검색(배고파🍕,피곤해🛏️,심심해🕹️)
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
          noSearchResults("top");
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

// 현위치 이동
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
        address_name: "현재 위치",
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

defineExpose({
  findNearBySearch,
});
</script>

<style lang="scss">
.map_wrap {
  position: relative;
  overflow: hidden;
  width: 60%;
  height: 80vh;

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

  .wrap {
    position: absolute;
    left: 0;
    bottom: 40px;
    width: 288px;
    height: 132px;
    margin-left: -144px;
    text-align: left;
    overflow: hidden;
    font-size: 14px;
    font-family: "Malgun Gothic", dotum, "돋움", sans-serif;
    line-height: 1.5;
    z-index: 999;

    > * {
      padding: 0;
      margin: 0;
    }

    .info {
      width: 286px;
      height: 120px;
      border-radius: 5px;
      border-bottom: 2px solid #ccc;
      border-right: 1px solid #ccc;
      overflow: hidden;
      background: #fff;

      &:nth-child(1) {
        border: 0;
        box-shadow: 0px 1px 2px #888;
      }

      .title {
        padding: 5px 0 0 10px;
        height: 34px;
        background: #eee;
        border-bottom: 1px solid #ddd;
        font-size: 18px;
        font-weight: bold;

        .close {
          position: absolute;
          top: 10px;
          right: 10px;
          color: #888;
          width: 17px;
          height: 17px;
          background: url("https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/overlay_close.png");

          &:hover {
            cursor: pointer;
          }
        }
      }

      .body {
        position: relative;
        overflow: hidden;

        .desc {
          position: relative;
          margin: 13px 0 0 8px;
          height: 75px;

          .ellipsis {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .jibun {
            font-size: 11px;
            color: #888;
            margin-top: -2px;
          }
        }

        .img {
          position: absolute;
          top: 6px;
          left: 5px;
          width: 73px;
          height: 71px;
          border: 1px solid #ddd;
          color: #888;
          overflow: hidden;
        }
      }

      &:after {
        content: "";
        position: absolute;
        margin-left: -12px;
        left: 50%;
        bottom: 0;
        width: 22px;
        height: 12px;
        background: url("https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/vertex_white.png");
      }

      .link {
        color: #5085bb;
      }
    }
  }
}
</style>
