import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Check, Pencil, X, Package, ChevronRight, LayoutGrid, BarChart3, Target, Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiService } from "@/api/routes";
import * as T from "@/api/types";

const MixUsuario = () => {
  const queryClient = useQueryClient();
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  const [selectedMixId, setSelectedMixId] = useState<string | null>(null);
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ current: number; ideal: number } | null>(null);
  const [addMixDialog, setAddMixDialog] = useState(false);
  const [selectedMixToAdd, setSelectedMixToAdd] = useState<string>("");

  const { data: stores = [] } = useQuery({
    queryKey: ["lojas-listagem"],
    queryFn: async () => {
      const res = await apiService.lojas.listar();
      return res.data;
    }
  });

  const { data: availableMixes = [] } = useQuery({
    queryKey: ["mixes-catalogo-completo"],
    queryFn: async () => {
      const res = await apiService.mixProdutos.listarTodos();
      return res.data;
    }
  });

  const {
    data: mixesDaLoja = [],
    isLoading: isLoadingMix,
    isFetching: isFetchingMix
  } = useQuery({
    queryKey: ["mixes-por-loja", selectedStoreId],
    queryFn: async () => {
      const res = await apiService.mixProdutos.listarPorLoja(selectedStoreId);
      return res.data;
    },
    enabled: !!selectedStoreId,
  });

  const idsJaVinculados = useMemo(() => {
    return mixesDaLoja.map((m: any) => m.mixProdutoId);
  }, [mixesDaLoja]);

  const selectedMixData = useMemo(() => {
    return mixesDaLoja.find((m: any) => m.id === selectedMixId);
  }, [mixesDaLoja, selectedMixId]);

  const stats = useMemo(() => {
    if (!selectedMixData?.itens) return { total: 0, ruptura: 0, ok: 0 };
    const itens = selectedMixData.itens as any[];
    return {
      total: itens.length,
      ruptura: itens.filter(i => (i.estoqueAtual / (i.estoqueDesejado || 1)) < 0.4).length,
      ok: itens.filter(i => (i.estoqueAtual / (i.estoqueDesejado || 1)) >= 0.4).length
    };
  }, [selectedMixData]);

  const addMixMutation = useMutation({
    mutationFn: (mixId: string) => apiService.mixProdutos.atribuir({
      lojaId: selectedStoreId,
      mixIds: [...mixesDaLoja.map((m: any) => m.mixProdutoId), mixId]
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mixes-por-loja", selectedStoreId] });
      toast.success("Mix vinculado");
      setAddMixDialog(false);
      setSelectedMixToAdd("");
    }
  });

  const updateEstoqueMutation = useMutation({
    mutationFn: ({ atribuicaoId, itens }: { atribuicaoId: string; itens: any[] }) =>
      apiService.mixProdutos.atualizarEstoqueLoja(atribuicaoId, itens),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mixes-por-loja", selectedStoreId] });
      toast.success("Estoque atualizado");
      setEditingRow(null);
    }
  });

  const handleUpdateItem = (item: any) => {
    if (!editValues || !selectedMixData) return;
    const payloadItens = (selectedMixData.itens as any[]).map(i => ({
      produtoId: i.produtoId,
      nomeProduto: i.nomeProduto,
      atual: i.id === item.id ? editValues.current : (i.estoqueAtual || 0),
      ideal: i.id === item.id ? editValues.ideal : (i.estoqueDesejado || 0)
    }));
    updateEstoqueMutation.mutate({ atribuicaoId: selectedMixData.id, itens: payloadItens });
  };

  return (
    <div className="space-y-6 h-screen overflow-hidden flex flex-col p-6 bg-[#fcfcfc]">
      <header className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-3xl font-black uppercase italic text-zinc-900 tracking-tighter leading-none">Intelligence Mix</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-[0.2em]">Live Inventory Tracking</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white p-1 rounded-2xl border border-zinc-200 shadow-sm flex items-center">
            <Select value={selectedStoreId} onValueChange={(id) => {
              setSelectedStoreId(id);
              setSelectedMixId(null);
            }}>
              <SelectTrigger className="w-[300px] border-none shadow-none font-black text-xs uppercase tracking-wider h-10">
                <SelectValue placeholder="SELECIONAR UNIDADE" />
              </SelectTrigger>
              <SelectContent>
                {stores.map((s: T.Loja) => (
                  <SelectItem key={s.id} value={s.id} className="font-bold text-[11px] uppercase">{s.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={() => setAddMixDialog(true)}
            disabled={!selectedStoreId}
            className="bg-zinc-900 text-white font-black uppercase text-[10px] h-12 px-6 rounded-2xl hover:bg-black transition-all shadow-lg active:scale-95"
          >
            <Plus className="h-4 w-4 mr-2 stroke-[3px]" /> Novo Mix
          </Button>
        </div>
      </header>

      {selectedStoreId && (
        <div className="grid grid-cols-12 gap-6 flex-grow overflow-hidden">
          <aside className="col-span-3 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.3em]">Portfólio Ativo</h3>
              <span className="bg-zinc-100 text-zinc-600 text-[9px] font-black px-2 py-0.5 rounded-full">{mixesDaLoja.length}</span>
            </div>

            <div className="space-y-3 pr-2 overflow-y-auto scrollbar-none pb-10">
              {mixesDaLoja.map((mix: any) => (
                <button
                  key={mix.id}
                  onClick={() => { setSelectedMixId(mix.id); setEditingRow(null); }}
                  className={`w-full text-left p-5 rounded-[1.8rem] transition-all border-2 flex flex-col relative overflow-hidden group ${selectedMixId === mix.id
                      ? "bg-zinc-900 border-zinc-900 text-white shadow-2xl scale-[1.02]"
                      : "bg-white border-zinc-100 text-zinc-900 hover:border-zinc-300"
                    }`}
                >
                  <div className="flex justify-between items-start w-full mb-4">
                    <div className={`p-2 rounded-xl ${selectedMixId === mix.id ? "bg-white/10" : "bg-zinc-50"}`}>
                      <Package className={`h-4 w-4 ${selectedMixId === mix.id ? "text-white" : "text-zinc-400"}`} />
                    </div>
                    <ChevronRight className={`h-4 w-4 opacity-0 group-hover:opacity-100 transition-all ${selectedMixId === mix.id ? "translate-x-0 opacity-100" : "-translate-x-2"}`} />
                  </div>

                  <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${selectedMixId === mix.id ? "text-zinc-400" : "text-zinc-500"}`}>
                    {typeof mix.marca === 'string' ? mix.marca : "MARCA PRÓPRIA"}
                  </p>
                  <h4 className="font-black uppercase italic text-sm mb-1 leading-tight tracking-tight">{mix.nome}</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`h-1 w-8 rounded-full ${selectedMixId === mix.id ? "bg-white/20" : "bg-zinc-100"}`}>
                      <div
                        className={`h-full rounded-full ${selectedMixId === mix.id ? "bg-emerald-400" : "bg-zinc-400"}`}
                        style={{ width: `${Math.min(((mix.itens?.length || 0) / 40) * 100, 100)}%` }}
                      />
                    </span>
                    <span className="text-[9px] font-bold opacity-60 uppercase">{mix.itens?.length || 0} Itens</span>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <main className="col-span-9 flex flex-col overflow-hidden gap-6">
            {!selectedMixId || !selectedMixData ? (
              <div className="h-full rounded-[3rem] border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center text-zinc-300 bg-white/50">
                <div className="p-6 rounded-full bg-white shadow-sm mb-4">
                  <LayoutGrid className="h-10 w-10 opacity-20 text-zinc-900" />
                </div>
                <p className="font-black uppercase text-[10px] tracking-[0.4em] opacity-40 italic">Selecione um mix para inspeção</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-4 flex-shrink-0">
                  {[
                    { label: "SKUS TOTAIS", value: stats.total, icon: BarChart3, color: "zinc" },
                    { label: "RUPTURAS", value: stats.ruptura, icon: X, color: "rose" },
                    { label: "DISPONÍVEIS", value: stats.ok, icon: Check, color: "emerald" }
                  ].map((stat, i) => (
                    <div key={i} className="bg-white border border-zinc-100 p-6 rounded-[2rem] shadow-sm flex items-center justify-between">
                      <div>
                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{stat.label}</p>
                        <p className={`text-2xl font-black italic mt-1 text-${stat.color}-600`}>{stat.value}</p>
                      </div>
                      <stat.icon className={`h-8 w-8 text-${stat.color}-100`} />
                    </div>
                  ))}
                </div>

                <Card className="border-none shadow-xl bg-white rounded-[2.5rem] overflow-hidden flex flex-col h-full border border-zinc-100">
                  <CardHeader className="bg-white border-b border-zinc-50 py-6 px-10 flex-row items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-1 bg-zinc-900 rounded-full" />
                      <div>
                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">DATA ANALYTICS</p>
                        <CardTitle className="text-lg font-black uppercase italic text-zinc-900 tracking-tight">
                          {typeof selectedMixData.marca === 'string' ? selectedMixData.marca : "MARCA PRÓPRIA"} — {selectedMixData.nome}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-100">
                    <Table>
                      <TableHeader className="bg-zinc-50/30 sticky top-0 z-20 backdrop-blur-md">
                        <TableRow className="border-zinc-50">
                          <TableHead className="px-10 text-[9px] font-black uppercase text-zinc-400 tracking-widest h-14">Produto</TableHead>
                          <TableHead className="text-center text-[9px] font-black uppercase text-zinc-400 tracking-widest">Estoque</TableHead>
                          <TableHead className="text-center text-[9px] font-black uppercase text-zinc-400 tracking-widest">Target</TableHead>
                          <TableHead className="w-[200px] text-[9px] font-black uppercase text-zinc-400 tracking-widest">Saúde</TableHead>
                          <TableHead className="px-10 text-right text-[9px] font-black uppercase text-zinc-400 tracking-widest">Edit</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedMixData.itens?.map((item: any) => {
                          const isEditing = editingRow === item.id;
                          const pct = (item.estoqueAtual / (item.estoqueDesejado || 1)) * 100;
                          const isCritical = pct < 40;

                          return (
                            <TableRow key={item.id} className="border-zinc-50 hover:bg-zinc-50/50 transition-all group">
                              <TableCell className="px-10 py-6">
                                <div className="flex flex-col">
                                  <span className="font-black text-[11px] uppercase text-zinc-900 tracking-tight mb-1">{item.nomeProduto}</span>
                                  <span className="text-[8px] font-bold text-zinc-400 font-mono bg-zinc-100 w-fit px-1.5 py-0.5 rounded">ID: {item.produtoId}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                {isEditing ? (
                                  <Input
                                    type="number"
                                    className="h-10 w-20 mx-auto font-black text-center border-2 border-zinc-900 rounded-xl"
                                    value={editValues?.current}
                                    onChange={e => setEditValues(prev => prev ? { ...prev, current: +e.target.value } : null)}
                                    autoFocus
                                  />
                                ) : (
                                  <span className="font-black text-base text-zinc-900">{item.estoqueAtual || 0}</span>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {isEditing ? (
                                  <Input
                                    type="number"
                                    className="h-10 w-20 mx-auto font-black text-center border-2 border-zinc-200 rounded-xl"
                                    value={editValues?.ideal}
                                    onChange={e => setEditValues(prev => prev ? { ...prev, ideal: +e.target.value } : null)}
                                  />
                                ) : (
                                  <div className="flex items-center justify-center gap-1.5">
                                    <Target className="h-3 w-3 text-zinc-300" />
                                    <span className="font-bold text-[11px] text-zinc-400">{item.estoqueDesejado || 0}</span>
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="space-y-2 min-w-[140px]">
                                  <div className="flex items-center justify-between">
                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${isCritical ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                      {isCritical ? 'Critico' : 'Saudável'}
                                    </span>
                                    <span className="text-[9px] font-black text-zinc-900">{Math.round(pct)}%</span>
                                  </div>
                                  <Progress value={pct} className="h-1 rounded-full bg-zinc-100" indicatorClassName={isCritical ? "bg-rose-500" : "bg-emerald-500"} />
                                </div>
                              </TableCell>
                              <TableCell className="px-10 text-right">
                                {isEditing ? (
                                  <div className="flex justify-end gap-1">
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-500 hover:bg-rose-50 rounded-lg" onClick={() => setEditingRow(null)}><X className="h-4 w-4" /></Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 rounded-lg" onClick={() => handleUpdateItem(item)}><Check className="h-4 w-4" /></Button>
                                  </div>
                                ) : (
                                  <Button
                                    variant="ghost" size="icon"
                                    className="h-9 w-9 text-zinc-300 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                                    onClick={() => {
                                      setEditingRow(item.id);
                                      setEditValues({ current: item.estoqueAtual || 0, ideal: item.estoqueDesejado || 0 });
                                    }}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            )}
          </main>
        </div>
      )}

      <Dialog open={addMixDialog} onOpenChange={setAddMixDialog}>
        <DialogContent className="sm:max-w-md border-none bg-white p-10 rounded-[3rem] shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-black uppercase tracking-tighter text-3xl italic text-zinc-900 text-center">Deploy Mix</DialogTitle>
          </DialogHeader>
          <div className="py-8 space-y-6">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Catálogos de Marca</Label>
              <Select onValueChange={setSelectedMixToAdd} value={selectedMixToAdd}>
                <SelectTrigger className="h-16 font-black bg-zinc-50 border-none rounded-2xl text-xs uppercase italic tracking-wider">
                  <SelectValue placeholder="Selecionar Portfólio..." />
                </SelectTrigger>
                <SelectContent>
                  {availableMixes.map((m: T.MixProduto) => {
                    const jaExiste = idsJaVinculados.includes(m.id);
                    return (
                      <SelectItem 
                        key={m.id} 
                        value={m.id} 
                        disabled={jaExiste}
                        className={`font-bold text-[11px] uppercase tracking-tighter flex items-center justify-between gap-2 ${jaExiste ? 'opacity-50' : ''}`}
                      >
                        <div className="flex items-center justify-between w-full min-w-[280px]">
                          <span>{m.marca?.nome} — {m.nome}</span>
                          {jaExiste && (
                            <span className="flex items-center gap-1 bg-zinc-200 text-zinc-500 px-2 py-0.5 rounded-full text-[8px] font-black ml-4">
                              <Info className="h-2 w-2" /> JÁ ATIVO
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              className="w-full bg-zinc-900 text-white font-black uppercase h-16 rounded-3xl tracking-[0.2em] hover:bg-black transition-all shadow-xl text-xs italic"
              disabled={!selectedMixToAdd || addMixMutation.isPending}
              onClick={() => addMixMutation.mutate(selectedMixToAdd)}
            >
              {addMixMutation.isPending ? <Loader2 className="animate-spin" /> : "Vincular à Unidade"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MixUsuario;