import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Filter, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SalesFiltersProps {
  month: number;
  year: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function SalesFilters({
  month,
  year,
  onMonthChange,
  onYearChange,
  onRefresh,
  isRefreshing,
}: SalesFiltersProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const getMonthName = (m: number) => {
    const name = format(new Date(2000, m - 1, 1), "MMMM", { locale: ptBR });
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Filter className="h-4 w-4" />
            Filtros:
          </div>

          <Select
            value={month.toString()}
            onValueChange={(val) => onMonthChange(parseInt(val))}
          >
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((m) => (
                <SelectItem key={m} value={m.toString()}>
                  {getMonthName(m)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={year.toString()}
            onValueChange={(val) => onYearChange(parseInt(val))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="ml-auto"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Atualizar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
