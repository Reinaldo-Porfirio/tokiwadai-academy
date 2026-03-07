import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Users, LogOut, Trash2, Heart, Search, UserX, UserCheck, Plus, MessageSquare, Edit2, Save } from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const [admin, setAdmin] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("students");
  const [searchTerm, setSearchTerm] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editingLikes, setEditingLikes] = useState<string>("");
  const [editingContent, setEditingContent] = useState<string>("");

  // Queries
  const studentsQuery = trpc.student.getAll.useQuery({ search: searchTerm });
  const postsQuery = trpc.mirror.getFeed.useQuery(
    { limit: 50, offset: 0, studentId: admin?.id || 0 },
    { refetchInterval: 5000, enabled: !!admin?.id }
  );

  // Mutations
  const deletePostMutation = trpc.mirror.deletePost.useMutation({
    onSuccess: () => {
      toast.success("Post deletado!");
      postsQuery.refetch();
    },
    onError: (err) => toast.error("Erro ao deletar: " + err.message),
  });

  const deleteStudent = trpc.student.delete.useMutation({
    onSuccess: () => {
      toast.success("Estudante deletado!");
      studentsQuery.refetch();
    },
    onError: (err) => toast.error("Erro ao deletar: " + err.message),
  });

  const toggleSuspension = trpc.student.update.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado!");
      studentsQuery.refetch();
    },
    onError: (err) => toast.error("Erro ao atualizar: " + err.message),
  });

  const updateLikesMutation = trpc.mirrorAdmin.updatePostLikes.useMutation({
    onSuccess: () => {
      toast.success("Likes atualizados!");
      setEditingPostId(null);
      postsQuery.refetch();
    },
    onError: (err) => toast.error("Erro: " + err.message),
  });

  const updateContentMutation = trpc.mirrorAdmin.updatePostContent.useMutation({
    onSuccess: () => {
      toast.success("Conteúdo atualizado!");
      setEditingPostId(null);
      postsQuery.refetch();
    },
    onError: (err) => toast.error("Erro: " + err.message),
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

  // Atualizar posts quando a query retorna dados
  useEffect(() => {
    if (Array.isArray(postsQuery.data)) {
      setPosts(postsQuery.data);
    } else if (postsQuery.data?.posts) {
      setPosts(postsQuery.data.posts);
    }
  }, [postsQuery.data]);

  if (!admin) return null;

  const handleUpdateLikes = (postId: number) => {
    const likesCount = parseInt(editingLikes, 10);
    if (isNaN(likesCount) || likesCount < 0) {
      toast.error("Digite um número válido");
      return;
    }

    updateLikesMutation.mutate({
      postId,
      likesCount,
      adminId: admin.id,
    });
  };

  const handleUpdateContent = (postId: number) => {
    if (!editingContent.trim()) {
      toast.error("Conteúdo não pode estar vazio");
      return;
    }

    if (editingContent.length > 500) {
      toast.error("Conteúdo muito longo! Máximo 500 caracteres");
      return;
    }

    updateContentMutation.mutate({
      adminId: admin.id,
      postId,
      content: editingContent,
    });
  };

  const handleDeletePost = (postId: number, studentId: number) => {
    if (confirm("Tem certeza que deseja deletar este post?")) {
      deletePostMutation.mutate({ postId, studentId });
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <aside className="w-64 bg-red-900 text-white p-6 shadow-xl">
        <div className="mb-10 p-2 text-center">
          <h1 className="text-2xl font-bold tracking-tighter">TOKIWADAI</h1>
          <p className="text-red-300 text-[10px] uppercase tracking-widest">Admin Control</p>
        </div>
        <nav className="space-y-1">
          <button
            onClick={() => setActiveTab("students")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              activeTab === "students" ? "bg-red-800" : "hover:bg-red-800/50"
            }`}
          >
            <Users size={18} /> <span className="text-sm font-medium">Estudantes</span>
          </button>
          <button
            onClick={() => setActiveTab("mirror")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              activeTab === "mirror" ? "bg-red-800" : "hover:bg-red-800/50"
            }`}
          >
            <MessageSquare size={18} /> <span className="text-sm font-medium">Mirror Control</span>
          </button>
          <button
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-700 transition mt-10 text-red-200"
          >
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
                <p className="text-[10px] text-gray-400 font-black uppercase">Total de Posts</p>
                <p className="text-2xl font-black text-red-700">{posts.length}</p>
              </div>
            </div>
          </header>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {/* ABA DE ESTUDANTES */}
            <TabsContent value="students">
              <Card className="border-none shadow-sm overflow-hidden rounded-2xl">
                <div className="p-4 bg-white border-b flex justify-between items-center">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    <Input
                      placeholder="Buscar aluno..."
                      className="pl-9 h-9 bg-gray-50 border-none"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
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
                            <span
                              className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${
                                student.isSuspended ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                              }`}
                            >
                              {student.isSuspended ? "Suspenso" : "Ativo"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-gray-400 hover:text-red-700"
                              onClick={() =>
                                toggleSuspension.mutate({
                                  id: student.id,
                                  isSuspended: !student.isSuspended,
                                })
                              }
                            >
                              {student.isSuspended ? <UserCheck size={16} /> : <UserX size={16} />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-gray-300 hover:text-red-600"
                              onClick={() =>
                                confirm("Apagar permanentemente?") && deleteStudent.mutate({ id: student.id })
                              }
                            >
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

            {/* ABA DE MIRROR CONTROL */}
            <TabsContent value="mirror">
              <div className="space-y-4">
                {postsQuery.isLoading ? (
                  <p className="text-center text-gray-500 py-8">Carregando postagens...</p>
                ) : posts.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Nenhuma postagem encontrada</p>
                ) : (
                  posts.map((post: any) => (
                    <Card key={post.id} className="border-none shadow-sm rounded-xl overflow-hidden">
                      <CardContent className="p-6 space-y-4">
                        {/* Cabeçalho do Post */}
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-700 flex items-center justify-center text-white font-bold text-sm">
                              {post.student?.fullName?.[0] || "?"}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{post.student?.fullName || "Anônimo"}</p>
                              <p className="text-xs text-gray-500">{post.student?.studentId || "N/A"}</p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-400">
                            {new Date(post.createdAt).toLocaleDateString("pt-BR")}
                          </p>
                        </div>

                        {/* Conteúdo do Post */}
                        {editingPostId === post.id ? (
                          <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                            <div>
                              <label className="text-xs font-semibold text-gray-600">Editar Conteúdo:</label>
                              <textarea
                                value={editingContent}
                                onChange={(e) => setEditingContent(e.target.value)}
                                className="w-full p-2 border rounded-md text-sm min-h-[80px] resize-none mt-1"
                                maxLength={500}
                              />
                              <p className="text-xs text-gray-500 mt-1">{editingContent.length}/500 caracteres</p>
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-gray-600">Editar Likes:</label>
                              <Input
                                type="number"
                                value={editingLikes}
                                onChange={(e) => setEditingLikes(e.target.value)}
                                min="0"
                                className="mt-1"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleUpdateContent(post.id)}
                                disabled={updateContentMutation.isPending}
                                className="bg-blue-600 hover:bg-blue-700 flex-1 gap-2"
                              >
                                <Save size={14} />
                                Salvar Conteúdo
                              </Button>
                              <Button
                                onClick={() => handleUpdateLikes(post.id)}
                                disabled={updateLikesMutation.isPending}
                                className="bg-green-600 hover:bg-green-700 flex-1 gap-2"
                              >
                                <Heart size={14} />
                                Salvar Likes
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setEditingPostId(null);
                                  setEditingContent("");
                                  setEditingLikes("");
                                }}
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-gray-800 text-sm leading-relaxed">{post.content}</p>

                            {/* Imagem do Post */}
                            {post.imageUrl && (
                              <img
                                src={post.imageUrl}
                                alt="Post"
                                className="w-full rounded-md object-cover max-h-48"
                              />
                            )}

                            {/* Estatísticas */}
                            <div className="grid grid-cols-3 gap-4 bg-gray-50 p-3 rounded-lg">
                              <div className="text-center">
                                <p className="text-2xl font-bold text-red-600">{post.likesCount || 0}</p>
                                <p className="text-xs text-gray-600">Likes</p>
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-bold text-blue-600">{post.commentsCount || 0}</p>
                                <p className="text-xs text-gray-600">Comentários</p>
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-bold text-green-600">ID: {post.id}</p>
                                <p className="text-xs text-gray-600">Post ID</p>
                              </div>
                            </div>

                            {/* Ações */}
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 gap-2"
                                onClick={() => {
                                  setEditingPostId(post.id);
                                  setEditingContent(post.content);
                                  setEditingLikes(String(post.likesCount || 0));
                                }}
                              >
                                <Edit2 size={14} />
                                Editar
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="flex-1 gap-2"
                                onClick={() => handleDeletePost(post.id, post.studentId)}
                              >
                                <Trash2 size={14} />
                                Deletar
                              </Button>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
