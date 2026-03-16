import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, MessageCircle, Search } from "lucide-react";

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

interface Conversation {
  studentId: number;
  otherStudentId: number;
  otherStudent: {
    id: number;
    fullName: string;
    studentId: string;
  };
  lastMessage: string;
  unreadCount: number;
}

export default function AdminMessagesPanel() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Get all students
  const studentsQuery = trpc.students.getAll.useQuery();

  // Get messages for selected conversation (dummy admin ID for now)
  const messagesQuery = trpc.messages.getConversation.useQuery(
    {
      studentId1: 1,
      studentId2: selectedConversation || 0,
    },
    { enabled: !!selectedConversation }
  );

  // Load conversations
  useEffect(() => {
    if (Array.isArray(studentsQuery.data)) {
      // Build conversations list from students
      const convs: Conversation[] = studentsQuery.data.map((student: any) => ({
        studentId: student.id,
        otherStudentId: student.id,
        otherStudent: {
          id: student.id,
          fullName: student.fullName,
          studentId: student.studentId,
        },
        lastMessage: "Selecione para ver mensagens",
        unreadCount: 0,
      }));
      setConversations(convs);
    }
  }, [studentsQuery.data]);

  // Load messages for selected conversation
  useEffect(() => {
    if (Array.isArray(messagesQuery.data)) {
      setMessages(
        messagesQuery.data.map((msg: any) => ({
          id: msg.id,
          senderId: msg.senderId,
          receiverId: msg.receiverId,
          content: msg.content,
          isRead: msg.isRead,
          createdAt: msg.createdAt,
          sender: msg.sender,
        }))
      );
    }
  }, [messagesQuery.data]);

  const filteredConversations = conversations.filter((conv) =>
    conv.otherStudent.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.otherStudent.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Conversations List */}
      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Conversas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar estudante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhuma conversa encontrada
                </p>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.otherStudentId}
                    onClick={() => setSelectedConversation(conv.otherStudentId)}
                    className={`w-full text-left p-3 rounded-lg transition ${
                      selectedConversation === conv.otherStudentId
                        ? "bg-blue-100 border-2 border-blue-500"
                        : "hover:bg-gray-100 border-2 border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {conv.otherStudent.fullName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {conv.otherStudent.fullName}
                        </p>
                        <p className="text-xs text-gray-500">{conv.otherStudent.studentId}</p>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Messages */}
      <div className="lg:col-span-2">
        {selectedConversation === null ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              <MessageCircle className="inline-block mr-2 mb-4" size={32} />
              <p>Selecione uma conversa para ver as mensagens</p>
            </CardContent>
          </Card>
        ) : messagesQuery.isLoading ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              <Loader2 className="inline-block animate-spin mr-2" size={20} />
              Carregando mensagens...
            </CardContent>
          </Card>
        ) : messages.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              <p>Nenhuma mensagem nesta conversa</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {conversations.find((c) => c.otherStudentId === selectedConversation)
                  ?.otherStudent.fullName || "Conversa"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.senderId === selectedConversation ? "justify-start" : "justify-end"
                    }`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.senderId === selectedConversation
                          ? "bg-gray-200 text-gray-900"
                          : "bg-blue-500 text-white"
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(msg.createdAt).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
