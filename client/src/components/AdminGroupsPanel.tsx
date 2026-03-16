import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Users, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface GroupMember {
  studentId: number;
  student?: {
    id: number;
    fullName: string;
    studentId: string;
  } | null;
}

interface GroupMessage {
  id: number;
  groupId: number;
  studentId: number;
  content: string;
  createdAt: Date | string;
  student?: {
    id: number;
    fullName: string;
    studentId: string;
  } | null;
}

interface Group {
  id: number;
  name: string;
  description: string | null;
  createdByStudentId: number;
  createdAt: Date | string;
  updatedAt?: Date | string;
  members?: GroupMember[];
  messages?: GroupMessage[];
}

export default function AdminGroupsPanel({ adminId }: { adminId: number }) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Get all groups (using dummy student ID 1)
  const groupsQuery = trpc.groups.getStudentGroups.useQuery(
    { studentId: 1 },
    { refetchInterval: 5000 }
  );

  // Delete group mutation
  const deleteGroupMutation = trpc.groups.deleteGroup.useMutation({
    onSuccess: () => {
      toast.success("Grupo deletado com sucesso!");
      groupsQuery.refetch();
      setSelectedGroupId(null);
      setSelectedGroup(null);
    },
    onError: (err) => {
      toast.error("Erro ao deletar grupo: " + err.message);
    },
  });

  // Load groups
  useEffect(() => {
    if (Array.isArray(groupsQuery.data)) {
      setGroups(
        groupsQuery.data.map((g: any) => ({
          id: g.id,
          name: g.name,
          description: g.description,
          createdByStudentId: g.createdByStudentId,
          createdAt: g.createdAt,
          updatedAt: g.updatedAt,
          members: g.members,
          messages: g.messages,
        }))
      );
    }
  }, [groupsQuery.data]);

  // Load selected group details
  useEffect(() => {
    if (selectedGroupId) {
      const group = groups.find((g) => g.id === selectedGroupId);
      setSelectedGroup(group || null);
    }
  }, [selectedGroupId, groups]);

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteGroup = (groupId: number) => {
    if (confirm("Tem certeza que deseja deletar este grupo?")) {
      deleteGroupMutation.mutate({ groupId, deletedByStudentId: adminId });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Groups List */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Grupos ({groups.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar grupo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredGroups.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhum grupo encontrado
                </p>
              ) : (
                filteredGroups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => setSelectedGroupId(group.id)}
                    className={`w-full text-left p-3 rounded-lg transition ${
                      selectedGroupId === group.id
                        ? "bg-blue-100 border-2 border-blue-500"
                        : "hover:bg-gray-100 border-2 border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        <Users size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{group.name}</p>
                        <p className="text-xs text-gray-500">
                          {group.members?.length || 0} membros
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Group Details */}
      <div className="lg:col-span-2">
        {selectedGroup === null ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              <Users className="inline-block mr-2 mb-4" size={32} />
              <p>Selecione um grupo para ver os detalhes</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Group Info */}
            <Card>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{selectedGroup.name}</CardTitle>
                  {selectedGroup.description && (
                    <p className="text-sm text-gray-600 mt-2">{selectedGroup.description}</p>
                  )}
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteGroup(selectedGroup.id)}
                  disabled={deleteGroupMutation.isPending}
                  className="gap-2"
                >
                  <Trash2 size={16} />
                  Deletar
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Membros</p>
                    <p className="text-2xl font-bold">{selectedGroup.members?.length || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Mensagens</p>
                    <p className="text-2xl font-bold">{selectedGroup.messages?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Members */}
            {selectedGroup.members && selectedGroup.members.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Membros</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedGroup.members.map((member) => (
                      <div
                        key={member.studentId}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100"
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                          {member.student?.fullName?.[0] || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">
                            {member.student?.fullName || "Anônimo"}
                          </p>
                          <p className="text-xs text-gray-500">{member.student?.studentId}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Messages */}
            {selectedGroup.messages && selectedGroup.messages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Últimas Mensagens</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {selectedGroup.messages.slice(-10).map((msg) => (
                      <div key={msg.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-sm">
                            {msg.student?.fullName || "Anônimo"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(msg.createdAt).toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <p className="text-sm text-gray-700">{msg.content}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
