import useSearchResult from "./useSearchResult";

const useSaveLocation = (saveLocationForm) => {
  const { searchResultsPopup } = useSearchResult();
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
      searchResultsPopup(
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
    searchResultsPopup(
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

  return { onSaveLocation };
};

export default useSaveLocation;
