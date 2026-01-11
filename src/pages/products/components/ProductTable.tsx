import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis
} from "@/components/ui/pagination";
import { MoreHorizontal, Edit, Trash2, AlertCircle } from "lucide-react";
import type { Product, GetProductsResponse } from "@/types/product";
import { useCategories } from "@/hooks/useCategories";

// Assuming company target profit is available globally or passed as prop. 
// For now, I'll mock valid markup > 30% as good.
const TARGET_MARKUP = 30; 

interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
  meta?: GetProductsResponse['meta'];
  onPageChange: (page: number) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductTable({ 
  products, 
  isLoading, 
  meta, 
  onPageChange, 
  onEdit, 
  onDelete 
}: ProductTableProps) {
  const { data: categories } = useCategories(); // Keeping purely for display name lookup, acceptable or could be passed as prop too. keeping for simplicity as it's cached.

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatMarkup = (value: number) => {
    return `${Number(value || 0).toFixed(1)}%`;
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead>Estoque</TableHead>
              <TableHead>Custo</TableHead>
              <TableHead>Venda</TableHead>
              <TableHead>Markup</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {/* Skeletons */}
                   <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                   <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                   <TableCell><Skeleton className="h-4 w-[40px]" /></TableCell>
                   <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                   <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                   <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                   <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                   <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                </TableRow>
              ))
            ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    Nenhum produto encontrado.
                  </TableCell>
                </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{product.name}</span>
                      {product.description && (
                        <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {product.description}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal">
                      {categories?.find(c => c.id === product.categoryId)?.name || 'Sem Categoria'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">
                      {product.unit}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                       {Number(product.stock) < 5 && (
                         <AlertCircle className="h-4 w-4 text-red-500" />
                       )}
                       <span className={Number(product.stock) < 5 ? "text-red-500 font-medium" : ""}>
                         {product.stock}
                       </span>
                    </div>
                  </TableCell>
                  <TableCell>{formatCurrency(product.costPrice)}</TableCell>
                  <TableCell>{formatCurrency(product.salePrice)}</TableCell>
                  <TableCell>
                    <Badge 
                       variant={product.markup >= TARGET_MARKUP ? "default" : "destructive"}
                       className={product.markup >= TARGET_MARKUP 
                         ? "bg-emerald-500 hover:bg-emerald-600 border-none" 
                         : "bg-red-500 hover:bg-red-600 border-none"
                       }
                    >
                      {formatMarkup(product.markup)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onEdit(product)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600 focus:text-red-600"
                          onClick={() => onDelete(product)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

       {/* Pagination */}
       {meta && meta.lastPage > 1 && (
        <Pagination className="justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                onClick={(e) => { e.preventDefault(); onPageChange(meta.page - 1); }}
                className={meta.page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            
            {Array.from({ length: meta.lastPage }, (_, i) => i + 1).map((p) => {
                const currentPage = meta.page;
                if (
                  p === 1 || 
                  p === meta.lastPage || 
                  (p >= currentPage - 1 && p <= currentPage + 1)
                ) {
                   return (
                    <PaginationItem key={p}>
                      <PaginationLink 
                        href="#" 
                        isActive={currentPage === p}
                        onClick={(e) => { e.preventDefault(); onPageChange(p); }}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                   );
                } else if (
                  (p === currentPage - 2 && p > 1) || 
                  (p === currentPage + 2 && p < meta.lastPage)
                ) {
                   return <PaginationItem key={p}><PaginationEllipsis /></PaginationItem>
                }
                return null;
            })}
            <PaginationItem>
              <PaginationNext 
                href="#" 
                onClick={(e) => { e.preventDefault(); onPageChange(meta.page + 1); }}
                className={meta.page === meta.lastPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
