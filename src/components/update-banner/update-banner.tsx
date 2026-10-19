import { useRegisterSW } from "virtual:pwa-register/react";
import { Button } from "../ui";
import { updateBannerClasses } from "./update-banner.styles";

export function UpdateBanner() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) {
    return null;
  }

  return (
    <div role="status" className={updateBannerClasses.banner}>
      <p className={updateBannerClasses.text}>A new version of Fit is ready.</p>
      <div className={updateBannerClasses.actions}>
        <Button size="sm" onClick={() => void updateServiceWorker(true)}>
          Reload
        </Button>
        <Button variant="quiet" onClick={() => setNeedRefresh(false)}>
          Later
        </Button>
      </div>
    </div>
  );
}
