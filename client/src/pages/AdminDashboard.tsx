import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, LogOut, Settings, Trash2, Edit, Plus, Search, UserX, UserCheck, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
// IMPORTANTE: Verifique se você tem esses componentes de Dialog instalados
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function AdminDashboard() {
  const [ , navigate] = useLocation();
  const [admin, setAdmin] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState<number | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const dashboardStatsQuery = trpc.admin.getDashboardStats.useQuery(
    { adminId: admin?.id || 0 },
    { enabled: !!admin }
  );

  const studentsQuery = trpc.student.getAll.useQuery({ 
    search: searchTerm, 
    grade: gradeFilter 
  });

  const deleteMutation = trpc.student.delete.useMutation({
    onSuccess: () => studentsQuery.refetch()
  });

  const updateMutation = trpc.student.update.useMutation({
    onSuccess: () => studentsQuery.refetch()
  });

  const registerMutation = trpc.auth.registerStudent.useMutation({
    onSuccess: () => {
      alert("Estudante cadastrado com sucesso!");
      studentsQuery.refetch();
      dashboardStatsQuery.refetch(); // Atualiza os números do dashboard
      setIsModalOpen(false);
    },
    onError: (err) => alert("Erro ao cadastrar: " + err.message)
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("tokiwadai-user");
    const userType = localStorage.getItem("tokiwadai-user-type");
    if (!storedUser || userType !== "admin") {
      navigate("/login");
      return;
    }
    setAdmin(JSON.parse(storedUser));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("tokiwadai-user");
    localStorage.removeItem("tokiwadai-user-type");
    navigate("/login");
  };

  // Função para renderizar as opções de séries (Centralizado para não repetir código)
  const GradeOptions = () => (
    <>
      <option value="">Todas as Séries</option>
      <optgroup label="Ensino Fundamental">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(g => <option key={g} value={g}>{g}º Ano (EF)</option>)}
      </optgroup>
      <optgroup label="Ensino Médio">
        <option value={10}>1º Ano (Ensino Médio)</option>
        <option value={11}>2º Ano (Ensino Médio)</option>
        <option value={12}>3º Ano (Ensino Médio)</option>
      </optgroup>
    </>
  );

  if (!admin) return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Mantido igual */}
      <div className="w-64 bg-red-900 text-white p-6 shadow-lg">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">TKW Academy</h1>
          <p className="text-red-200 text-sm">Painel Administrativo</p>
        </div>
        <nav className="space-y-4">
          <button onClick={() => setActiveTab("dashboard")} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${activeTab === "dashboard" ? "bg-red-800" : "hover:bg-red-800"}`}><Settings size={20} /><span>Dashboard</span></button>
          <button onClick={() => setActiveTab("students")} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${activeTab === "students" ? "bg-red-800" : "hover:bg-red-800"}`}><Users size={20} /><span>Gerenciar Estudantes</span></button>
          <button onClick={() => navigate("/admin/mirror")} className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-red-800 transition"><Zap size={20} /><span>Gerenciar Mirror</span></button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-red-800 transition mt-8"><LogOut size={20} /><span>Sair</span></button>
        </nav>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Painel Administrativo</h2>
            <p className="text-gray-600">Admin: {admin.username}</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsContent value="dashboard">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader><CardTitle className="text-sm font-medium">Total de Estudantes</CardTitle></CardHeader>
                  <CardContent><p className="text-3xl font-bold">{dashboardStatsQuery.data?.totalStudents || 0}</p></CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-sm font-medium">Posts no Mirror</CardTitle></CardHeader>
                  <CardContent><p className="text-3xl font-bold">{dashboardStatsQuery.data?.totalPosts || 0}</p></CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="students">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Gerenciamento de Alunos</CardTitle>
                    
                    {/* MODAL DE CADASTRO ADICIONADO AQUI */}
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                      <DialogTrigger asChild>
                        <Button className="gap-2 bg-red-700 hover:bg-red-800">
                          <Plus size={20} /> Novo Estudante
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader><DialogTitle>Cadastrar Aluno em Tokiwadai</DialogTitle></DialogHeader>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const fd = new FormData(e.currentTarget);
                          registerMutation.mutate({
                            fullName: fd.get("name") as string,
                            username: fd.get("user") as string,
                            email: fd.get("email") as string,
                            password: fd.get("pass") as string,
                            grade: Number(fd.get("grade")),
                            district: Number(fd.get("dist") || 1),
                            birthDate: fd.get("birth") as string,
                          });
                        }} className="space-y-4 pt-4">
                          <div className="grid gap-2"><Label>Nome Completo</Label><Input name="name" required /></div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2"><Label>Usuário</Label><Input name="user" required /></div>
                            <div className="grid gap-2"><Label>Série</Label>
                              <select name="grade" className="border rounded-md p-2 text-sm"><GradeOptions /></select>
                            </div>
                          </div>
                          <div className="grid gap-2"><Label>Email</Label><Input name="email" type="email" required /></div>
                          <div className="grid gap-2"><Label>Senha</Label><Input name="pass" type="password" required /></div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2"><Label>Nascimento</Label><Input name="birth" type="date" required /></div>
                            <div className="grid gap-2"><Label>Distrito (1-23)</Label><Input name="dist" type="number" defaultValue="1" /></div>
                          </div>
                          <Button type="submit" className="w-full bg-red-700" disabled={registerMutation.isPending}>
                            {registerMutation.isPending ? "Salvando..." : "Confirmar Matrícula"}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                      <Input placeholder="Buscar por nome ou ID..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    {/* FILTRO COM ENSINO MÉDIO */}
                    <select 
                      className="border rounded-md px-3 py-2 text-sm bg-white"
                      onChange={(e) => setGradeFilter(e.target.value ? Number(e.target.value) : undefined)}
                    >
                      <GradeOptions />
                    </select>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-3 font-semibold text-gray-700">Estudante</th>
                          <th className="px-4 py-3 font-semibold text-gray-700">Série</th>
                          <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
                          <th className="px-4 py-3 text-right font-semibold text-gray-700">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {studentsQuery.isLoading ? (
                          <tr><td colSpan={4} className="text-center py-10">Carregando lista...</td></tr>
                        ) : studentsQuery.data?.map((student: any) => (
                          <tr key={student.id} className="hover:bg-gray-50 transition">
                            <td className="px-4 py-3">
                              <div className="font-medium text-gray-900">{student.fullName}</div>
                              <div className="text-xs text-gray-500">{student.studentId}</div>
                            </td>
                            <td className="px-4 py-3">
                              {student.grade > 9 ? `${student.grade - 9}º Ano (EM)` : `${student.grade}º Ano (EF)`}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${student.isSuspended ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                                {student.isSuspended ? "Suspenso" : "Ativo"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right space-x-2">
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => updateMutation.mutate({ id: student.id, isSuspended: !student.isSuspended })}>
                                {student.isSuspended ? <UserCheck size={16} /> : <UserX size={16} />}
                              </Button>
                              <Button variant="destructive" size="sm" className="h-8 w-8 p-0" onClick={() => confirm(`Excluir ${student.fullName}?`) && deleteMutation.mutate({ id: student.id })}>
                                <Trash2 size={16} />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}