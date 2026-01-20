import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function PointOfSale() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Venda Detalhada (PDV)</CardTitle>
        <CardDescription>
          Funcionalidade de Ponto de Venda em desenvolvimento.
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[400px] flex items-center justify-center border-dashed border-2 rounded-md m-6">
        <div className="text-center text-muted-foreground">
            <p>Em breve você poderá lançar vendas item a item aqui.</p>
        </div>
      </CardContent>
    </Card>
  );
}
