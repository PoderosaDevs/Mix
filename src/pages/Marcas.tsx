import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import DataTable from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { apiService } from "@/api/routes";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Tag } from "lucide-react";
import * as T from "@/api/types";

const Marcas = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<T.Marca | null>(null);
  
  const { register, handleSubmit, reset } = useForm<{ nome: string }>();

  const { data: brands = [], isLoading } = useQuery({
    queryKey: ["marcas"],
    queryFn: async () => {
      const res = await apiService.marcas.listar();
      return res.data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: (data: { nome: string }) =>
      selectedBrand
        ? apiService.marcas.atualizar(selectedBrand.id, data)
        : apiService.marcas.criar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marcas"] });
      toast.success(selectedBrand ? "Marca atualizada" : "Marca criada");
      handleCloseModal();
    },
    onError: (err: any) => toast.error(err.response?.data?.error || "Erro na operação"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiService.marcas.deletar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marcas"] });
      toast.success("Marca removida com sucesso");
    },
    onError: (err: any) => toast.error(err.response?.data?.error || "Erro ao excluir"),
  });

  const handleOpenModal = (brand?: T.Marca) => {
    if (brand) {
      setSelectedBrand(brand);
      reset({ nome: brand.nome });
    } else {
      setSelectedBrand(null);
      reset({ nome: "" });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBrand(null);
    reset();
  };

  const columns = [
    { 
      key: "nome", 
      label: "Marca",
      render: (b: T.Marca) => (
        <div className="flex items-center gap-2 font-medium">
          <Tag className="h-4 w-4 text-muted-foreground" />
          {b.nome}
        </div>
      )
    },
    { 
      key: "id", 
      label: "Status",
      render: () => (
        <Badge variant="outline" className="border-success text-success">
          Ativa
        </Badge>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <DataTable
        title="Marcas"
        description="Gerencie as marcas e fabricantes de produtos"
        columns={columns}
        data={brands}
        searchKey="nome"
        isLoading={isLoading}
        onAdd={() => handleOpenModal()}
        onEdit={(b) => handleOpenModal(b as T.Marca)}
        onDelete={(b) => deleteMutation.mutate((b as T.Marca).id)}
        addLabel="Nova Marca"
      />

      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{selectedBrand ? "Editar Marca" : "Nova Marca"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit((data) => saveMutation.mutate(data))} className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Marca</Label>
              <Input 
                id="nome"
                {...register("nome", { required: true })}
                placeholder="Ex: Coca-Cola, Ambev..."
                autoFocus
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {selectedBrand ? "Salvar Alterações" : "Cadastrar Marca"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Marcas;