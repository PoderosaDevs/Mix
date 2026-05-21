import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, Package, TrendingUp, Star, ShoppingCart, User, MapPin } from "lucide-react";
import StatCard from "@/components/StatCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import storeImage from "@/assets/login-bg.jpg";

interface StoreConfig {
  name: string;
  city: string;
  state: string;
  manager: string;
  status: string;
  image: string;
  sections: {
    stats: boolean;
    weeklyChart: boolean;
    topProducts: boolean;
    recommended: boolean;
  };
}

const storeDatabase: Record<string, StoreConfig> = {
  "loja-centro-2024": {
    name: "Loja Centro", city: "São Paulo", state: "SP", manager: "Carlos Silva",
    status: "Ativa", image: storeImage,
    sections: { stats: true, weeklyChart: true, topProducts: true, recommended: true },
  },
  "loja-norte-abc": {
    name: "Loja Norte", city: "Campinas", state: "SP", manager: "Ana Santos",
    status: "Ativa", image: storeImage,
    sections: { stats: true, weeklyChart: true, topProducts: true, recommended: false },
  },
};

const topProducts = [
  { name: "Refrigerante Cola 2L", sold: 340, trend: "+12%" },
  { name: "Água Mineral 500ml", sold: 520, trend: "+8%" },
  { name: "Cerveja Pilsen 350ml", sold: 290, trend: "+5%" },
  { name: "Suco Natural 1L", sold: 180, trend: "-3%" },
  { name: "Energético 250ml", sold: 150, trend: "+15%" },
];

const chartData = [
  { name: "Seg", vendas: 45 }, { name: "Ter", vendas: 52 },
  { name: "Qua", vendas: 49 }, { name: "Qui", vendas: 63 },
  { name: "Sex", vendas: 71 }, { name: "Sáb", vendas: 85 },
  { name: "Dom", vendas: 38 },
];

const recommended = [
  { name: "Suco Detox 500ml", reason: "Alta demanda na região", confidence: 92 },
  { name: "Água Saborizada 1L", reason: "Tendência crescente", confidence: 87 },
  { name: "Isotônico 500ml", reason: "Complemento do mix", confidence: 78 },
];

const MinhaLoja = () => {
  const { token } = useParams<{ token: string }>();
  const store = token ? storeDatabase[token] : null;

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="max-w-md w-full text-center p-8">
          <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-xl font-bold mb-2">Acesso não encontrado</h1>
          <p className="text-muted-foreground text-sm">O link de acesso à loja é inválido ou foi desativado. Entre em contato com a Paraíso Distribuidora.</p>
        </Card>
      </div>
    );
  }

  const { sections } = store;

  return (
    <div className="min-h-screen bg-background">
      {/* Header bar */}
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <Store className="h-5 w-5 text-primary" />
          <span className="font-bold text-sm">Paraíso Distribuidora</span>
          <span className="text-muted-foreground text-sm ml-auto">Painel da Loja</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Store header with image and manager */}
        <Card className="glass-card overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row">
              <div className="flex-1 p-6 flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Store className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{store.name}</h1>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {store.city}, {store.state}</span>
                    <Badge variant="outline" className={store.status === "Ativa" ? "border-success text-success" : "border-destructive text-destructive"}>
                      {store.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-6 border-t sm:border-t-0 sm:border-l border-border">
                <div className="h-12 w-12 rounded-full overflow-hidden bg-muted flex-shrink-0">
                  <img src={store.image} alt={store.manager} className="h-full w-full object-cover" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Responsável</p>
                  <p className="font-semibold flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-primary" /> {store.manager}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {sections.stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Produtos em Estoque" value="320" icon={Package} />
            <StatCard title="Vendas da Semana" value="403" icon={ShoppingCart} change="+12%" positive />
            <StatCard title="Faturamento" value="R$ 12.8K" icon={TrendingUp} change="+8%" positive />
            <StatCard title="Avaliação" value="4.8" icon={Star} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sections.weeklyChart && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Vendas da Semana</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                    <Bar dataKey="vendas" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {sections.topProducts && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Produtos Mais Vendidos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topProducts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-primary w-6">{i + 1}º</span>
                      <span className="text-sm font-medium">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">{p.sold} un</span>
                      <Badge variant="secondary" className="text-xs">{p.trend}</Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {sections.recommended && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" /> Produtos Recomendados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {recommended.map((r, i) => (
                  <Card key={i} className="border-primary/20 bg-primary/5">
                    <CardContent className="p-4">
                      <p className="font-semibold">{r.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{r.reason}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <div className="flex-1 h-1.5 rounded-full bg-muted">
                          <div className="h-1.5 rounded-full bg-primary" style={{ width: `${r.confidence}%` }} />
                        </div>
                        <span className="text-xs font-medium text-primary">{r.confidence}%</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <footer className="border-t border-border py-4 px-6 text-center text-xs text-muted-foreground mt-8">
        © {new Date().getFullYear()} Paraíso Distribuidora. Todos os direitos reservados. Desenvolvido por <span className="font-medium text-foreground">Savant</span>
      </footer>
    </div>
  );
};

export default MinhaLoja;
