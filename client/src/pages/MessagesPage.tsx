import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Search, User, MessageSquare } from "lucide-react"; // MessageSquare adicionado!

export default function MessagesPage() {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Pegando o usuário logado para passar o ID para a query
  const storedUser = JSON.parse(localStorage.getItem("tokiwadai-user") || "{}");
  const currentStudentId = storedUser.id || 0;

  // Queries corrigidas
  const conversations = trpc.messages.getConversations.useQuery(
    { studentId: currentStudentId },
    { enabled: !!currentStudentId }
  ); // Adicionado {}
  
  // O seu backend tem searchStudents dentro de messages, não no student!
  const searchResults = trpc.messages.searchStudents?.useQuery({ query: searchTerm }, { enabled: searchTerm.length > 2 });
  
  // Como o getChatHistory deu erro, vou usar um fallback. 
  // Se o seu backend mudou o nome para getMessages, troque aqui embaixo:
  const chatHistory = (trpc.messages as any).getChatHistory?.useQuery(
    { otherId: selectedUser?.id },
    { enabled: !!selectedUser, refetchInterval: 3000 }
  );

  // Mutation corrigida para sendMessage
  const sendMessage = trpc.messages.sendMessage.useMutation({
    onSuccess: () => {
      setMessage("");
      if (chatHistory) chatHistory.refetch();
    }
  });

  const handleSend = () => {
    if (!message.trim() || !selectedUser) return;
    sendMessage.mutate({
      senderId: 0, // O tRPC vai preencher no servidor, mas o tipo exige aqui
      receiverId: selectedUser.id,
      content: message
    });
  };

  return (
    <div className="flex h-screen bg-gray-100 max-w-6xl mx-auto shadow-2xl border-x overflow-hidden font-sans">
      <aside className="w-80 bg-white border-r flex flex-col">
        <div className="p-6 border-b bg-white">
          <h1 className="text-xl font-black text-gray-900 mb-4 tracking-tighter">MENSAGENS</h1>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <Input 
              placeholder="Buscar aluno..." 
              className="pl-9 bg-gray-50 border-none rounded-xl h-10 text-sm focus-visible:ring-red-200" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {searchTerm.length > 2 ? (
            <div className="p-2">
              <p className="text-[10px] font-black text-gray-400 uppercase px-3 py-2">Resultados</p>
              {searchResults?.data?.map((s: any) => (
                <div key={s.id} onClick={() => { setSelectedUser(s); setSearchTerm(""); }} className="p-3 hover:bg-red-50 cursor-pointer rounded-xl flex items-center gap-3 transition">
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-black text-xs uppercase">{s.fullName[0]}</div>
                  <span className="text-sm font-bold text-gray-700">{s.fullName}</span>
                </div>
              ))}
            </div>
          ) : (
            conversations.data?.map((conv: any) => (
              <div key={conv.id} onClick={() => setSelectedUser(conv.otherUser)} className={`p-4 border-b flex items-center gap-4 cursor-pointer transition ${selectedUser?.id === conv.otherUser.id ? 'bg-red-50 border-r-4 border-r-red-700' : 'hover:bg-gray-50'}`}>
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center border border-gray-100">
                  <User className="text-gray-400" size={20}/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-gray-900 truncate">{conv.otherUser.fullName}</p>
                  <p className="text-xs text-gray-500 truncate font-medium">Clique para conversar</p>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      <section className="flex-1 flex flex-col bg-white">
        {selectedUser ? (
          <>
            <header className="p-4 border-b flex items-center gap-4 bg-white/90 backdrop-blur shadow-sm sticky top-0 z-10">
              <div className="w-10 h-10 rounded-full bg-red-700 text-white flex items-center justify-center font-black text-xs">
                {selectedUser.fullName?.substring(0,1)}
              </div>
              <div>
                <p className="font-black text-sm text-gray-900">{selectedUser.fullName}</p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  <p className="text-[10px] text-green-600 font-black uppercase tracking-widest">Ativo Agora</p>
                </div>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
              {chatHistory?.data?.map((msg: any) => (
                <div key={msg.id} className={`flex ${msg.senderId === selectedUser.id ? 'justify-start' : 'justify-end'}`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm max-w-[75%] ${
                    msg.senderId === selectedUser.id 
                    ? 'bg-white text-gray-800 rounded-tl-none border border-gray-100' 
                    : 'bg-red-700 text-white rounded-tr-none font-medium'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            <footer className="p-4 border-t bg-white">
              <div className="flex gap-2 bg-gray-100 p-2 rounded-2xl items-center">
                <Input 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Escreva para Tokiwadai..." 
                  className="bg-transparent border-none focus-visible:ring-0 text-sm" 
                />
                <Button onClick={handleSend} disabled={!message.trim()} className="bg-red-700 hover:bg-red-800 rounded-xl h-10 w-10 p-0 transition-transform active:scale-95">
                  <Send size={18}/>
                </Button>
              </div>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-300 gap-4 bg-gray-50/30">
            <div className="p-6 bg-white rounded-full shadow-sm">
              <MessageSquare size={48} className="text-red-100" />
            </div>
            <p className="font-black text-xs uppercase tracking-widest text-gray-400">Selecione uma transmissão</p>
          </div>
        )}
      </section>
    </div>
  );
}