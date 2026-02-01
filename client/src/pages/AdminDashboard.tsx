import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Users, LogOut, Trash2, Heart, Search, UserX, UserCheck, Plus, MessageSquare } from "lucide-react";

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const [admin, setAdmin] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("students");
  const [searchTerm, setSearchTerm] = useState("");

  // Queries - Ajustadas para o que o seu Backend exige
  // O seu erro disse que getStats exige um studentId, então passei 0 apenas para validar
  const statsQuery = trpc.mirror.getStats.useQuery(); 
  const studentsQuery = trpc.student.getAll.useQuery({ search: searchTerm }); 
  const postsQuery = trpc.mirror.getPost.useQuery({ postId: 0 });
  // Mutations
  const deletePost = trpc.mirror.deletePost.useMutation({ onSuccess: () => postsQuery.refetch() });
  const deleteStudent = trpc.student.delete.useMutation({ onSuccess: () => studentsQuery.refetch() });
  const toggleSuspension = trpc.student.update.useMutation({ onSuccess: () => studentsQuery.refetch() });

  useEffect(() => {
    const storedUser = localStorage.getItem("tokiwadai-user");
    const userType = localStorage.getItem("tokiwadai-user-type");
    if (!storedUser || userType !== "admin") {
      navigate("/login");
      return;
    }
    setAdmin(JSON.parse(storedUser));
  }, [navigate]);

  if (!admin) return null;

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <aside className="w-64 bg-red-900 text-white p-6 shadow-xl">
        <div className="mb-10 p-2 text-center">
          <h1 className="text-2xl font-bold tracking-tighter">TOKIWADAI</h1>
          <p className="text-red-300 text-[10px] uppercase tracking-widest">Admin Control</p>
        </div>
        <nav className="space-y-1">
          <button onClick={() => setActiveTab("students")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === "students" ? "bg-red-800" : "hover:bg-red-800/50"}`}>
            <Users size={18} /> <span className="text-sm font-medium">Estudantes</span>
          </button>
          <button onClick={() => setActiveTab("mirror")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === "mirror" ? "bg-red-800" : "hover:bg-red-800/50"}`}>
            <MessageSquare size={18} /> <span className="text-sm font-medium">Mirror Control</span>
          </button>
          <button onClick={() => { localStorage.clear(); navigate("/login"); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-700 transition mt-10 text-red-200">
            <LogOut size={18} /> <span className="text-sm font-medium">Sair</span>
          </button>
        </nav>
      </aside>

      <main className="flex-1 overflow-auto p-8 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <header className="mb-8 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black text-gray-900">Dashboard Tokiwadai</h2>
              <p className="text-sm text-gray-500 font-medium">Logado como: {admin.username}</p>
            </div>
            <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex gap-6">
              <div>
                <p className="text-[10px] text-gray-400 font-black uppercase">Alunos Totais</p>
                <p className="text-2xl font-black text-red-700">{statsQuery.data?.totalPosts || 0}</p>
              </div>
            </div>
          </header>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsContent value="students">
              <Card className="border-none shadow-sm overflow-hidden rounded-2xl">
                <div className="p-4 bg-white border-b flex justify-between items-center">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    <Input placeholder="Buscar aluno..." className="pl-9 h-9 bg-gray-50 border-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>
                  <Button size="sm" className="bg-red-700 hover:bg-red-800 rounded-xl"> <Plus size={16} className="mr-2"/> Adicionar </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase">
                      <tr>
                        <th className="px-6 py-4 text-left">Informações</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 bg-white">
                      {studentsQuery.data?.map((student: any) => (
                        <tr key={student.id} className="hover:bg-gray-50/50 transition">
                          <td className="px-6 py-4">
                            <p className="font-bold text-gray-900">{student.fullName}</p>
                            <p className="text-[10px] text-gray-400 font-mono tracking-tighter">{student.studentId}</p>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${student.isSuspended ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
                              {student.isSuspended ? "Suspenso" : "Ativo"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-red-700" onClick={() => toggleSuspension.mutate({ id: student.id, isSuspended: !student.isSuspended })}>
                              {student.isSuspended ? <UserCheck size={16}/> : <UserX size={16}/>}
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-300 hover:text-red-600" onClick={() => confirm("Apagar permanentemente?") && deleteStudent.mutate({ id: student.id })}>
                              <Trash2 size={16} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="mirror">
              <div className="grid grid-cols-1 gap-3">
                {Array.isArray(postsQuery.data) && postsQuery.data.map((post: any) => (
                  <Card key={post.id} className="p-4 flex items-center justify-between bg-white border-none shadow-sm rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-700 font-black text-xs uppercase">
                        {post.student?.fullName?.substring(0,2)}
                      </div>
                      <div>
                        <p className="text-xs font-black text-red-800">{post.student?.fullName}</p>
                        <p className="text-sm text-gray-600 leading-tight">"{post.content}"</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-1.5 text-red-500">
                        <Heart size={14} fill="currentColor" />
                        <span className="text-xs font-black">{post.likesCount || 0}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="text-gray-300 hover:text-red-600 p-0" onClick={() => deletePost.mutate({ postId: post.id, studentId: post.studentId })}>
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}