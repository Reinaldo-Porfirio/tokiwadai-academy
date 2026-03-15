import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send, Plus, Loader2, Users, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Group {
  id: number;
  name: string;
  description?: string | null;
  createdByStudentId: number;
  createdAt: Date | string;
}

interface GroupMessage {
  id: number;
  groupId: number;
  senderId: number;
  content: string;
  createdAt: Date | string;
  sender?: {
    id: number;
    fullName: string;
    studentId: string;
  } | null;
}

export default function GroupMessagesPage() {
  const [user, setUser] = useState<any>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  // Queries
  const groupsQuery = trpc.groups.getStudentGroups.useQuery(
    { studentId: user?.id || 0 },
    { refetchInterval: 3000, enabled: !!user?.id }
  );

  const groupDetailsQuery = trpc.groups.getGroup.useQuery(
    { groupId: selectedGroupId || 0 },
    { refetchInterval: 2000, enabled: !!selectedGroupId }
  );

  const groupMessagesQuery = trpc.groups.getGroupMessages.useQuery(
    { groupId: selectedGroupId || 0, limit: 50, offset: 0 },
    { refetchInterval: 2000, enabled: !!selectedGroupId }
  );

  // Mutations
  const createGroupMutation = trpc.groups.createGroup.useMutation({
    onSuccess: () => {
      setNewGroupName("");
      setNewGroupDescription("");
      setShowCreateGroup(false);
      setIsCreatingGroup(false);
      toast.success("Grupo criado com sucesso!");
      groupsQuery.refetch();
    },
    onError: (err) => {
      setIsCreatingGroup(false);
      toast.error("Erro ao criar grupo: " + err.message);
    },
  });

  const sendMessageMutation = trpc.groups.sendGroupMessage.useMutation({
    onSuccess: () => {
      setMessageText("");
      setIsSending(false);
      toast.success("Mensagem enviada!");
      groupMessagesQuery.refetch();
    },
    onError: (err) => {
      setIsSending(false);
      toast.error("Erro ao enviar mensagem: " + err.message);
    },
  });

  const addMemberMutation = trpc.groups.addMember.useMutation({
    onSuccess: () => {
      toast.success("Membro adicionado!");
      groupDetailsQuery.refetch();
    },
    onError: (err) => {
      toast.error("Erro ao adicionar membro: " + err.message);
    },
  });

  const deleteGroupMutation = trpc.groups.deleteGroup.useMutation({
    onSuccess: () => {
      setSelectedGroupId(null);
      toast.success("Grupo deletado!");
      groupsQuery.refetch();
    },
    onError: (err) => {
      toast.error("Erro ao deletar grupo: " + err.message);
    },
  });

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("tokiwadai-user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Update groups when query returns data
  useEffect(() => {
    if (groupsQuery.data) {
      setGroups(groupsQuery.data);
    }
  }, [groupsQuery.data]);

  // Update messages when query returns data
  useEffect(() => {
    if (groupMessagesQuery.data) {
      setMessages(groupMessagesQuery.data);
    }
  }, [groupMessagesQuery.data]);

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) {
      toast.error("Digite um nome para o grupo!");
      return;
    }

    setIsCreatingGroup(true);
    createGroupMutation.mutate({
      name: newGroupName,
      description: newGroupDescription || undefined,
      createdByStudentId: user.id,
      memberIds: [],
    });
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) {
      toast.error("Escreva uma mensagem!");
      return;
    }

    if (!selectedGroupId) {
      toast.error("Selecione um grupo!");
      return;
    }

    setIsSending(true);
    sendMessageMutation.mutate({
      groupId: selectedGroupId,
      senderId: user.id,
      content: messageText,
    });
  };

  const handleDeleteGroup = () => {
    if (!selectedGroupId) return;

    const group = groups.find((g) => g.id === selectedGroupId);
    if (group?.createdByStudentId !== user.id) {
      toast.error("Apenas o criador pode deletar o grupo!");
      return;
    }

    if (confirm("Tem certeza que deseja deletar este grupo?")) {
      deleteGroupMutation.mutate({
        groupId: selectedGroupId,
        deletedByStudentId: user.id,
      });
    }
  };

  if (!user) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  const selectedGroup = groups.find((g) => g.id === selectedGroupId);
  const isGroupCreator = selectedGroup?.createdByStudentId === user.id;

  return (
    <div className="flex h-[600px] gap-4">
      {/* Groups List */}
      <div className="w-80 border border-gray-200 rounded-lg overflow-hidden flex flex-col bg-white">
        <div className="p-4 border-b border-gray-200 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Grupos</h3>
            <Button
              onClick={() => setShowCreateGroup(!showCreateGroup)}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus size={16} />
            </Button>
          </div>
        </div>

        {/* Create Group Form */}
        {showCreateGroup && (
          <div className="p-3 border-b border-gray-200 space-y-2 bg-blue-50">
            <Input
              placeholder="Nome do grupo"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="text-sm"
            />
            <Input
              placeholder="Descrição (opcional)"
              value={newGroupDescription}
              onChange={(e) => setNewGroupDescription(e.target.value)}
              className="text-sm"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleCreateGroup}
                disabled={isCreatingGroup}
                size="sm"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isCreatingGroup ? (
                  <>
                    <Loader2 size={14} className="mr-1 animate-spin" />
                    Criando...
                  </>
                ) : (
                  "Criar"
                )}
              </Button>
              <Button
                onClick={() => setShowCreateGroup(false)}
                size="sm"
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Groups List */}
        <div className="flex-1 overflow-y-auto">
          {groupsQuery.isLoading ? (
            <div className="text-center py-8 text-gray-500">
              <Loader2 className="inline-block animate-spin mr-2" size={20} />
              Carregando grupos...
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              Nenhum grupo. Crie um novo!
            </div>
          ) : (
            groups.map((group) => (
              <button
                key={group.id}
                onClick={() => setSelectedGroupId(group.id)}
                className={`w-full text-left p-3 border-b border-gray-100 hover:bg-gray-50 transition ${
                  selectedGroupId === group.id ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{group.name}</p>
                    {group.description && (
                      <p className="text-xs text-gray-500 truncate">{group.description}</p>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden flex flex-col bg-white">
        {selectedGroupId ? (
          <>
            {/* Group Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100 flex justify-between items-start">
              <div>
                <p className="font-semibold text-gray-900">{selectedGroup?.name}</p>
                {selectedGroup?.description && (
                  <p className="text-xs text-gray-500">{selectedGroup.description}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    /* TODO: Show members modal */
                  }}
                  size="sm"
                  variant="outline"
                  className="text-xs"
                >
                  <Users size={14} className="mr-1" />
                  Membros
                </Button>
                {isGroupCreator && (
                  <Button
                    onClick={handleDeleteGroup}
                    size="sm"
                    variant="destructive"
                    className="text-xs"
                  >
                    <Trash2 size={14} />
                  </Button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {groupMessagesQuery.isLoading ? (
                <div className="text-center py-8 text-gray-500">
                  <Loader2 className="inline-block animate-spin mr-2" size={20} />
                  Carregando mensagens...
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  Nenhuma mensagem ainda. Comece a conversa!
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderId === user.id ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.senderId === user.id
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-gray-100 text-gray-900 rounded-bl-none"
                      }`}
                    >
                      {msg.senderId !== user.id && (
                        <p className="text-xs font-medium mb-1 opacity-75">
                          {msg.sender?.fullName || "Desconhecido"}
                        </p>
                      )}
                      <p className="text-sm break-words">{msg.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.senderId === user.id ? "text-blue-100" : "text-gray-500"
                        }`}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-2">
              <Input
                placeholder="Digite uma mensagem..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={isSending || !messageText.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSending ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <Users size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Selecione um grupo para começar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
