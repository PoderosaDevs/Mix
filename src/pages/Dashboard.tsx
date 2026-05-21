import { Package, Store, Users, TrendingUp, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatCard from "@/components/StatCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const chartData = [
  { name: "Jan", vendas: 400 }, { name: "Fev", vendas: 300 },
  { name: "Mar", vendas: 600 }, { name: "Abr", vendas: 800 },
  { name: "Mai", vendas: 500 }, { name: "Jun", vendas: 700 },
];

const recentActivity = [
  { action: "Estoque atualizado", item: "Refrigerante Cola 2L", store: "Loja Centro", time: "2 min" },
  { action: "Produto adicionado", item: "Suco Natural 1L", store: "Loja Norte", time: "15 min" },
  { action: "Mix atualizado", item: "Água Mineral 500ml", store: "Loja Sul", time: "1h" },
  { action: "Alerta de estoque", item: "Cerveja Pilsen 350ml", store: "Loja Centro", time: "2h" },
];

const Dashboard = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">Visão geral do sistema</p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard title="Total Produtos" value="1.248" icon={Package} change="+12% este mês" positive />
      <StatCard title="Lojas Ativas" value="24" icon={Store} change="+2 novas" positive />
      <StatCard title="Usuários" value="86" icon={Users} />
      <StatCard title="Vendas Hoje" value="R$ 45.2K" icon={TrendingUp} change="+8.5%" positive />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 glass-card">
        <CardHeader>
          <CardTitle className="text-lg">Vendas Mensais</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
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

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentActivity.map((a, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShoppingCart className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{a.action}</p>
                <p className="text-xs text-muted-foreground truncate">{a.item} • {a.store}</p>
              </div>
              <span className="text-xs text-muted-foreground ml-auto flex-shrink-0">{a.time}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  </div>
);

export default Dashboard;
