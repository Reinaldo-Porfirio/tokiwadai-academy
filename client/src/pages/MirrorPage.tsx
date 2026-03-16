import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle, Trash2, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Post {
  id: number;
  studentId: number;
  content: string;
  imageUrl: string | null;
  likesCount: number | null;
  commentsCount: number;
  createdAt: Date | string;
  updatedAt?: Date | string;
  student?: {
    id: number;
    fullName: string;
    studentId: string;
    profilePicture?: string | null;
  } | null;
  isLiked?: boolean;
  comments?: any[];
  likes?: any[];
}

export default function MirrorPage() {
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postContent, setPostContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [expandedComments, setExpandedComments] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());

  // Queries
  const feedQuery = trpc.mirror.getFeed.useQuery(
    { limit: 50, offset: 0 },
    { refetchInterval: 3000, enabled: !!user?.id }
  );

  // Mutations
  const createPostMutation = trpc.mirror.createPost.useMutation({
    onSuccess: () => {
      setPostContent("");
      setSelectedImage(null);
      setIsPosting(false);
      toast.success("Post criado com sucesso!");
      feedQuery.refetch();
    },
    onError: (err) => {
      setIsPosting(false);
      toast.error("Erro ao criar post: " + err.message);
    },
  });

  const likePostMutation = trpc.mirror.likePost.useMutation({
    onMutate: (variables) => {
      // Optimistic update
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === variables.postId) {
            return {
              ...post,
              likesCount: (post.likesCount || 0) + 1,
              isLiked: true,
            };
          }
          return post;
        })
      );
      setLikedPosts((prev) => new Set(prev).add(variables.postId));
    },
    onSuccess: () => {
      // Refetch para sincronizar com backend
      setTimeout(() => feedQuery.refetch(), 500);
    },
    onError: (err) => {
      toast.error("Erro ao dar like: " + err.message);
      // Refetch para reverter otimistic update
      feedQuery.refetch();
    },
  });

  const unlikePostMutation = trpc.mirror.unlikePost.useMutation({
    onMutate: (variables) => {
      // Optimistic update
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === variables.postId) {
            return {
              ...post,
              likesCount: Math.max(0, (post.likesCount || 0) - 1),
              isLiked: false,
            };
          }
          return post;
        })
      );
      setLikedPosts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(variables.postId);
        return newSet;
      });
    },
    onSuccess: () => {
      // Refetch para sincronizar com backend
      setTimeout(() => feedQuery.refetch(), 500);
    },
    onError: (err) => {
      toast.error("Erro ao remover like: " + err.message);
      // Refetch para reverter otimistic update
      feedQuery.refetch();
    },
  });

  const addCommentMutation = trpc.mirror.addComment.useMutation({
    onSuccess: () => {
      setCommentText("");
      setExpandedComments(null);
      toast.success("Comentário adicionado!");
      feedQuery.refetch();
    },
    onError: (err) => {
      toast.error("Erro ao adicionar comentário: " + err.message);
    },
  });

  const deletePostMutation = trpc.mirror.deletePost.useMutation({
    onMutate: (variables) => {
      // Optimistic update - remove post immediately
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== variables.postId));
    },
    onSuccess: () => {
      toast.success("Post deletado!");
      feedQuery.refetch();
    },
    onError: (err) => {
      toast.error("Erro ao deletar post: " + err.message);
      feedQuery.refetch();
    },
  });

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("tokiwadai-user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Update posts when feed query returns data
  useEffect(() => {
    if (Array.isArray(feedQuery.data)) {
      setPosts(feedQuery.data);
      // Check which posts are liked by checking if user has liked them
      const likedPostIds = new Set<number>();
      feedQuery.data.forEach((post: Post) => {
        // Check if current user liked this post
        if (post.likes && Array.isArray(post.likes)) {
          const userLiked = post.likes.some((like: any) => like.studentId === user?.id);
          if (userLiked) {
            likedPostIds.add(post.id);
          }
        } else if (post.isLiked) {
          likedPostIds.add(post.id);
        }
      });
      setLikedPosts(likedPostIds);
    }
  }, [feedQuery.data, user?.id]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Imagem muito grande! Máximo 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = async () => {
    if (!postContent.trim()) {
      toast.error("Escreva algo para postar!");
      return;
    }

    if (postContent.length > 500) {
      toast.error("Post muito longo! Máximo 500 caracteres");
      return;
    }

    setIsPosting(true);
    createPostMutation.mutate({
      studentId: user.id,
      content: postContent,
      imageUrl: selectedImage || undefined,
    });
  };

  const handleLike = (postId: number, isLiked: boolean) => {
    if (!user?.id) {
      toast.error("Você precisa estar logado para dar like!");
      return;
    }
    if (isLiked) {
      unlikePostMutation.mutate({ postId, studentId: user.id });
    } else {
      likePostMutation.mutate({ postId, studentId: user.id });
    }
  };

  const handleAddComment = (postId: number) => {
    if (!commentText.trim()) {
      toast.error("Escreva um comentário!");
      return;
    }

    addCommentMutation.mutate({
      postId,
      studentId: user.id,
      content: commentText,
    });
  };

  const handleDeletePost = (postId: number, postStudentId: number) => {
    if (postStudentId !== user.id) {
      toast.error("Você só pode deletar seus próprios posts!");
      return;
    }

    if (confirm("Tem certeza que deseja deletar este post?")) {
      deletePostMutation.mutate({ postId, studentId: user.id });
    }
  };

  if (!user) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Create Post Card */}
      <Card className="border-blue-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
          <CardTitle className="text-lg">Criar Novo Post</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <textarea
            placeholder="O que você está pensando?"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            maxLength={500}
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-24"
          />

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition">
                  <ImageIcon size={18} />
                  <span className="text-sm">Adicionar Imagem</span>
                </div>
              </label>
              <span className="text-xs text-gray-500">
                {postContent.length}/500 caracteres
              </span>
            </div>
            <Button
              onClick={handleCreatePost}
              disabled={isPosting || !postContent.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isPosting ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Postando...
                </>
              ) : (
                "Postar"
              )}
            </Button>
          </div>

          {selectedImage && (
            <div className="relative">
              <img
                src={selectedImage}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
              >
                ✕
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feed */}
      <div className="space-y-4">
        {feedQuery.isLoading ? (
          <div className="text-center py-8 text-gray-500">
            <Loader2 className="inline-block animate-spin mr-2" size={20} />
            Carregando posts...
          </div>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              Nenhum post ainda. Seja o primeiro a postar!
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="border-gray-200 hover:shadow-md transition">
              <CardContent className="pt-6 space-y-4">
                {/* Post Header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
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
                    {post.studentId === user.id && (
                      <button
                        onClick={() => handleDeletePost(post.id, post.studentId)}
                        className="text-red-500 hover:text-red-700 text-xs mt-1"
                      >
                        Deletar
                      </button>
                    )}
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

                {/* Post Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleLike(post.id, likedPosts.has(post.id))}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition ${
                      likedPosts.has(post.id)
                        ? "bg-red-50 text-red-600"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                    }`}
                  >
                    <Heart
                      size={18}
                      fill={likedPosts.has(post.id) ? "currentColor" : "none"}
                    />
                    <span className="text-sm font-medium">
                      {likedPosts.has(post.id) ? "Gostei" : "Gostar"}
                    </span>
                  </button>
                  <button
                    onClick={() =>
                      setExpandedComments(expandedComments === post.id ? null : post.id)
                    }
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
                  >
                    <MessageCircle size={18} />
                    <span className="text-sm font-medium">Comentar</span>
                  </button>
                </div>

                {/* Comments Section */}
                {expandedComments === post.id && (
                  <div className="space-y-3 pt-3 border-t border-gray-100">
                    {/* Existing Comments */}
                    {post.comments && post.comments.length > 0 && (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {post.comments.map((comment: any) => (
                          <div key={comment.id} className="bg-gray-50 p-2 rounded-lg text-sm">
                            <p className="font-medium text-gray-900">
                              {comment.student?.fullName || "Anônimo"}
                            </p>
                            <p className="text-gray-700">{comment.content}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(comment.createdAt).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Comment */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Adicione um comentário..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleAddComment(post.id);
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <Button
                        onClick={() => handleAddComment(post.id)}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Enviar
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
