import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ServiceVisibility {
  service_id: string;
  visible: boolean;
  replaced_text: string | null;
}

export function useServiceVisibility() {
  const [visibilityMap, setVisibilityMap] = useState<Record<string, ServiceVisibility>>({});
  const [loading, setLoading] = useState(true);
  const [hasFetchedData, setHasFetchedData] = useState(false);

  useEffect(() => {
    async function fetchVisibility() {
      try {
        const { data, error } = await supabase
          .from('service_visibility')
          .select('*');

        if (error) {
          console.error('Error fetching service visibility:', error);
          setHasFetchedData(true);
          setLoading(false);
          return;
        }

        const map: Record<string, ServiceVisibility> = {};
        data?.forEach((item: ServiceVisibility) => {
          map[item.service_id] = item;
        });

        setVisibilityMap(map);
        setHasFetchedData(true);
      } catch (error) {
        console.error('Error in useServiceVisibility:', error);
        setHasFetchedData(true);
      } finally {
        setLoading(false);
      }
    }

    fetchVisibility();
  }, []);

  return { visibilityMap, loading, hasFetchedData };
}
