import { boot } from "quasar/wrappers";
import { useKakao } from "vue3-kakao-maps/@utils";

const { VITE_KAKAO_APP_KEY } = import.meta.env;

export default boot(async () => {
  useKakao(VITE_KAKAO_APP_KEY);
});
