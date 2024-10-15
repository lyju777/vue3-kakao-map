const useOverlayContents = () => {
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

  // overlayContents 닫기
  const closeOverlay = () => {
    document.getElementById("overlayWrap").style.display = "none";
  };

  // 전역 범위에 함수 노출 (overlayContents에서 onClick이벤트로 사용하기 위함)
  window.closeOverlay = closeOverlay;

  const hideAllOverlays = () => {
    const wrapElements = document.querySelectorAll(".wrap");
    wrapElements.forEach((element) => {
      element.parentNode.removeChild(element);
    });
  };
  return { overlayContents, hideAllOverlays };
};

export default useOverlayContents;
