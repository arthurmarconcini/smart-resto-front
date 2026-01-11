import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Category } from "@/types";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await api.get<any>("/categories");
      console.log('Categories API response:', data);
      
      if (Array.isArray(data)) return data as Category[];
      if (data && Array.isArray(data.categories)) return data.categories as Category[];
      if (data && Array.isArray(data.data)) return data.data as Category[];
      
      return [] as Category[];
    },
  });
}
