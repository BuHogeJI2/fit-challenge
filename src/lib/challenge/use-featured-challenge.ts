import { useEffect, useState } from "react";
import type { TFeaturedChallenge } from "./challenge.types";
import { fetchFeaturedChallenge } from "./challenge.api";

export const useFeaturedChallenge = () => {
  const [challenge, setChallenge] = useState<TFeaturedChallenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadChallenge = async () => {
      setLoading(true);
      setError(null);

      try {
        const featuredChallenge = await fetchFeaturedChallenge();
        if (!isMounted) return;

        setChallenge(featuredChallenge);
      } catch (loadError) {
        if (!isMounted) return;

        setChallenge(null);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unexpected challenge loading error.",
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadChallenge();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    challenge,
    loading,
    error,
  };
};
