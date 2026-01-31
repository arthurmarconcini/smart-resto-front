export interface EmployeeCost {
  id: string;
  name: string;
  role: string;
  workedDays: number;
  dailyRate: number;
  monthlyTotal: number;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeCostInput {
  name: string;
  role: string;
  workedDays: number;
  dailyRate: number;
}

export interface UpdateEmployeeCostInput {
  name?: string;
  role?: string;
  workedDays?: number;
  dailyRate?: number;
}
