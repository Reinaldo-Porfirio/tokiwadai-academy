import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Edit2, Trash2, Users } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function AdminMirrorPage() {
  const [, navigate] = useLocation();
  const [admin, setAdmin] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("posts");

  useEffect(() => {
    const storedAdmin = localStorage.getItem("tokiwadai-admin");
    if (!storedAdmin) {
      navigate("/login");
      return;
    }
    setAdmin(JSON.parse(storedAdmin));
  }, [navigate]);

  if (!admin) return null;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">⚙️ Administração do Mirror</h1>
        <p className="text-gray-600">Gerencie postagens e perfis de estudantes</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="posts">Postagens</TabsTrigger>
          <TabsTrigger value="followers">Seguidores</TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          <PostsManagement adminId={admin.id} />
        </TabsContent>

        <TabsContent value="followers">
          <FollowersManagement adminId={admin.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PostsManagement({ adminId }: { adminId: number }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editingLikes, setEditingLikes] = useState<string>("");

  const postsQuery = trpc.mirrorAdmin.getAllPostsForAdmin.useQuery(
    { adminId, limit: 50, offset: 0 },
    { refetchInterval: 5000 }
  );

  const updateLikesMutation = trpc.mirrorAdmin.updatePostLikes.useMutation({
    onSuccess: () => {
      toast.success("Likes atualizados!");
      setEditingPostId(null);
      postsQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const deletePostMutation = trpc.mirrorAdmin.deletePostAsAdmin.useMutation({
    onSuccess: () => {
      toast.success("Postagem deletada!");
      postsQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  useEffect(() => {
    // getAllPostsForAdmin retorna um array diretamente
    if (Array.isArray(postsQuery.data)) {
      setPosts(postsQuery.data);
    } else if (postsQuery.data) {
      setPosts([postsQuery.data]);
    }
  }, [postsQuery.data]);

  const handleUpdateLikes = (postId: number) => {
    const likesCount = parseInt(editingLikes, 10);
    if (isNaN(likesCount) || likesCount < 0) {
      toast.error("Digite um número válido de likes");
      return;
    }

    if (likesCount > 999999) {
      toast.error("Número de likes muito alto");
      return;
    }

    updateLikesMutation.mutate({
      postId,
      likesCount,
      adminId,
    });
  };

  const handleDeletePost = (postId: number) => {
    if (confirm("Tem certeza que deseja deletar esta postagem?")) {
      deletePostMutation.mutate({
        postId,
        adminId,
        reason: "Deletado pelo administrador",
      });
    }
  };

  return (
    <div className="space-y-4 mt-6">
      {postsQuery.isLoading ? (
        <p className="text-center text-gray-500 py-8">Carregando postagens...</p>
      ) : posts.length === 0 ? (
        <p className="text-center text-gray-500 py-8">Nenhuma postagem encontrada</p>
      ) : (
        posts.map((post) => (
          <Card key={post.id} className="border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-lg">{post.student?.fullName}</p>
                  <p className="text-sm text-gray-600">{post.student?.studentId}</p>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(post.createdAt).toLocaleDateString("pt-BR")}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-gray-800">{post.content}</p>

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

              {editingPostId === post.id ? (
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Novo número de likes"
                    value={editingLikes}
                    onChange={(e) => setEditingLikes(e.target.value)}
                    min="0"
                  />
                  <Button
                    onClick={() => handleUpdateLikes(post.id)}
                    disabled={updateLikesMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Salvar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingPostId(null)}
                  >
                    Cancelar
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingPostId(post.id);
                      setEditingLikes(String(post.likesCount || 0));
                    }}
                    className="gap-2"
                  >
                    <Edit2 size={16} />
                    Editar Likes
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeletePost(post.id)}
                    disabled={deletePostMutation.isPending}
                    className="gap-2"
                  >
                    <Trash2 size={16} />
                    Deletar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

function FollowersManagement({ adminId }: { adminId: number }) {
  const [students, setStudents] = useState<any[]>([]);
  const [editingStudentId, setEditingStudentId] = useState<number | null>(null);
  const [editingFollowers, setEditingFollowers] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  const studentsQuery = trpc.mirrorAdmin.getAllStudentsForAdmin.useQuery(
    { adminId, limit: 100, offset: 0 },
    { refetchInterval: 5000 }
  );

  const updateFollowersMutation = trpc.mirrorAdmin.updateStudentFollowers.useMutation({
    onSuccess: () => {
      toast.success("Seguidores atualizados!");
      setEditingStudentId(null);
      studentsQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  useEffect(() => {
    if (studentsQuery.data?.students) {
      setStudents(studentsQuery.data.students);
    }
  }, [studentsQuery.data]);

  const handleUpdateFollowers = (studentId: number) => {
    const followersCount = parseInt(editingFollowers, 10);
    if (isNaN(followersCount) || followersCount < 0) {
      toast.error("Digite um número válido");
      return;
    }

    updateFollowersMutation.mutate({
      studentId,
      followersCount,
      adminId,
    });
  };

  const filteredStudents = students.filter(
    (student) =>
      student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 mt-6">
      <div className="mb-4">
        <Input
          placeholder="Buscar estudante por nome ou ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {studentsQuery.isLoading ? (
        <p className="text-center text-gray-500 py-8">Carregando estudantes...</p>
      ) : filteredStudents.length === 0 ? (
        <p className="text-center text-gray-500 py-8">Nenhum estudante encontrado</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredStudents.map((student) => (
            <Card key={student.id} className="border-l-4 border-l-purple-500">
              <CardContent className="pt-6 space-y-4">
                <div>
                  <p className="font-bold text-lg">{student.fullName}</p>
                  <p className="text-sm text-gray-600">{student.studentId}</p>
                  <p className="text-xs text-gray-500">Série {student.grade} - Distrito {student.district}</p>
                </div>

                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Seguidores</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {student.followersCount || 0}
                      </p>
                    </div>
                    <Users className="text-purple-400" size={32} />
                  </div>
                </div>

                {editingStudentId === student.id ? (
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Novo número de seguidores"
                      value={editingFollowers}
                      onChange={(e) => setEditingFollowers(e.target.value)}
                      min="0"
                    />
                    <Button
                      onClick={() => handleUpdateFollowers(student.id)}
                      disabled={updateFollowersMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Salvar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setEditingStudentId(null)}
                    >
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => {
                      setEditingStudentId(student.id);
                      setEditingFollowers(String(student.followersCount || 0));
                    }}
                  >
                    <Edit2 size={16} />
                    Editar Seguidores
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
