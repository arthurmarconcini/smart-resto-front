import { api } from "@/lib/api";
import { 
  type EmployeeCost, 
  type CreateEmployeeCostInput, 
  type UpdateEmployeeCostInput 
} from "@/types/employee-cost";

export const getEmployeeCosts = async (companyId: string) => {
  const { data } = await api.get<EmployeeCost[]>(`/companies/${companyId}/employee-costs`);
  return data;
};

export const createEmployeeCost = async (companyId: string, data: CreateEmployeeCostInput) => {
  const { data: result } = await api.post<EmployeeCost>(
    `/companies/${companyId}/employee-costs`,
    data
  );
  return result;
};

export const updateEmployeeCost = async (
  companyId: string, 
  id: string, 
  data: UpdateEmployeeCostInput
) => {
  const { data: result } = await api.put<EmployeeCost>(
    `/companies/${companyId}/employee-costs/${id}`,
    data
  );
  return result;
};

export const deleteEmployeeCost = async (companyId: string, id: string) => {
  await api.delete(`/companies/${companyId}/employee-costs/${id}`);
};
