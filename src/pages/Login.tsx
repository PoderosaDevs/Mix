import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Eye, EyeOff, BarChart3, ShieldCheck, Zap, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import loginBg from "@/assets/login-bg.jpg";
import { apiService } from "@/api/routes";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [regNome, setRegNome] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regSenha, setRegSenha] = useState("");
  const [regCargo, setRegCargo] = useState<"OPERADOR" | "GERENTE" | "ADMIN">("OPERADOR");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login({ email, senha });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro na autenticação",
        description: error.response?.data?.mensagem || "Verifique suas credenciais.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await apiService.usuarios.criar({
        nome: regNome,
        email: regEmail,
        senha: regSenha,
        cargo: regCargo,
      });

      // delay fake (pode ajustar para 5000 se quiser 5s)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast({
        title: "Conta criada!",
        description: "Agora você já pode realizar o seu login.",
      });

      // limpa os campos
      setRegNome("");
      setRegEmail("");
      setRegSenha("");
      setRegCargo("OPERADOR");

      // preenche o email no login (UX melhor)
      setEmail(regEmail);

      // volta pra aba de login
      setActiveTab("login");

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro no cadastro",
        description: error.response?.data?.mensagem || "Tente novamente mais tarde.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: BarChart3, title: "Gestão Inteligente", desc: "Controle total do estoque com sugestões automáticas de reposição" },
    { icon: ShieldCheck, title: "Seguro e Confiável", desc: "Seus dados protegidos com a mais alta segurança" },
    { icon: Zap, title: "Mix Otimizado", desc: "Algoritmos que sugerem o mix ideal para cada loja" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1">
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col">
          <img
            src={loginBg}
            alt=""
            className="absolute inset-0 w-full h-full object-cover animate-[slowZoom_25s_ease-in-out_infinite_alternate]"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-primary/90" />
          <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground flex-1">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center">
                <Package className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold">Paraíso Distribuidora</span>
            </div>

            <div className="space-y-8">
              <div>
                <h2 className="text-4xl font-bold leading-tight">
                  Controle seu estoque<br />com inteligência
                </h2>
                <p className="mt-4 text-primary-foreground/80 text-lg max-w-md">
                  Plataforma completa para gestão de produtos, lojas e mix ideal de estoque.
                </p>
              </div>

              <div className="space-y-5">
                {features.map((f, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary-foreground/15 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                      <f.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">{f.title}</p>
                      <p className="text-sm text-primary-foreground/70">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <footer className="text-xs text-primary-foreground/60">
              © {new Date().getFullYear()} Paraíso Distribuidora. Todos os direitos reservados.
            </footer>
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-background">
          <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
            <div className="w-full max-w-md">
              <div className="lg:hidden flex items-center gap-3 mb-10">
                <div className="h-11 w-11 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
                  <Package className="h-6 w-6" />
                </div>
                <span className="text-xl font-bold">Paraíso Distribuidora</span>
              </div>

              <div className="mb-8">
                <h1 className="text-3xl font-bold">Bem-vindo</h1>
                <p className="text-muted-foreground mt-2">Acesse sua conta ou crie uma nova</p>
              </div>

              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 h-12">
                  <TabsTrigger value="login" className="text-sm">Entrar</TabsTrigger>
                  <TabsTrigger value="register" className="text-sm">Cadastrar</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">E-mail</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="seu@email.com" 
                        className="h-12"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
                        <button type="button" className="text-xs text-primary hover:underline">Esqueceu a senha?</button>
                      </div>
                      <div className="relative">
                        <Input 
                          id="password" 
                          type={showPassword ? "text" : "password"} 
                          placeholder="••••••••" 
                          className="h-12 pr-12"
                          value={senha}
                          onChange={(e) => setSenha(e.target.value)}
                          required
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-12 text-sm font-semibold" disabled={isLoading}>
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Entrar"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="reg-name" className="text-sm font-medium">Nome Completo</Label>
                      <Input 
                        id="reg-name" 
                        placeholder="Seu nome" 
                        className="h-12" 
                        value={regNome}
                        onChange={(e) => setRegNome(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-email" className="text-sm font-medium">E-mail</Label>
                      <Input 
                        id="reg-email" 
                        type="email" 
                        placeholder="seu@email.com" 
                        className="h-12"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-password" className="text-sm font-medium">Senha</Label>
                      <Input 
                        id="reg-password" 
                        type="password" 
                        placeholder="Mínimo 8 caracteres" 
                        className="h-12"
                        value={regSenha}
                        onChange={(e) => setRegSenha(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Cargo</Label>
                      <select 
                        className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={regCargo}
                        onChange={(e) => setRegCargo(e.target.value as any)}
                      >
                        <option value="OPERADOR">Operador</option>
                        <option value="GERENTE">Gerente</option>
                        <option value="ADMIN">Administrador</option>
                      </select>
                    </div>
                    <Button type="submit" className="w-full h-12 text-sm font-semibold" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Criando conta...
                        </>
                      ) : (
                        "Criar conta"
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          <footer className="py-4 text-center text-xs text-muted-foreground border-t border-border/50">
            Desenvolvido por <span className="font-semibold tracking-wide text-foreground">SAVANT</span>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Login;