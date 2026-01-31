import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
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
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import { useEmployeeCosts, useDeleteEmployeeCost } from "@/hooks/useEmployeeCosts";
import { useAuth } from "@/store/auth-store";
import { EmployeeCostForm } from "./EmployeeCostForm";
import { formatCurrency } from "@/lib/utils";
import { type EmployeeCost } from "@/types/employee-cost";
import { Skeleton } from "@/components/ui/skeleton";

export function EmployeeCostList() {
  const { company } = useAuth();
  const companyId = company?.id ?? "";

  const { data: employeeCosts, isLoading } = useEmployeeCosts(companyId);
  const { mutateAsync: deleteEmployeeCost, isPending: isDeleting } = useDeleteEmployeeCost(companyId);
  
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeCost | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleCreate = () => {
    setSelectedEmployee(null);
    setIsFormOpen(true);
  };

  const handleEdit = (employee: EmployeeCost) => {
    setSelectedEmployee(employee);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteEmployeeCost(deleteId);
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return <div className="space-y-2">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
    </div>;
  }

  const totalCost = employeeCosts?.reduce((acc, curr) => acc + curr.monthlyTotal, 0) || 0;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-muted/20 p-4 rounded-lg border border-border/50">
        <div>
           <p className="text-sm font-medium text-muted-foreground mb-1">Custo Total com Funcionários</p>
           <h3 className="text-2xl font-bold text-primary">{formatCurrency(totalCost)}</h3>
           <p className="text-xs text-muted-foreground mt-1">Calculado automaticamente</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Funcionário
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {selectedEmployee ? "Editar Funcionário" : "Novo Funcionário"}
              </DialogTitle>
            </DialogHeader>
            <EmployeeCostForm 
              initialData={selectedEmployee || undefined}
              onSuccess={() => setIsFormOpen(false)}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Função</TableHead>
              <TableHead className="text-center">Dias</TableHead>
              <TableHead className="text-right">Diária</TableHead>
              <TableHead className="text-right">Total Mensal</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!employeeCosts || employeeCosts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="h-8 w-8 opacity-20" />
                    <p>Nenhum funcionário cadastrado.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              employeeCosts.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.role}</TableCell>
                  <TableCell className="text-center">{employee.workedDays}</TableCell>
                  <TableCell className="text-right">{formatCurrency(employee.dailyRate)}</TableCell>
                  <TableCell className="text-right font-semibold text-primary">
                    {formatCurrency(employee.monthlyTotal)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => handleEdit(employee)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteId(employee.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o funcionário e seus dados de custo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
