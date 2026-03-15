import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send, Search, Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface Conversation {
  otherStudentId: number;
  otherStudentName: string;
  otherStudentFullName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  isRead: boolean | null;
  createdAt: Date | string;
  sender?: {
    id: number;
    fullName: string;
    studentId: string;
  } | null;
}

export default function MessagesPage() {
  const [user, setUser] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [showNewConversation, setShowNewConversation] = useState(false);

  // Queries
  const conversationListQuery = trpc.messages.getConversationList.useQuery(
    { studentId: user?.id || 0 },
    { refetchInterval: 2000, enabled: !!user?.id }
  );

  const conversationQuery = trpc.messages.getConversation.useQuery(
    { studentId1: user?.id || 0, studentId2: selectedConversation || 0 },
    { refetchInterval: 2000, enabled: !!user?.id && !!selectedConversation }
  );

  const studentsQuery = trpc.students.getAll.useQuery(undefined, {
    enabled: showNewConversation,
  });

  // Mutations
  const sendMessageMutation = trpc.messages.sendMessage.useMutation({
    onSuccess: () => {
      setMessageText("");
      setIsSending(false);
      toast.success("Mensagem enviada!");
      conversationQuery.refetch();
      conversationListQuery.refetch();
    },
    onError: (err) => {
      setIsSending(false);
      toast.error("Erro ao enviar mensagem: " + err.message);
    },
  });

  const markAsReadMutation = trpc.messages.markAsRead.useMutation({
    onSuccess: () => {
      conversationListQuery.refetch();
    },
  });

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("tokiwadai-user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Update conversations when query returns data
  useEffect(() => {
    if (conversationListQuery.data) {
      // Transform data to match Conversation interface
      const transformed = conversationListQuery.data.map((item: any) => ({
        otherStudentId: item.senderId || item.receiverId,
        otherStudentName: item.sender?.studentId || "",
        otherStudentFullName: item.sender?.fullName || "Desconhecido",
        lastMessage: item.content || "",
        lastMessageTime: item.createdAt || new Date().toISOString(),
        unreadCount: item.isRead ? 0 : 1,
      }));
      setConversations(transformed);
    }
  }, [conversationListQuery.data]);

  // Update messages when conversation query returns data
  useEffect(() => {
    if (conversationQuery.data) {
      setMessages(conversationQuery.data);
      // Mark unread messages as read
      conversationQuery.data.forEach((msg: Message) => {
        if (!msg.isRead && msg.receiverId === user?.id) {
          markAsReadMutation.mutate({ messageId: msg.id });
        }
      });
    }
  }, [conversationQuery.data]);

  // Update students list when query returns data
  useEffect(() => {
    if (studentsQuery.data) {
      // Filter out current user and users already in conversations
      const conversationIds = new Set(conversations.map((c) => c.otherStudentId));
      const filtered = studentsQuery.data.filter(
        (student: any) => student.id !== user?.id && !conversationIds.has(student.id)
      );
      setAllStudents(filtered);
    }
  }, [studentsQuery.data, conversations]);

  const handleSendMessage = () => {
    if (!messageText.trim()) {
      toast.error("Escreva uma mensagem!");
      return;
    }

    if (!selectedConversation) {
      toast.error("Selecione uma conversa!");
      return;
    }

    setIsSending(true);
    sendMessageMutation.mutate({
      senderId: user.id,
      receiverId: selectedConversation,
      content: messageText,
    });
  };

  const handleStartConversation = (studentId: number) => {
    setSelectedConversation(studentId);
    setShowNewConversation(false);
    setSearchTerm("");
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.otherStudentFullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div className="flex h-[600px] gap-4">
      {/* Conversations List */}
      <div className="w-80 border border-gray-200 rounded-lg overflow-hidden flex flex-col bg-white">
        <div className="p-4 border-b border-gray-200 space-y-3">
          <h3 className="font-semibold text-gray-900">Conversas</h3>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
              <Input
                placeholder="Buscar conversa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <Button
              onClick={() => setShowNewConversation(!showNewConversation)}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              +
            </Button>
          </div>
        </div>

        {/* New Conversation */}
        {showNewConversation && (
          <div className="p-3 border-b border-gray-200 space-y-2 max-h-48 overflow-y-auto">
            {studentsQuery.isLoading ? (
              <div className="text-center py-4 text-gray-500 text-sm">
                <Loader2 className="inline-block animate-spin mr-2" size={16} />
                Carregando...
              </div>
            ) : allStudents.length === 0 ? (
              <p className="text-center text-gray-500 text-sm py-4">
                Nenhum estudante disponível
              </p>
            ) : (
              allStudents
                .filter((s: any) =>
                  s.fullName.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((student: any) => (
                <button
                  key={student.id}
                  onClick={() => handleStartConversation(student.id)}
                  className="w-full text-left p-2 hover:bg-blue-50 rounded-lg transition text-sm"
                >
                  <p className="font-medium text-gray-900">{student.fullName}</p>
                  <p className="text-xs text-gray-500">{student.studentId}</p>
                </button>
              ))
            )}
          </div>
        )}

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {conversationListQuery.isLoading ? (
            <div className="text-center py-8 text-gray-500">
              <Loader2 className="inline-block animate-spin mr-2" size={20} />
              Carregando conversas...
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              Nenhuma conversa. Comece uma nova!
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <button
                key={conv.otherStudentId}
                onClick={() => setSelectedConversation(conv.otherStudentId)}
                className={`w-full text-left p-3 border-b border-gray-100 hover:bg-gray-50 transition ${
                  selectedConversation === conv.otherStudentId ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {conv.otherStudentFullName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(conv.lastMessageTime).toLocaleDateString("pt-BR")}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 border border-gray-200 rounded-lg overflow-hidden flex flex-col bg-white">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
              <p className="font-semibold text-gray-900">
                {conversations.find((c) => c.otherStudentId === selectedConversation)
                  ?.otherStudentFullName || "Conversa"}
              </p>
              <p className="text-xs text-gray-500">
                {conversations.find((c) => c.otherStudentId === selectedConversation)
                  ?.otherStudentName}
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {conversationQuery.isLoading ? (
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
              <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Selecione uma conversa para começar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


