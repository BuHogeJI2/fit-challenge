import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import type { TDayRow } from "./challenge.types";
import { CHALLENGE_TABLE_NAME } from "./challenge.constants";

export const useChallengeDays = () => {
  const [days, setDays] = useState<TDayRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchDays = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from(CHALLENGE_TABLE_NAME)
        .select("id,date,exercises,count,is_done")
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
