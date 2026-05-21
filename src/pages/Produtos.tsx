import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, Pencil, Trash2, Package, Image as ImageIcon, Loader2, SearchX, Inbox, Upload, X, DollarSign, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { apiService } from "@/api/routes";
import * as T from "../api/types";

const Produtos = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<T.Produto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [displayPrice, setDisplayPrice] = useState("");

  const { register, handleSubmit, reset, setValue, watch } = useForm<T.CriarProdutoInput>();
  const imagePreview = watch("imagem");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["produtos"],
    queryFn: async () => {
      const res = await apiService.produtos.listar();
      return res.data;
    },
  });

  const { data: marcas = [] } = useQuery({
    queryKey: ["marcas"],
    queryFn: async () => {
      const res = await apiService.marcas.listar();
      return res.data;
    },
  });

  const currencyMask = (value: string) => {
    const cleanValue = value.replace(/\D/g, "");
    const numberValue = Number(cleanValue) / 100;
    return numberValue.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const masked = currencyMask(value);
    setDisplayPrice(masked);
    const numericValue = Number(value.replace(/\D/g, "")) / 100;
    setValue("preco", numericValue);
  };

  useEffect(() => {
    if (selectedProduct) {
      const initialPrice = selectedProduct.preco || 0;
      reset({
        nome: selectedProduct.nome,
        sku: selectedProduct.sku,
        preco: initialPrice,
        descricao: selectedProduct.descricao || "",
        imagem: selectedProduct.imagem || "",
        marcaId: selectedProduct.marcaId,
      });
      setDisplayPrice(initialPrice > 0 ? initialPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "");
    } else {
      reset({ nome: "", sku: "", preco: undefined, descricao: "", imagem: "", marcaId: "" });
      setDisplayPrice("");
    }
  }, [selectedProduct, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setValue("imagem", reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const saveMutation = useMutation({
    mutationFn: (data: T.CriarProdutoInput) =>
      selectedProduct
        ? apiService.produtos.atualizar(selectedProduct.id, data)
        : apiService.produtos.criar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["produtos"] });
      toast.success(selectedProduct ? "Produto atualizado" : "Produto criado");
      setIsModalOpen(false);
    },
    onError: () => toast.error("Erro ao salvar produto"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiService.produtos.deletar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["produtos"] });
      toast.success("Produto removido");
    },
  });

  const filtered = products.filter((p) =>
    p.nome.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Produtos</h1>
          <p className="text-muted-foreground text-sm">Gestão de catálogo e precificação real</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nome ou SKU..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="pl-10 w-72 h-10" 
            />
          </div>
          <Button onClick={() => { setSelectedProduct(null); setIsModalOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Novo Produto
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary/60" />
          <p className="text-muted-foreground animate-pulse">Sincronizando catálogo...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((product) => (
            <Card key={product.id} className="group overflow-hidden border-border/50 hover:border-primary/30 transition-all duration-300 shadow-sm bg-card">
              <div className="relative aspect-square w-full bg-muted/20 overflow-hidden">
                {product.imagem ? (
                  <img src={product.imagem} alt={product.nome} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/20">
                    <ImageIcon className="h-12 w-12" />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                  <Button size="sm" variant="secondary" className="h-9 font-bold px-4" onClick={() => { setSelectedProduct(product); setIsModalOpen(true); }}>
                    <Pencil className="h-3.5 w-3.5 mr-2" /> EDITAR
                  </Button>
                  <Button size="sm" variant="destructive" className="h-9 font-bold px-4" onClick={() => deleteMutation.mutate(product.id)}>
                    <Trash2 className="h-3.5 w-3.5 mr-2" /> EXCLUIR
                  </Button>
                </div>
              </div>

              <CardContent className="p-5 space-y-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-sm truncate uppercase tracking-tight text-foreground" title={product.nome}>{product.nome}</h3>
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{product.marca?.nome || "Marca não definida"}</p>
                </div>

                <div className="h-8 flex items-center">
                  {product.preco && product.preco > 0 ? (
                    <span className="text-2xl font-black text-primary tracking-tighter">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.preco)}
                    </span>
                  ) : (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Sem preço definido</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/40">
                  <Badge variant="outline" className="text-[10px] font-mono font-bold px-2 py-0.5 bg-muted/30 text-muted-foreground border-border/60">
                    {product.sku}
                  </Badge>
                  <Package className="h-4 w-4 text-muted-foreground/20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle className="text-xl font-black uppercase tracking-tight">{selectedProduct ? "Editar Produto" : "Novo Cadastro"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit((data) => saveMutation.mutate(data))} className="space-y-6 pt-2">
            
            <div className="relative group flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 bg-muted/10 hover:bg-muted/20 hover:border-primary/40 transition-all cursor-pointer min-h-[160px]">
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} className="h-32 w-32 object-cover rounded-lg shadow-2xl border-2 border-background" alt="Preview" />
                  <Button type="button" variant="destructive" size="icon" className="absolute -top-3 -right-3 h-7 w-7 rounded-full shadow-lg" onClick={() => setValue("imagem", "")}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <div className="p-3 bg-background rounded-full w-fit mx-auto shadow-sm group-hover:scale-110 transition-transform">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Upload da Imagem</p>
                </div>
              )}
              <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nome do Produto</Label>
                <Input {...register("nome", { required: true })} className="font-medium" placeholder="Ex: Wella Professionals Kit" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Preço de Venda</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                  <Input 
                    value={displayPrice} 
                    onChange={handlePriceChange} 
                    className="pl-9 font-bold text-primary text-lg" 
                    placeholder="R$ 0,00" 
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Identificador SKU</Label>
                <Input {...register("sku", { required: true })} className="font-mono uppercase" placeholder="REF-000" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Marca</Label>
                <Select onValueChange={(v) => setValue("marcaId", v)} defaultValue={selectedProduct?.marcaId}>
                  <SelectTrigger className="font-semibold"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {marcas.map((m: T.Marca) => <SelectItem key={m.id} value={m.id} className="font-medium uppercase text-xs">{m.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Descrição Técnica</Label>
              <Input {...register("descricao")} className="font-medium" placeholder="Opcional" />
            </div>

            <DialogFooter className="gap-3 sm:gap-0">
              <Button type="button" variant="ghost" className="font-bold" onClick={() => setIsModalOpen(false)}>CANCELAR</Button>
              <Button type="submit" disabled={saveMutation.isPending} className="min-w-[140px] font-black uppercase tracking-[0.2em] text-xs h-11">
                {saveMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "SALVAR PRODUTO"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Produtos;