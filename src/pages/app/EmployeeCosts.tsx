import { useState } from "react";
import { useAuth } from "@/store/auth-store";
import { Users, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  useEmployeeCosts,
  useDeleteEmployeeCost,
} from "@/hooks/useEmployeeCosts";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { EmployeeCostDialog } from "@/pages/app/components/EmployeeCostDialog";
import type { EmployeeCost } from "@/types/employee-cost";

export function EmployeeCostsPage() {
  const { company } = useAuth();
  const companyId = company?.id;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeCost | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { data: employees, isLoading } = useEmployeeCosts(companyId!);
  const deleteEmployeeMutation = useDeleteEmployeeCost(companyId!);

  const totalCost = employees?.reduce((sum, emp) => sum + emp.monthlyTotal, 0) ?? 0;

  const handleEdit = (employee: EmployeeCost) => {
    setEditingEmployee(employee);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEmployeeMutation.mutateAsync(id);
      toast.success("Funcionário excluído com sucesso!");
      setDeleteConfirmId(null);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir funcionário");
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingEmployee(null);
  };

  if (!company?.manualEmployeeCostEnabled) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Custos de Funcionários
          </h1>
        </div>

        <Alert>
          <Users className="h-4 w-4" />
          <AlertDescription>
            O cadastro manual de funcionários está desativado.
            Ative esta opção em{" "}
            <a href="/settings" className="font-medium underline">
              Configurações
            </a>
            .
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Custos de Funcionários
          </h1>
          <p className="text-muted-foreground">
            Gerencie os custos individuais da sua equipe
          </p>
        </div>

        <Button onClick={() => setDialogOpen(true)} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Funcionário
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Funcionários</CardTitle>
          <CardDescription>
            Custo total: <strong className="text-primary text-lg">R$ {totalCost.toFixed(2)}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : employees && employees.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead className="text-right">Dias/Mês</TableHead>
                  <TableHead className="text-right">Diária (R$)</TableHead>
                  <TableHead className="text-right">Total Mensal</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{employee.role}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{employee.workedDays}</TableCell>
                    <TableCell className="text-right">
                      R$ {employee.dailyRate.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-primary">
                      R$ {employee.monthlyTotal.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(employee)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirmId(employee.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={4} className="text-right font-semibold">
                    Total:
                  </TableCell>
                  <TableCell className="text-right font-bold text-lg text-primary">
                    R$ {totalCost.toFixed(2)}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Nenhum funcionário cadastrado</p>
              <p className="text-sm">Clique em "Adicionar Funcionário" para começar</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Criação/Edição */}
      <EmployeeCostDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        employee={editingEmployee}
        companyId={companyId!}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog
        open={!!deleteConfirmId}
        onOpenChange={() => setDeleteConfirmId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este funcionário? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
