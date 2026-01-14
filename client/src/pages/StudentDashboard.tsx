import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, LogOut, MessageSquare, Calendar, Book, Map, Settings } from "lucide-react";

export default function StudentDashboard() {
  const [, navigate] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    const storedUser = localStorage.getItem("tokiwadai-user");
    const userType = localStorage.getItem("tokiwadai-user-type");

    if (!storedUser || userType !== "student") {
      navigate("/login");
      return;
    }

    setUser(JSON.parse(storedUser));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("tokiwadai-user");
    localStorage.removeItem("tokiwadai-user-type");
    navigate("/login");
  };

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-blue-900 text-white p-6 shadow-lg">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">TKW Academy</h1>
          <p className="text-blue-200 text-sm">Painel do Estudante</p>
        </div>

        <nav className="space-y-4">
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
              activeTab === "profile" ? "bg-blue-700" : "hover:bg-blue-800"
            }`}
          >
            <User size={20} />
            <span>Perfil</span>
          </button>

          <button
            onClick={() => setActiveTab("mirror")}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
              activeTab === "mirror" ? "bg-blue-700" : "hover:bg-blue-800"
            }`}
          >
            <MessageSquare size={20} />
            <span>Mirror</span>
          </button>

          <button
            onClick={() => setActiveTab("messages")}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
              activeTab === "messages" ? "bg-blue-700" : "hover:bg-blue-800"
            }`}
          >
            <MessageSquare size={20} />
            <span>Mensagens</span>
          </button>

          <button
            onClick={() => setActiveTab("calendar")}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
              activeTab === "calendar" ? "bg-blue-700" : "hover:bg-blue-800"
            }`}
          >
            <Calendar size={20} />
            <span>Calendário</span>
          </button>

          <button
            onClick={() => setActiveTab("library")}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
              activeTab === "library" ? "bg-blue-700" : "hover:bg-blue-800"
            }`}
          >
            <Book size={20} />
            <span>Biblioteca</span>
          </button>

          <button
            onClick={() => setActiveTab("map")}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
              activeTab === "map" ? "bg-blue-700" : "hover:bg-blue-800"
            }`}
          >
            <Map size={20} />
            <span>Mapa da Cidade</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
              activeTab === "settings" ? "bg-blue-700" : "hover:bg-blue-800"
            }`}
          >
            <Settings size={20} />
            <span>Configurações</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-red-900 transition mt-8"
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Bem-vindo, {user.fullName}!</h2>
            <p className="text-gray-600">ID: {user.studentId}</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="hidden">
              <TabsTrigger value="profile">Perfil</TabsTrigger>
              <TabsTrigger value="mirror">Mirror</TabsTrigger>
              <TabsTrigger value="messages">Mensagens</TabsTrigger>
              <TabsTrigger value="calendar">Calendário</TabsTrigger>
              <TabsTrigger value="library">Biblioteca</TabsTrigger>
              <TabsTrigger value="map">Mapa</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Meu Perfil</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Nome Completo</label>
                      <p className="text-lg text-gray-800">{user.fullName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">ID de Estudante</label>
                      <p className="text-lg text-gray-800 font-mono">{user.studentId}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-lg text-gray-800">{user.email}</p>
                    </div>
                    <Button className="mt-4">Editar Perfil</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mirror">
              <Card>
                <CardHeader>
                  <CardTitle>Mirror - Rede Social</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Funcionalidade em desenvolvimento...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="messages">
              <Card>
                <CardHeader>
                  <CardTitle>Mensagens Privadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Funcionalidade em desenvolvimento...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calendar">
              <Card>
                <CardHeader>
                  <CardTitle>Calendário Acadêmico</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Funcionalidade em desenvolvimento...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="library">
              <Card>
                <CardHeader>
                  <CardTitle>Biblioteca Digital</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Funcionalidade em desenvolvimento...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="map">
              <Card>
                <CardHeader>
                  <CardTitle>Mapa de Axis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Funcionalidade em desenvolvimento...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Funcionalidade em desenvolvimento...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
