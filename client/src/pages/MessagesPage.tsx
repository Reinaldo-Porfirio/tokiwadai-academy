import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Send, Plus, Search, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";

interface Conversation {
  id: number;
  participant1Id: number;
  participant2Id: number;
  participantName?: string;
  lastMessage?: string;
  lastMessageAt?: Date;
  unreadCount?: number;
}

interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  isRead: boolean;
  createdAt: Date;
  senderName?: string;
}

export default function MessagesPage() {
  const [, navigate] = useLocation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("tokiwadai-user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  const conversationsQuery = trpc.messages.getConversations.useQuery(
    { studentId: user?.id },
    { enabled: !!user?.id, refetchInterval: 3000 }
  );

  useEffect(() => {
    if (conversationsQuery.data) {
      setConversations(conversationsQuery.data);
    }
  }, [conversationsQuery.data]);

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">💬 Mensagens Privadas</h1>
        <p className="text-gray-600">Converse com seus colegas da Tokiwadai Academy</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">
        {/* Lista de Conversas */}
        <Card className="md:col-span-1 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare size={20} />
                Conversas
              </CardTitle>
              <Button
                size="sm"
                onClick={() => setShowNewConversation(true)}
                className="gap-1"
              >
                <Plus size={16} />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto space-y-2">
            {conversationsQuery.isLoading ? (
              <p className="text-center text-gray-500 py-4">Carregando...</p>
            ) : conversations.length === 0 ? (
              <p className="text-center text-gray-500 py-4">Nenhuma conversa</p>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`p-3 rounded-lg cursor-pointer transition ${
                    selectedConversation?.id === conv.id
                      ? "bg-blue-100 border-2 border-blue-500"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-sm">{conv.participantName}</p>
                    {conv.unreadCount && conv.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 truncate">{conv.lastMessage}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Chat ou Nova Conversa */}
        <Card className="md:col-span-2 flex flex-col">
          {selectedConversation ? (
            <ChatWindow
              conversation={selectedConversation}
              studentId={user.id}
              onMessageSent={() => conversationsQuery.refetch()}
            />
          ) : showNewConversation ? (
            <NewConversationForm
              studentId={user.id}
              onConversationCreated={(conv) => {
                setConversations([conv, ...conversations]);
                setSelectedConversation(conv);
                setShowNewConversation(false);
                conversationsQuery.refetch();
              }}
              onCancel={() => setShowNewConversation(false)}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-4">Selecione uma conversa</p>
                <Button onClick={() => setShowNewConversation(true)}>
                  <Plus size={20} className="mr-2" />
                  Nova Conversa
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function ChatWindow({
  conversation,
  studentId,
  onMessageSent,
}: {
  conversation: Conversation;
  studentId: number;
  onMessageSent?: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messagesQuery = trpc.messages.getMessages.useQuery(
    { conversationId: conversation.id },
    { enabled: !!conversation.id, refetchInterval: 2000 }
  );

  const sendMessageMutation = trpc.messages.sendMessage.useMutation({
    onSuccess: () => {
      setNewMessage("");
      messagesQuery.refetch();
      onMessageSent?.();
    },
    onError: (error: any) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const markAsReadMutation = trpc.messages.markAsRead.useMutation();

  useEffect(() => {
    if (messagesQuery.data) {
      setMessages(messagesQuery.data);
      messagesQuery.data.forEach((msg: Message) => {
        if (!msg.isRead && msg.senderId !== studentId) {
          markAsReadMutation.mutate({ messageId: msg.id });
        }
      });
    }
  }, [messagesQuery.data]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) {
      toast.error("A mensagem não pode estar vazia");
      return;
    }

    sendMessageMutation.mutate({
      conversationId: conversation.id,
      senderId: studentId,
      receiverId: receiverId,
      content: newMessage,
    });
  };

  return (
    <>
      <CardHeader className="border-b">
        <CardTitle>{conversation.participantName || "Conversa"}</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto mb-4 space-y-3 p-4 bg-gray-50 rounded-lg">
          {messages.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Nenhuma mensagem ainda</p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.senderId === studentId ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    message.senderId === studentId
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-white text-gray-900 rounded-bl-none border"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.senderId === studentId
                        ? "text-blue-100"
                        : "text-gray-500"
                    }`}
                  >
                    {new Date(message.createdAt).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Digite sua mensagem..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSendMessage();
              }
            }}
            disabled={sendMessageMutation.isPending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={sendMessageMutation.isPending}
            className="gap-2"
          >
            <Send size={20} />
          </Button>
        </div>
      </CardContent>
    </>
  );
}

function NewConversationForm({
  studentId,
  onConversationCreated,
  onCancel,
}: {
  studentId: number;
  onConversationCreated: (conv: Conversation) => void;
  onCancel: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const searchQuery = trpc.messages.searchStudents.useQuery(
    { query: searchTerm },
    { enabled: searchTerm.length > 0 }
  );

  const createConversationMutation = trpc.messages.createConversation.useMutation({
    onSuccess: (data) => {
      toast.success("Conversa iniciada!");
      onConversationCreated(data);
    },
    onError: (error: any) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const handleStartConversation = () => {
    if (!selectedStudent) {
      toast.error("Selecione um estudante");
      return;
    }

    createConversationMutation.mutate({
      participant1Id: studentId,
      participant2Id: selectedStudent.id,
    });
  };

  return (
    <>
      <CardHeader className="border-b">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <ArrowLeft size={20} />
          </Button>
          <CardTitle>Iniciar Conversa</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col overflow-hidden p-4">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <Input
              placeholder="Buscar estudante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 mb-4">
          {searchQuery.isLoading ? (
            <p className="text-center text-gray-500 py-4">Buscando...</p>
          ) : searchQuery.data && searchQuery.data.length === 0 ? (
            <p className="text-center text-gray-500 py-4">Nenhum estudante encontrado</p>
          ) : (
            searchQuery.data?.map((student: any) => (
              <div
                key={student.id}
                onClick={() => setSelectedStudent(student)}
                className={`p-3 rounded-lg cursor-pointer transition ${
                  selectedStudent?.id === student.id
                    ? "bg-blue-100 border-2 border-blue-500"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <p className="font-semibold">{student.fullName}</p>
                <p className="text-sm text-gray-600">{student.studentId}</p>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
          <Button
            onClick={handleStartConversation}
            disabled={!selectedStudent || createConversationMutation.isPending}
            className="flex-1"
          >
            {createConversationMutation.isPending ? "Iniciando..." : "Iniciar"}
          </Button>
        </div>
      </CardContent>
    </>
  );
}
