import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import DataTable from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiService } from "@/api/routes";
import * as T from "../api/types";

const userSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  cargo: z.enum(["ADMIN", "GERENTE", "OPERADOR"]),
  senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").optional().or(z.literal("")),
});

type UserFormData = z.infer<typeof userSchema>;

const Usuarios = () => {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<T.Usuario | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await apiService.usuarios.listar();
      return res.data;
    },
  });

  useEffect(() => {
    if (selectedUser) {
      reset({
        nome: selectedUser.nome,
        email: selectedUser.email,
        cargo: selectedUser.cargo,
        senha: "",
      });
    } else {
      reset({ nome: "", email: "", cargo: "OPERADOR", senha: "" });
    }
  }, [selectedUser, reset]);

  const saveMutation = useMutation({
    mutationFn: (data: UserFormData) => {
      if (selectedUser) {
        return apiService.usuarios.atualizar(selectedUser.id, data);
      }
      return apiService.usuarios.criar(data as T.CriarUsuarioInput);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(selectedUser ? "Usuário atualizado" : "Usuário criado");
      setIsEditOpen(false);
    },
    onError: (err: any) => toast.error(err.response?.data?.mensagem || "Erro ao salvar"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiService.usuarios.deletar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Usuário removido");
      setIsDeleteOpen(false);
    },
  });

  const columns = [
    { key: "nome", label: "Nome" },
    { key: "email", label: "E-mail" },
    {
      key: "cargo",
      label: "Perfil",
      render: (u: T.Usuario) => (
        <Badge variant={u.cargo === "ADMIN" ? "default" : u.cargo === "GERENTE" ? "secondary" : "outline"}>
          {u.cargo}
        </Badge>
      ),
    },
    {
      key: "criadoEm",
      label: "Cadastro",
      render: (u: T.Usuario) => new Date(u.createdAt).toLocaleDateString("pt-BR"),
    },
  ];

  return (
    <div className="p-6">
      <DataTable
        title="Usuários"
        description="Gerencie os usuários e seus níveis de acesso"
        columns={columns}
        data={users}
        isLoading={isLoading}
        searchKey="nome"
        onAdd={() => {
          setSelectedUser(null);
          setIsEditOpen(true);
        }}
        onEdit={(u) => {
          setSelectedUser(u);
          setIsEditOpen(true);
        }}
        onDelete={(u) => {
          setSelectedUser(u);
          setIsDeleteOpen(true);
        }}
        addLabel="Novo Usuário"
      />

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedUser ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit((data) => saveMutation.mutate(data))} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <Input id="nome" {...register("nome")} />
              {errors.nome && <p className="text-xs text-destructive">{errors.nome.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cargo">Perfil de Acesso</Label>
              <Select 
                onValueChange={(v: T.Cargo) => setValue("cargo", v)} 
                defaultValue={selectedUser?.cargo || "OPERADOR"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                  <SelectItem value="GERENTE">GERENTE</SelectItem>
                  <SelectItem value="OPERADOR">OPERADOR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha">{selectedUser ? "Nova Senha (deixe em branco para manter)" : "Senha"}</Label>
              <Input id="senha" type="password" {...register("senha")} />
              {errors.senha && <p className="text-xs text-destructive">{errors.senha.message}</p>}
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Deseja excluir <strong>{selectedUser?.nome}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Cancelar</Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedUser && deleteMutation.mutate(selectedUser.id)}
              disabled={deleteMutation.isPending}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Usuarios;