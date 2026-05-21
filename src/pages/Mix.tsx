import { useState, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Trash2,
  Eye,
  Upload,
  Loader2,
  Search,
  X
} from "lucide-react";
import * as XLSX from "xlsx";
import DataTable from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { apiService } from "@/api/routes";
import * as T from "@/api/types";

const ITEMS_PER_PAGE_PREVIEW = 10;

const Mix = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [instructionDialog, setInstructionDialog] = useState(false);
  const [previewDialog, setPreviewDialog] = useState(false);
  const [finalConfigDialog, setFinalConfigDialog] = useState(false);
  const [viewItemsDialog, setViewItemsDialog] = useState(false);
  
  const [importData, setImportData] = useState<any[]>([]);
  const [previewPage, setPreviewPage] = useState(1);
  const [selectedMix, setSelectedMix] = useState<T.MixProduto | null>(null);
  const [mixConfig, setMixConfig] = useState({ nome: "", marcaId: "" });

  const [searchTerm, setSearchTerm] = useState("");
  const [viewPage, setViewPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { data: mixes = [], isLoading } = useQuery({
    queryKey: ["mixes-list"],
    queryFn: async () => {
      const res = await apiService.mixProdutos.listarTodos();
      return res.data || [];
    }
  });

  const { data: marcas = [] } = useQuery({
    queryKey: ["marcas-select"],
    queryFn: async () => {
      const res = await apiService.marcas.listar();
      return res.data || [];
    }
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiService.mixProdutos.criar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mixes-list"] });
      toast.success("Perfil de Mix criado com sucesso!");
      closeAllModals();
    }
  });

  const updateMutation = useMutation({
    mutationFn: (variables: { id: string, data: any }) => apiService.mixProdutos.atualizar(variables.id, variables.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mixes-list"] });
      toast.success("Mix atualizado com sucesso!");
      closeAllModals();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiService.mixProdutos.excluir(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mixes-list"] });
      toast.success("Mix removido com sucesso.");
    }
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      const mapped = data.map((row: any) => ({
        codigo: String(row.CODIGO || row.Codigo || ""),
        descricao: String(row.DESCRICAO || row.Descricao || "PRODUTO SEM DESCRIÇÃO"),
      })).filter(item => item.codigo !== "" && item.codigo !== "undefined");

      setImportData(mapped);
      setInstructionDialog(false);
      setPreviewDialog(true);
    };
    reader.readAsBinaryString(file);
  };

  const closeAllModals = () => {
    setInstructionDialog(false);
    setPreviewDialog(false);
    setFinalConfigDialog(false);
    setViewItemsDialog(false);
    setImportData([]);
    setSelectedMix(null);
    setPreviewPage(1);
    setSearchTerm("");
    setViewPage(1);
    setMixConfig({ nome: "", marcaId: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const filteredAndPaginatedItems = useMemo(() => {
    if (!selectedMix?.itens) return { items: [], total: 0, totalPages: 0 };

    const filtered = selectedMix.itens.filter(item => 
      item.produtoId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nomeProduto?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const start = (viewPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    return {
      items: filtered.slice(start, end),
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / itemsPerPage)
    };
  }, [selectedMix, searchTerm, viewPage, itemsPerPage]);

  const totalPagesPreview = Math.ceil(importData.length / ITEMS_PER_PAGE_PREVIEW);
  const paginatedPreviewData = importData.slice((previewPage - 1) * ITEMS_PER_PAGE_PREVIEW, previewPage * ITEMS_PER_PAGE_PREVIEW);

  return (
    <>
      <DataTable
        title="Perfis de Mix"
        description="Gestão de matrizes de produtos por marca"
        columns={[
          { 
            key: "nome", 
            label: "Nome do Perfil", 
            render: (m: T.MixProduto) => <span className="font-black text-zinc-900 uppercase italic tracking-tighter">{m.nome}</span> 
          },
          { 
            key: "marca", 
            label: "Marca", 
            render: (m: T.MixProduto) => <Badge variant="outline" className="font-black bg-zinc-50 text-zinc-500 border-zinc-200 uppercase text-[10px]">{m.marca?.nome || "GERAL"}</Badge> 
          },
          {
            key: "actions",
            label: "Ações",
            align: "end",
            render: (m: T.MixProduto) => (
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-zinc-100" onClick={() => { setSelectedMix(m); setViewItemsDialog(true); }}>
                  <Eye className="h-4 w-4 text-zinc-400" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-zinc-100" onClick={() => { setSelectedMix(m); setInstructionDialog(true); }}>
                  <Upload className="h-4 w-4 text-zinc-400" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-50 group" onClick={() => { if(confirm("Deseja excluir este mix?")) deleteMutation.mutate(m.id) }}>
                  <Trash2 className="h-4 w-4 text-zinc-300 group-hover:text-red-500" />
                </Button>
              </div>
            )
          }
        ] as any}
        data={mixes}
        searchKey="nome"
        onAdd={() => setInstructionDialog(true)}
        addLabel="Importar Planilha"
        isLoading={isLoading}
      />

      <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />

      <Dialog open={viewItemsDialog} onOpenChange={(open) => {
        if(!open) {
          setSearchTerm("");
          setViewPage(1);
        }
        setViewItemsDialog(open);
      }}>
        <DialogContent className="sm:max-w-4xl bg-white border-none shadow-2xl p-0 overflow-hidden flex flex-col max-h-[90vh]">
          <DialogHeader className="p-8 bg-zinc-50 border-b space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="font-black uppercase italic tracking-tighter text-2xl text-zinc-900">
                    {selectedMix?.nome}
                  </div>
                  <Badge className="bg-zinc-900 text-white font-black text-[10px] uppercase">
                    {selectedMix?.marca?.nome || "MULTIMARCA"}
                  </Badge>
                </div>
                <div className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Matriz ativa com {selectedMix?.itens?.length || 0} SKUs cadastrados
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input 
                      placeholder="BUSCAR SKU OU DESCRIÇÃO..." 
                      className="pl-10 h-11 w-[300px] bg-white border-zinc-200 font-bold uppercase text-xs focus:ring-zinc-900"
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setViewPage(1); }}
                    />
                 </div>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            <table className="w-full border-collapse">
              <thead className="bg-white sticky top-0 z-10 border-b border-zinc-100 shadow-sm">
                <tr className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                  <th className="text-left p-6 w-1/4">SKU / ID</th>
                  <th className="text-left p-6">Descrição do Produto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {filteredAndPaginatedItems.items.map((item: any, idx: number) => (
                  <tr key={idx} className="hover:bg-zinc-50/50 transition-colors group">
                    <td className="p-6">
                      <span className="font-mono text-sm font-black text-zinc-900 group-hover:text-zinc-600 transition-colors">
                        {item.produtoId}
                      </span>
                    </td>
                    <td className="p-6">
                      <span className="text-xs font-bold uppercase text-zinc-500 tracking-tight">
                        {item.nomeProduto || "Item do Mix"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredAndPaginatedItems.total === 0 && (
              <div className="py-24 text-center space-y-2">
                <div className="font-black text-zinc-200 uppercase text-4xl italic tracking-tighter">Nada Encontrado</div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase">Tente ajustar os termos da sua busca</p>
              </div>
            )}
          </div>

          <DialogFooter className="p-6 bg-zinc-50 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-zinc-400 uppercase">Exibir</span>
                <Select value={String(itemsPerPage)} onValueChange={(v) => { setItemsPerPage(Number(v)); setViewPage(1); }}>
                  <SelectTrigger className="h-9 w-[70px] border-zinc-200 bg-white font-black text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-zinc-200">
                    <SelectItem value="10" className="font-bold">10</SelectItem>
                    <SelectItem value="25" className="font-bold">25</SelectItem>
                    <SelectItem value="50" className="font-bold">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <span className="text-[10px] font-black text-zinc-400 uppercase">
                Mostrando {filteredAndPaginatedItems.items.length} de {filteredAndPaginatedItems.total}
              </span>
            </div>
            <div className="flex items-center gap-2">
               <div className="flex gap-1 mr-4">
                  <Button variant="outline" size="icon" disabled={viewPage === 1} onClick={() => setViewPage(prev => prev - 1)} className="h-9 w-9 rounded-lg border-zinc-200 bg-white hover:bg-zinc-100">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" disabled={viewPage >= filteredAndPaginatedItems.totalPages} onClick={() => setViewPage(prev => prev + 1)} className="h-9 w-9 rounded-lg border-zinc-200 bg-white hover:bg-zinc-100">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
               </div>
               <Button variant="ghost" onClick={closeAllModals} className="font-black uppercase text-[10px] tracking-widest text-zinc-400 hover:text-zinc-900">
                 Fechar Matriz
               </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={instructionDialog} onOpenChange={setInstructionDialog}>
        <DialogContent className="sm:max-w-md bg-white border-zinc-200">
          <DialogHeader>
            <div className="font-black uppercase tracking-widest flex items-center gap-2 text-zinc-900 italic">
              <FileSpreadsheet className="text-zinc-400 h-5 w-5" /> 
              {selectedMix ? "Atualizar Matriz" : "Nova Matriz de Mix"}
            </div>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4 bg-zinc-50 p-6 rounded-xl border border-zinc-100">
              <div className="flex flex-col gap-1 border-r border-zinc-200">
                <span className="text-[10px] font-black text-zinc-400 uppercase">Coluna A</span>
                <span className="font-mono text-sm font-black text-zinc-800">CODIGO</span>
              </div>
              <div className="flex flex-col gap-1 pl-2">
                <span className="text-[10px] font-black text-zinc-400 uppercase">Coluna B</span>
                <span className="font-mono text-sm font-black text-zinc-800">DESCRICAO</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button className="w-full font-black uppercase h-14 bg-zinc-900 text-white hover:bg-zinc-800 tracking-widest" onClick={() => fileInputRef.current?.click()}>
              Selecionar Planilha
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={previewDialog} onOpenChange={setPreviewDialog}>
        <DialogContent className="sm:max-w-4xl bg-white border-none shadow-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
          <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
            <div>
               <div className="font-black uppercase tracking-tight text-xl text-zinc-900 italic">Review de Carga</div>
               <p className="text-[10px] font-black text-zinc-400 uppercase">Total detectado: {importData.length}</p>
            </div>
            <Badge variant="outline" className="h-8 px-4 border-zinc-200 text-zinc-500 font-bold">PAG {previewPage} / {totalPagesPreview}</Badge>
          </div>
          <div className="flex-1 overflow-y-auto px-6">
            <table className="w-full">
              <thead className="sticky top-0 bg-white z-10 shadow-[0_1px_0_rgba(0,0,0,0.05)]">
                <tr className="text-[10px] font-black text-zinc-400 uppercase">
                  <th className="text-left p-4">Referência Interna</th>
                  <th className="text-left p-4">Descrição</th>
                  <th className="text-right p-4">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {paginatedPreviewData.map((item, idx) => {
                  const actualIndex = (previewPage - 1) * ITEMS_PER_PAGE_PREVIEW + idx;
                  return (
                    <tr key={actualIndex} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="p-4 font-mono text-xs font-bold text-zinc-900">{item.codigo}</td>
                      <td className="p-4 text-xs font-bold uppercase text-zinc-600">{item.descricao}</td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="icon" onClick={() => setImportData(prev => prev.filter((_, i) => i !== actualIndex))} className="text-zinc-300 hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-6 border-t border-zinc-100 flex items-center justify-between bg-zinc-50/30">
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled={previewPage === 1} onClick={() => setPreviewPage(prev => prev - 1)} className="h-9 w-9 p-0 rounded-lg"><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="sm" disabled={previewPage === totalPagesPreview} onClick={() => setPreviewPage(prev => prev + 1)} className="h-9 w-9 p-0 rounded-lg"><ChevronRight className="h-4 w-4" /></Button>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={closeAllModals} className="font-bold uppercase text-[10px] text-zinc-400">Cancelar</Button>
              <Button className="font-black uppercase tracking-widest px-8 h-11 bg-zinc-900 text-white hover:bg-zinc-800" onClick={() => { setPreviewDialog(false); setFinalConfigDialog(true); }}>
                Continuar <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={finalConfigDialog} onOpenChange={setFinalConfigDialog}>
        <DialogContent className="sm:max-w-md bg-white border-none shadow-2xl">
          <DialogHeader>
            <div className="font-black uppercase tracking-widest text-zinc-900 text-center italic">Finalizar Perfil</div>
          </DialogHeader>
          <div className="space-y-5 py-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-zinc-400 ml-1">Nome da Matriz</Label>
              <Input 
                className="h-12 bg-white border-zinc-200 font-bold uppercase focus:ring-1 focus:ring-zinc-900"
                value={selectedMix ? selectedMix.nome : mixConfig.nome}
                disabled={!!selectedMix}
                placeholder="EX: MIX_SÃO_JOÃO_2026"
                onChange={(e) => setMixConfig({...mixConfig, nome: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-zinc-400 ml-1">Marca</Label>
              <Select disabled={!!selectedMix} defaultValue={selectedMix?.marcaId} onValueChange={(v) => setMixConfig({...mixConfig, marcaId: v})}>
                <SelectTrigger className="h-12 border-zinc-200 font-bold uppercase">
                  <SelectValue placeholder="SELECIONE A MARCA" />
                </SelectTrigger>
                <SelectContent className="bg-white border-zinc-200">
                  {marcas.map((m: T.Marca) => <SelectItem key={m.id} value={m.id} className="font-bold uppercase">{m.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-col gap-3">
             <Button 
              className="w-full font-black uppercase h-14 bg-zinc-900 text-white hover:bg-zinc-800 tracking-widest shadow-lg"
              disabled={createMutation.isPending || updateMutation.isPending}
              onClick={() => {
                const payload = {
                  nome: selectedMix ? selectedMix.nome : mixConfig.nome,
                  marcaId: selectedMix ? selectedMix.marcaId : mixConfig.marcaId,
                  itens: importData.map(d => ({ 
                    produtoId: d.codigo,
                    nomeProduto: d.descricao 
                  }))
                };
                if (selectedMix) {
                  updateMutation.mutate({ id: selectedMix.id, data: payload });
                } else {
                  createMutation.mutate(payload);
                }
              }}
            >
              {createMutation.isPending || updateMutation.isPending ? <Loader2 className="animate-spin h-5 w-5" /> : "SALVAR MATRIZ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Mix;