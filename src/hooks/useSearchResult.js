import { useQuasar } from "quasar";

const useSearchResult = () => {
  const $q = useQuasar();

  const searchResultsPopup = (position, type, message, badgeColor) => {
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
  return { searchResultsPopup };
};
export default useSearchResult;
