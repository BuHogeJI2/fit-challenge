import { statusBannerClasses } from "./status-banner.styles";
import type { IStatusBannerProps } from "./status-banner.types";

export function StatusBanner({
  loading,
  error,
  daysCount,
}: IStatusBannerProps) {
  if (loading) {
    return (
      <div className={statusBannerClasses.loading}>
        Loading challenge data from Supabase...
      </div>
    );
  }

  if (error) {
    return (
      <div className={statusBannerClasses.error}>
        Unable to load days. {error}
      </div>
    );
  }

  if (daysCount === 0) {
    return (
      <div className={statusBannerClasses.empty}>
        No days found in the database yet. Add records to the{" "}
        <span className={statusBannerClasses.emptyHighlight}>Days</span> table
        to populate the challenge.
      </div>
    );
  }

  return null;
}
