import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  EmployeeCost,
  CreateEmployeeCostInput,
  UpdateEmployeeCostInput,
} from "@/types/employee-cost";

// Query Keys
export const employeeCostKeys = {
  all: ["employee-costs"] as const,
  lists: () => [...employeeCostKeys.all, "list"] as const,
  list: (companyId: string) => [...employeeCostKeys.lists(), companyId] as const,
};

// Queries
export function useEmployeeCosts(companyId: string) {
  return useQuery({
    queryKey: employeeCostKeys.list(companyId),
    queryFn: async () => {
      const { data } = await api.get<EmployeeCost[]>(
        `/companies/${companyId}/employee-costs`
      );
      return data;
    },
    enabled: !!companyId,
  });
}

// Mutations
export function useCreateEmployeeCost(companyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newEmployee: CreateEmployeeCostInput) => {
      const { data } = await api.post<EmployeeCost>(
        `/companies/${companyId}/employee-costs`,
        newEmployee
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeCostKeys.all });
      queryClient.invalidateQueries({ queryKey: ["finance"] }); // Atualiza previsão financeira
    },
  });
}

export function useUpdateEmployeeCost(companyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data: updateData,
    }: {
      id: string;
      data: UpdateEmployeeCostInput;
    }) => {
      const { data } = await api.put<EmployeeCost>(
        `/companies/${companyId}/employee-costs/${id}`,
        updateData
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeCostKeys.all });
      queryClient.invalidateQueries({ queryKey: ["finance"] });
    },
  });
}

export function useDeleteEmployeeCost(companyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/companies/${companyId}/employee-costs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeCostKeys.all });
      queryClient.invalidateQueries({ queryKey: ["finance"] });
    },
  });
}
