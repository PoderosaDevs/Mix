import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DataTable from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Settings, Copy, User, Loader2, Link, ChevronRight, Eye, Trash2, CheckCircle2 } from "lucide-react";
import { apiService } from "@/api/routes";

const Lojas = () => {
  const queryClient = useQueryClient();
  const [configStore, setConfigStore] = useState<any | null>(null);
  const [editStore, setEditStore] = useState<any | null>(null);
  const [assignModal, setAssignModal] = useState<any | null>(null);
  const [quickViewMix, setQuickViewMix] = useState<any | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStore, setNewStore] = useState({ nome: "", localizacao: "" });

  const { data: stores = [], isLoading } = useQuery({
    queryKey: ["lojas"],
    queryFn: async () => {
      const res = await apiService.lojas.listar();
      return res.data;
    },
  });

  const { data: usuarios = [] } = useQuery({
    queryKey: ["usuarios-select"],
    queryFn: async () => {
      const res = await apiService.usuarios.listar();
      return res.data;
    }
  });

  const { data: todosMixes = [] } = useQuery({
    queryKey: ["mixes-list"],
    queryFn: async () => {
      const res = await apiService.mixProdutos.listarTodos();
      return res.data;
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const isUpdate = !!data.id;
      const storePayload = {
        nome: data.nome,
        localizacao: data.localizacao,
        gerenteId: data.gerenteId || null
      };

      let storeId = data.id;

      if (isUpdate) {
        await apiService.lojas.atualizar(data.id, storePayload);
      } else {
        const res = await apiService.lojas.criar(storePayload);
        storeId = res.data.id;
      }

      await apiService.mixProdutos.atribuir({
        lojaId: storeId,
        mixIds: data.mixes?.map((m: any) => m.id) || [],
        gerenteId: data.gerenteId || null
      });

      return { id: storeId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lojas"] });
      toast.success("Configurações sincronizadas!");
      closeAllModals();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Erro ao salvar.");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiService.lojas.deletar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lojas"] });
      toast.success("Loja removida");
    },
  });

  const closeAllModals = () => {
    setEditStore(null);
    setAssignModal(null);
    setIsAddModalOpen(false);
    setNewStore({ nome: "", localizacao: "" });
  };

  const handleToggleMix = (mix: any) => {
    const mixesAtuais = assignModal.mixes || [];
    const isSelected = mixesAtuais.some((m: any) => m.id === mix.id);
    const newMixes = isSelected 
      ? mixesAtuais.filter((m: any) => m.id !== mix.id)
      : [...mixesAtuais, { id: mix.id, nome: mix.nome }];
    setAssignModal({ ...assignModal, mixes: newMixes });
  };

  const columns = [
    { key: "nome" as const, label: "Loja" },
    { key: "localizacao" as const, label: "Localização" },
    {
      key: "gerente" as const, label: "Responsável",
      render: (s: any) => s.gerente?.nome 
        ? (
          <div className="flex items-center gap-1.5 font-bold uppercase text-[11px] text-zinc-900">
            <User className="h-3 w-3 text-zinc-400" />
            {s.gerente.nome}
          </div>
        )
        : <Badge variant="outline" className="text-[10px] opacity-50 uppercase">Sem Gerente</Badge>,
    },
    {
      key: "mixes" as const, label: "Mixes Ativos",
      render: (s: any) => (
        <div className="flex gap-1">
          {s.mixes?.length > 0 || s._count?.mixes > 0 
            ? <Badge className="bg-zinc-900 text-white font-black text-[9px] uppercase italic tracking-tighter">
                {s.mixes?.length || s._count?.mixes} MIXES
              </Badge>
            : <span className="text-[10px] text-zinc-300 font-bold uppercase italic tracking-widest">Nenhum</span>
          }
        </div>
      )
    },
    {
      key: "actions", label: "Gestão", align: "end",
      render: (s: any) => (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            const alreadyAssigned = s.mixes?.map((rel: any) => ({
              id: rel.mixProdutoId,
              nome: rel.mix?.nome
            })) || [];
            
            setAssignModal({ 
              ...s, 
              mixes: alreadyAssigned 
            });
          }} 
          className="h-8 border-dashed border-zinc-300 hover:border-zinc-900 font-black text-[10px] uppercase gap-2"
        >
          <Link className="h-3 w-3" /> Associações
        </Button>
      )
    }
  ];

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/loja/${token}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado!");
  };

  return (
    <>
      <DataTable
        title="Lojas"
        description="Gestão de unidades e matrizes de mix"
        columns={columns as any}
        data={stores}
        searchKey="nome"
        onAdd={() => setIsAddModalOpen(true)}
        onEdit={(s: any) => setEditStore({ ...s })}
        onConfig={(s: any) => setConfigStore({ ...s, accessEnabled: true })}
        onDelete={(s: any) => deleteMutation.mutate(s.id)}
        addLabel="Nova Loja"
        isLoading={isLoading}
      />

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md bg-white border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-black uppercase tracking-tight italic">Cadastrar Unidade</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase text-zinc-400">Nome Comercial</Label>
              <Input placeholder="Ex: Unidade Centro" value={newStore.nome} onChange={(e) => setNewStore({ ...newStore, nome: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] font-black uppercase text-zinc-400">Localização</Label>
              <Input placeholder="Ex: Salvador, BA" value={newStore.localizacao} onChange={(e) => setNewStore({ ...newStore, localizacao: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => saveMutation.mutate(newStore)} className="w-full bg-zinc-900 text-white uppercase font-black text-[10px] h-12" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="animate-spin" /> : "Confirmar Cadastro"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editStore} onOpenChange={(open) => !open && setEditStore(null)}>
        <DialogContent className="sm:max-w-md bg-white border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-black uppercase tracking-tight italic">Editar Unidade</DialogTitle>
          </DialogHeader>
          {editStore && (
            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase text-zinc-400">Nome da Loja</Label>
                <Input value={editStore.nome} onChange={(e) => setEditStore({ ...editStore, nome: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] font-black uppercase text-zinc-400">Localização</Label>
                <Input value={editStore.localizacao} onChange={(e) => setEditStore({ ...editStore, localizacao: e.target.value })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => saveMutation.mutate(editStore)} className="w-full bg-zinc-900 text-white uppercase font-black text-[10px] h-12" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="animate-spin" /> : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!assignModal} onOpenChange={(open) => !open && setAssignModal(null)}>
        <DialogContent className="sm:max-w-xl bg-white p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-8 bg-zinc-50 border-b">
            <DialogTitle className="font-black uppercase italic tracking-widest text-xl text-zinc-900 flex items-center gap-3">
              <Link className="h-5 w-5 text-zinc-400" /> {assignModal?.nome}
            </DialogTitle>
            <DialogDescription className="text-[10px] font-black uppercase text-zinc-400">
              Vincule um responsável e as matrizes de mix desta unidade
            </DialogDescription>
          </DialogHeader>

          <div className="p-8 space-y-8">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-zinc-400">Gerente Responsável</Label>
              <Select 
                value={assignModal?.gerenteId || "none"} 
                onValueChange={(v) => setAssignModal({...assignModal, gerenteId: v === "none" ? null : v})}
              >
                <SelectTrigger className="h-12 border-zinc-200 font-bold uppercase text-xs">
                  <SelectValue placeholder="SELECIONE UM GERENTE" />
                </SelectTrigger>
                <SelectContent className="bg-white border-zinc-200">
                  <SelectItem value="none" className="font-bold uppercase text-xs text-zinc-300">Nenhum</SelectItem>
                  {usuarios.map((u: any) => <SelectItem key={u.id} value={u.id} className="font-bold uppercase text-xs">{u.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase text-zinc-400 flex justify-between items-center">
                Mixes de Produtos Disponíveis
                <Badge variant="outline" className="text-[9px] font-black border-zinc-200">{assignModal?.mixes?.length || 0} SELECIONADOS</Badge>
              </Label>
              <div className="grid grid-cols-1 gap-2 max-h-[250px] overflow-y-auto pr-2">
                {todosMixes.map((mix: any) => {
                  const isSelected = assignModal?.mixes?.some((m: any) => m.id === mix.id);
                  return (
                    <div key={mix.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isSelected ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-100 bg-zinc-50'}`}>
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className={`h-4 w-4 ${isSelected ? 'text-emerald-400' : 'text-zinc-200'}`} />
                        <div>
                          <p className={`text-[11px] font-black uppercase italic ${isSelected ? 'text-white' : 'text-zinc-900'}`}>{mix.nome}</p>
                          <p className={`text-[9px] font-bold uppercase ${isSelected ? 'text-zinc-500' : 'text-zinc-400'}`}>{mix.marca?.nome || "GERAL"}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setQuickViewMix(mix)} className={`h-8 w-8 ${isSelected ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-zinc-200 text-zinc-400'}`}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleToggleMix(mix)} className={`h-8 w-8 ${isSelected ? 'hover:bg-zinc-800 text-white' : 'hover:bg-zinc-200 text-zinc-900'}`}>
                          {isSelected ? <Trash2 className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 bg-zinc-50 border-t">
            <Button onClick={() => saveMutation.mutate(assignModal)} className="w-full bg-zinc-900 text-white uppercase font-black text-[10px] h-14 tracking-widest shadow-xl" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="animate-spin" /> : "Salvar Configurações de Loja"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!quickViewMix} onOpenChange={(open) => !open && setQuickViewMix(null)}>
        <DialogContent className="sm:max-w-md bg-white border-none shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-6 bg-zinc-900 text-white">
            <DialogTitle className="font-black uppercase italic text-sm">Preview: {quickViewMix?.nome}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto divide-y divide-zinc-50 px-6">
            {quickViewMix?.itens?.map((item: any, idx: number) => (
              <div key={idx} className="py-4 flex justify-between items-center">
                <span className="font-mono font-black text-zinc-900 text-[10px]">{item.produtoId}</span>
                <span className="font-bold uppercase text-zinc-400 text-[9px] truncate ml-4">{item.nomeProduto}</span>
              </div>
            ))}
          </div>
          <div className="p-4 bg-zinc-50">
             <Button variant="ghost" onClick={() => setQuickViewMix(null)} className="w-full uppercase font-black text-[10px] text-zinc-400">Fechar Prévia</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Lojas;