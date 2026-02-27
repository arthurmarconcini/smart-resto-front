import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calculator, TrendingUp, DollarSign, Package } from "lucide-react";
import type { Product } from "@/types/product";

interface RevenueSimulatorProps {
  products: Product[];
  taxRate?: number;   // % ex: 10
  cardFee?: number;   // % ex: 3
}

export function RevenueSimulator({ products, taxRate = 0, cardFee = 0 }: RevenueSimulatorProps) {
  const [selectedProductId, setSelectedProductId] = useState<string>("all");
  const [monthlyQty, setMonthlyQty] = useState<number>(0);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  // Cálculos
  const taxDecimal = taxRate / 100;
  const feeDecimal = cardFee / 100;

  let grossRevenue = 0;
  let totalCost = 0;
  let totalTaxes = 0;
  let netProfit = 0;
  let productName = "Todos os produtos";

  if (selectedProductId === "all" && products.length > 0) {
    // Média ponderada de todos os produtos
    const avgSalePrice = products.reduce((acc, p) => acc + Number(p.salePrice || 0), 0) / products.length;
    const avgCostPrice = products.reduce((acc, p) => acc + Number(p.costPrice || 0), 0) / products.length;
    
    grossRevenue = avgSalePrice * monthlyQty;
    totalCost = avgCostPrice * monthlyQty;
    totalTaxes = grossRevenue * (taxDecimal + feeDecimal);
    netProfit = grossRevenue - totalTaxes - totalCost;
    productName = `Média de ${products.length} produtos`;
  } else {
    const product = products.find(p => p.id === selectedProductId);
    if (product) {
      const sale = Number(product.salePrice || 0);
      const cost = Number(product.costPrice || 0);
      
      grossRevenue = sale * monthlyQty;
      totalCost = cost * monthlyQty;
      totalTaxes = grossRevenue * (taxDecimal + feeDecimal);
      netProfit = grossRevenue - totalTaxes - totalCost;
      productName = product.name;
    }
  }

  const hasData = monthlyQty > 0 && (selectedProductId === "all" ? products.length > 0 : true);

  return (
    <Card className="border-l-4 border-l-primary shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          Simulador de Receita
        </CardTitle>
        <CardDescription>
          Simule quanto você pode faturar por mês com base na quantidade de vendas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-1">
              <Package className="h-3.5 w-3.5" />
              Produto
            </Label>
            <Select 
              value={selectedProductId} 
              onValueChange={setSelectedProductId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um produto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Média de todos</SelectItem>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({formatCurrency(Number(p.salePrice || 0))})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Quantidade mensal estimada
            </Label>
            <Input
              type="number"
              min={0}
              placeholder="Ex: 100"
              value={monthlyQty || ""}
              onChange={(e) => setMonthlyQty(Number(e.target.value) || 0)}
            />
          </div>
        </div>

        {/* Resultados */}
        {hasData && (
          <div className="bg-muted/20 rounded-lg p-4 space-y-3">
            <p className="text-xs text-muted-foreground">
              Previsão para <strong className="text-foreground">{monthlyQty}x</strong> {productName}/mês
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Receita Bruta
                </p>
                <p className="text-lg font-bold text-foreground">
                  {formatCurrency(grossRevenue)}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Custos</p>
                <p className="text-lg font-bold text-destructive">
                  {formatCurrency(totalCost)}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Impostos/Taxas</p>
                <p className="text-lg font-bold text-destructive">
                  {formatCurrency(totalTaxes)}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Lucro Líquido
                </p>
                <p className={`text-lg font-bold ${netProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {formatCurrency(netProfit)}
                </p>
              </div>
            </div>
          </div>
        )}

        {!hasData && monthlyQty <= 0 && (
          <div className="text-center py-4 text-muted-foreground text-sm">
            Informe a quantidade mensal para ver a previsão
          </div>
        )}
      </CardContent>
    </Card>
  );
}
