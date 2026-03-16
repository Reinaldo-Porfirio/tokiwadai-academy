import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Heart, MessageCircle, Users } from "lucide-react";

interface PostStats {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  averageLikesPerPost: number;
  averageCommentsPerPost: number;
  mostLikedPost?: {
    id: number;
    content: string;
    likesCount: number;
    student?: {
      fullName: string;
      studentId: string;
    };
  };
  recentPosts: Array<{
    id: number;
    content: string;
    likesCount: number;
    commentsCount: number;
    createdAt: Date | string;
    student?: {
      fullName: string;
      studentId: string;
    };
  }>;
}

export default function AdminMirrorStatsPanel() {
  const [stats, setStats] = useState<PostStats | null>(null);

  // Get mirror stats
  const statsQuery = trpc.mirror.getStats.useQuery(undefined, {
    refetchInterval: 10000,
  });

  // Load stats
  useEffect(() => {
    if (statsQuery.data) {
      setStats(statsQuery.data as PostStats);
    }
  }, [statsQuery.data]);

  if (statsQuery.isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-gray-500">
          <Loader2 className="inline-block animate-spin mr-2" size={20} />
          Carregando estatísticas...
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-gray-500">
          Nenhuma estatística disponível
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalPosts}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Heart size={16} className="text-red-500" />
              Total de Likes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalLikes}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <MessageCircle size={16} className="text-blue-500" />
              Total de Comentários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalComments}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Engajamento Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {(stats.averageLikesPerPost + stats.averageCommentsPerPost).toFixed(1)}
            </p>
            <p className="text-xs text-gray-500 mt-1">por post</p>
          </CardContent>
        </Card>
      </div>

      {/* Averages */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Médias por Post</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Média de Likes</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.averageLikesPerPost.toFixed(2)}
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Média de Comentários</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.averageCommentsPerPost.toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Most Liked Post */}
      {stats.mostLikedPost && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart size={20} className="text-red-500" />
              Post Mais Curtido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  {stats.mostLikedPost.student?.fullName?.[0] || "?"}
                </div>
                <div>
                  <p className="font-semibold">
                    {stats.mostLikedPost.student?.fullName || "Anônimo"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {stats.mostLikedPost.student?.studentId}
                  </p>
                </div>
              </div>
              <p className="text-gray-800 text-sm mb-3">{stats.mostLikedPost.content}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-red-600 font-semibold flex items-center gap-1">
                  <Heart size={16} />
                  {stats.mostLikedPost.likesCount} likes
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Posts */}
      {stats.recentPosts && stats.recentPosts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Posts Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentPosts.slice(0, 5).map((post) => (
                <div key={post.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                      {post.student?.fullName?.[0] || "?"}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">
                        {post.student?.fullName || "Anônimo"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-800 text-sm mb-3 line-clamp-2">{post.content}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <Heart size={14} className="text-red-500" />
                      {post.likesCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle size={14} className="text-blue-500" />
                      {post.commentsCount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
