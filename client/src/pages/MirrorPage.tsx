import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, MessageSquare, Send, Hash } from "lucide-react";
import { useLocation } from "wouter";

export default function MirrorPage() {
  const [, navigate] = useLocation();
  const [hashtag, setHashtag] = useState("");
  const [newPost, setNewPost] = useState("");
  const [user, setUser] = useState<any>(null);

  // 1. Recupera o usuário logado para enviar o studentId nas ações
  useEffect(() => {
    const storedUser = localStorage.getItem("tokiwadai-user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  // 2. Query ajustada: Usamos getPost com undefined para forçar a listagem total
  const postsQuery = trpc.mirror.getPost.useQuery({ postId: undefined as any });

  // 3. Mutation para criar posts
  const createPostMutation = trpc.mirror.createPost.useMutation({
    onSuccess: () => {
      setNewPost("");
      postsQuery.refetch();
    },
    onError: (err) => alert("Erro ao postar: " + err.message)
  });

  const handleCreatePost = () => {
    if (!newPost.trim() || !user?.id) return;
    createPostMutation.mutate({ 
      studentId: Number(user.id), 
      content: newPost 
    });
  };

  if (!user) return null;

  // Garante que posts seja sempre um array para o .map não quebrar
  const posts = Array.isArray(postsQuery.data) ? postsQuery.data : [];

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6 bg-gray-50 min-h-screen">
      {/* Barra de Hashtag (Visual apenas por enquanto) */}
      <div className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm border border-red-100">
        <Hash className="text-red-700" size={20} />
        <Input 
          placeholder="Busca por hashtag desabilitada no momento..." 
          value={hashtag}
          onChange={(e) => setHashtag(e.target.value)}
          className="border-none focus-visible:ring-0"
          disabled
        />
      </div>

      {/* Card de Criação de Post */}
      <Card className="border-red-200 shadow-md">
        <CardContent className="pt-4">
          <textarea 
            className="w-full min-h-[100px] p-3 rounded-md border focus:outline-red-500 resize-none text-sm"
            placeholder={`O que está pensando, ${user.fullName?.split(' ')[0] || 'Estudante'}?`}
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
          />
          <div className="flex justify-end mt-2">
            <Button 
              onClick={handleCreatePost}
              disabled={!newPost.trim() || createPostMutation.isPending}
              className="bg-red-700 hover:bg-red-800 text-white font-bold"
            >
              {createPostMutation.isPending ? "Postando..." : "Postar no Mirror"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Listagem de Posts (Feed) */}
      <div className="space-y-4">
        {postsQuery.isLoading ? (
          <p className="text-center text-gray-500 py-10 italic">Conectando à rede da Cidade Acadêmica...</p>
        ) : posts.length > 0 ? (
          posts.map((post: any) => (
            <PostCard 
              key={post.id} 
              post={post} 
              refetch={postsQuery.refetch} 
              currentUserId={user.id} 
            />
          ))
        ) : (
          <p className="text-center text-gray-500 py-10 italic">O feed está vazio. Seja o primeiro a postar!</p>
        )}
      </div>
    </div>
  );
}

// COMPONENTE DO CARD INDIVIDUAL
function PostCard({ post, refetch, currentUserId }: { post: any, refetch: () => void, currentUserId: number }) {
  const [comment, setComment] = useState("");
  const [showComments, setShowComments] = useState(false);

  // Mutations para Like e Comentário
  const likeMutation = trpc.mirror.likePost.useMutation({ onSuccess: refetch });
  const commentMutation = trpc.mirror.addComment.useMutation({
    onSuccess: () => { setComment(""); refetch(); }
  });

  // Mapeamento de dados: Seu backend usa 'student' para o autor
  const student = post.student;

  return (
    <Card className="hover:border-red-300 transition-all shadow-sm bg-white">
      <CardHeader className="flex flex-row items-center gap-3 pb-2">
        <div className="w-10 h-10 rounded-full bg-red-700 flex items-center justify-center font-bold text-white shadow-inner">
          {student?.fullName?.[0] || "?"}
        </div>
        <div>
          <p className="font-bold text-sm text-gray-900">{student?.fullName || "Usuário"}</p>
          <p className="text-[10px] text-gray-400 font-mono">
             ID: {student?.studentId || "N/A"} • Distrito {student?.district || "?"}
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
        
        {/* Barra de Ações */}
        <div className="flex items-center gap-6 border-t pt-3 text-gray-500">
          <button 
            onClick={() => likeMutation.mutate({ postId: post.id, studentId: currentUserId })}
            className={`flex items-center gap-1.5 hover:text-red-600 transition ${post.isLiked ? 'text-red-600' : ''}`}
          >
            <Heart size={18} fill={post.isLiked ? "currentColor" : "none"} />
            <span className="text-xs font-bold">{post.likesCount || 0}</span>
          </button>
          
          <button 
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 hover:text-blue-600 transition"
          >
            <MessageSquare size={18} />
            <span className="text-xs font-bold">{post.comments?.length || 0}</span>
          </button>
        </div>

        {/* Área de Comentários */}
        {showComments && (
          <div className="space-y-3 mt-4 bg-gray-50 p-3 rounded-md border border-gray-100">
            {post.comments?.map((c: any) => (
              <div key={c.id} className="text-xs border-b border-gray-200 pb-2 last:border-0">
                <span className="font-bold text-red-800">{c.student?.fullName || "Anônimo"}: </span>
                <span className="text-gray-700">{c.content}</span>
              </div>
            ))}
            <div className="flex gap-2 mt-2">
              <Input 
                placeholder="Escreva um comentário..." 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="h-8 text-[11px] bg-white border-red-100 focus:border-red-500"
              />
              <Button 
                size="sm" 
                className="h-8 px-3 bg-red-700 hover:bg-red-800 text-white"
                disabled={!comment.trim() || commentMutation.isPending}
                onClick={() => commentMutation.mutate({ 
                  postId: post.id, 
                  studentId: currentUserId, 
                  content: comment 
                })}
              >
                <Send size={14} />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}