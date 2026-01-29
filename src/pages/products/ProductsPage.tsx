import { useState } from "react";
import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { toast } from "sonner";

import { useProducts, useDeleteProduct } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { ProductTable } from "./components/ProductTable";
import { ProductForm } from "./components/ProductForm";
import type { Product } from "@/types/product";


export function ProductsPage() {
  // --- State ---
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  
  // Dialogs
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  
  // Delete Alert
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | undefined>(undefined);

  // --- Data ---
  const { data: productsData, isLoading } = useProducts({
    page,
    limit: 10,
    search: search || undefined,
    categoryId: categoryId === "all" ? undefined : categoryId,
  });
  
  const { data: categories } = useCategories();
  const { mutateAsync: deleteProduct } = useDeleteProduct();

  const products = productsData?.data || [];
  const meta = productsData?.meta;

  // --- Handlers ---
  const handleOpenCreate = () => {
    setEditingProduct(undefined);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProduct(undefined);
  };

  const handleOpenDelete = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await deleteProduct(productToDelete.id);
      toast.success("Produto removido com sucesso!");
    } catch {
      toast.error("Erro ao remover produto.");
    } finally {
      setIsDeleteDialogOpen(false);
      setProductToDelete(undefined);
    }
  };

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Gestão de Produtos</h1>
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" /> Novo Produto
          </Button>
        </div>

        {/* Toolbar / Filters */}
        <div className="bg-card p-4 rounded-lg border shadow-sm flex flex-col sm:flex-row gap-4 items-center">
             <div className="relative w-full sm:w-72">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome..."
                  value={search}
                  onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1); // Reset page on search
                  }}
                  className="pl-8"
                />
              </div>
              
              <Select 
                value={categoryId || "all"} 
                onValueChange={(val) => {
                    setCategoryId(val === "all" ? undefined : val);
                    setPage(1);
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
        </div>

        {/* Table */}
        <ProductTable 
           products={products}
           isLoading={isLoading}
           meta={meta}
           onPageChange={setPage}
           onEdit={handleOpenEdit}
           onDelete={handleOpenDelete}
        />

        {/* Create/Edit Modal */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
           <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
             <DialogHeader>
                <DialogTitle>{editingProduct ? "Editar Produto" : "Novo Produto"}</DialogTitle>
                <DialogDescription>
                    {editingProduct ? "Atualize as informações do produto abaixo." : "Preencha os dados do novo produto."}
                </DialogDescription>
             </DialogHeader>
             <ProductForm 
                initialData={editingProduct} 
                onSuccess={handleCloseDialog} 
             />
           </DialogContent>
        </Dialog>

        {/* Delete Confirmation Alert */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso excluirá permanentemente o produto 
                <span className="font-bold text-foreground"> {productToDelete?.name} </span>
                e poderá afetar o histórico de vendas e relatórios.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
                Sim, excluir produto
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
  );
}
