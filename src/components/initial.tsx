import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export function Initial() {
  console.log(supabase);

  async function fetchDays() {
    const { data, error } = await supabase.from("Days").select("*");
    console.log({ data, error });
  }

  useEffect(() => {
    fetchDays();
  }, []);

  return <div>Initial</div>;
}
