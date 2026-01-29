import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import type { DayRow } from "./types";
import { CHALLENGE_TABLE_NAME } from "./utils";

export const useChallengeDays = () => {
  const [days, setDays] = useState<DayRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchDays = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from(CHALLENGE_TABLE_NAME)
        .select("id,date,exercises,is_done")
        .order("date", { ascending: true });

      if (!isMounted) return;

      if (error) {
        setError(error.message);
        setDays([]);
      } else {
        setDays(data ?? []);
      }
      setLoading(false);
    };

    fetchDays();
    return () => {
      isMounted = false;
    };
  }, []);

  return { days, loading, error };
};
