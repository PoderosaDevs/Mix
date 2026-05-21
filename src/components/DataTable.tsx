import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, Pencil, Trash2, FileText, Loader2 } from "lucide-react"; // Adicionei Loader2
import { useState } from "react";

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  title: string;
  description?: string;
  columns: Column<T>[];
  data: T[];
  searchKey?: keyof T; // Alterado para keyof T para segurança
  isLoading?: boolean; // Adicionado
  onAdd?: () => void;
  onEdit?: (item: T, index: number) => void;
  onDelete?: (item: T, index: number) => void;
  onConfig?: (item: T, index: number) => void;
  addLabel?: string;
}

// Removi o 'extends Record<string, unknown>' para evitar conflitos com interfaces complexas
function DataTable<T>({
  title, 
  description, 
  columns, 
  data, 
  searchKey, 
  isLoading, // Desestruturado aqui
  onAdd, 
  onEdit, 
  onDelete, 
  onConfig, 
  addLabel = "Adicionar"
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");

  const filtered = searchKey
    ? data.filter((item) => String(item[searchKey]).toLowerCase().includes(search.toLowerCase()))
    : data;

  const hasActions = !!onEdit || !!onDelete || !!onConfig;
  const actionsWidth = [onEdit, onDelete, onConfig].filter(Boolean).length * 36 + 8;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {description && <p className="text-muted-foreground text-sm mt-1">{description}</p>}
        </div>
        <div className="flex items-center gap-3">
          {searchKey && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="pl-10 w-64 h-10" 
              />
            </div>
          )}
          {onAdd && (
            <Button onClick={onAdd} className="h-10">
              <Plus className="h-4 w-4 mr-2" />{addLabel}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-3">
        {/* Header Desktop */}
        <div
          className="hidden md:grid px-5 py-3 rounded-xl bg-muted/60 gap-4"
          style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))${hasActions ? ` ${actionsWidth}px` : ""}` }}
        >
          {columns.map((col) => (
            <span key={col.key} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{col.label}</span>
          ))}
          {hasActions && <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Ações</span>}
        </div>

        {/* Estado de Loading */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-muted/10 rounded-xl border border-dashed">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Carregando dados...</p>
          </div>
        ) : (
          <>
            {filtered.map((item, i) => (
              <Card key={i} className="group hover:shadow-md hover:border-primary/20 transition-all duration-200 border-border/60">
                <CardContent className="p-0">
                  <div
                    className="hidden md:grid items-center px-5 py-4 gap-4"
                    style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))${hasActions ? ` ${actionsWidth}px` : ""}` }}
                  >
                    {columns.map((col, ci) => (
                      <div key={col.key} className={ci === 0 ? "font-medium text-sm" : "text-sm text-muted-foreground"}>
                        {col.render ? col.render(item) : String((item as any)[col.key] ?? "")}
                      </div>
                    ))}
                    {/* ... rest of your action buttons logic (mesmo do seu código) */}
                    {hasActions && (
                      <div className="flex items-center justify-end gap-1">
                        {onEdit && (
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => onEdit(item, i)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {onConfig && (
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => onConfig(item, i)}>
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onDelete(item, i)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                  {/* Mobile View (mantido) */}
                  <div className="md:hidden p-4 space-y-2">
                    {columns.map((col) => (
                      <div key={col.key} className="flex items-center justify-between">
                        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{col.label}</span>
                        <span className="text-sm">{col.render ? col.render(item) : String((item as any)[col.key] ?? "")}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {filtered.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">Nenhum registro encontrado</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default DataTable;