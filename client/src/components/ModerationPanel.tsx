import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Post {
  id: number;
  studentId: number;
  content: string;
  imageUrl: string | null;
  likesCount: number | null;
  commentsCount: number;
  createdAt: Date | string;
  student?: {
    id: number;
    fullName: string;
    studentId: string;
  } | null;
}

interface Comment {
  id: number;
  postId: number;
  studentId: number;
  content: string;
  createdAt: Date | string;
  student?: {
    id: number;
    fullName: string;
    studentId: string;
  } | null;
}

export default function ModerationPanel({ adminId }: { adminId: number }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [postComments, setPostComments] = useState<Comment[]>([]);

  // Queries
  const feedQuery = trpc.mirror.getFeed.useQuery(
    { limit: 100, offset: 0 },
    { refetchInterval: 5000 }
  );

  // Mutations
  const deletePostMutation = trpc.mirror.deletePost.useMutation({
    onSuccess: () => {
      toast.success("Post deletado com sucesso!");
      feedQuery.refetch();
    },
    onError: (err) => {
      toast.error("Erro ao deletar post: " + err.message);
    },
  });

  const deleteCommentMutation = trpc.mirror.deleteComment.useMutation({
    onSuccess: () => {
      toast.success("Comentário deletado com sucesso!");
      feedQuery.refetch();
    },
    onError: (err) => {
      toast.error("Erro ao deletar comentário: " + err.message);
    },
  });

  // Load posts
  useEffect(() => {
    if (Array.isArray(feedQuery.data)) {
      setPosts(feedQuery.data);
    }
  }, [feedQuery.data]);

  // Load comments for selected post
  useEffect(() => {
    if (selectedPostId) {
      const post = posts.find((p) => p.id === selectedPostId);
      if (post && Array.isArray((post as any).comments)) {
        setPostComments((post as any).comments);
      } else {
        setPostComments([]);
      }
    }
  }, [selectedPostId, posts]);

  const handleDeletePost = (postId: number) => {
    if (confirm("Tem certeza que deseja deletar este post?")) {
      deletePostMutation.mutate({ postId, studentId: adminId });
    }
  };

  const handleDeleteComment = (commentId: number, postId: number) => {
    if (confirm("Tem certeza que deseja deletar este comentário?")) {
      deleteCommentMutation.mutate({ commentId, studentId: adminId });
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="posts">Posts ({posts.length})</TabsTrigger>
          <TabsTrigger value="comments">Comentários ({postComments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          {feedQuery.isLoading ? (
            <div className="text-center py-8 text-gray-500">
              <Loader2 className="inline-block animate-spin mr-2" size={20} />
              Carregando posts...
            </div>
          ) : posts.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                Nenhum post para moderar
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="border-gray-200">
                <CardContent className="pt-6 space-y-4">
                  {/* Post Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                        {post.student?.fullName?.[0] || "?"}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {post.student?.fullName || "Anônimo"}
                        </p>
                        <p className="text-xs text-gray-500">{post.student?.studentId}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">
                        {new Date(post.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>

                  {/* Post Content */}
                  <p className="text-gray-800 text-sm leading-relaxed">{post.content}</p>

                  {/* Post Image */}
                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt="Post"
                      className="w-full rounded-lg object-cover max-h-64"
                    />
                  )}

                  {/* Post Stats */}
                  <div className="flex gap-4 text-xs text-gray-500 py-2 border-t border-b border-gray-100">
                    <span>{post.likesCount} likes</span>
                    <span>{post.commentsCount} comentários</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPostId(post.id)}
                      className="flex-1"
                    >
                      Ver Comentários ({post.commentsCount})
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
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="comments" className="space-y-4">
          {selectedPostId === null ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                <AlertCircle className="inline-block mr-2" size={20} />
                Selecione um post para ver seus comentários
              </CardContent>
            </Card>
          ) : postComments.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                <CheckCircle className="inline-block mr-2" size={20} />
                Este post não tem comentários
              </CardContent>
            </Card>
          ) : (
            postComments.map((comment) => (
              <Card key={comment.id} className="border-gray-200">
                <CardContent className="pt-6 space-y-4">
                  {/* Comment Header */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-xs">
                        {comment.student?.fullName?.[0] || "?"}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {comment.student?.fullName || "Anônimo"}
                        </p>
                        <p className="text-xs text-gray-500">{comment.student?.studentId}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">
                      {new Date(comment.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>

                  {/* Comment Content */}
                  <p className="text-gray-800 text-sm leading-relaxed">{comment.content}</p>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteComment(comment.id, selectedPostId)}
                      disabled={deleteCommentMutation.isPending}
                      className="gap-2"
                    >
                      <Trash2 size={16} />
                      Deletar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
