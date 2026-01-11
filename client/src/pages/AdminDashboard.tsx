import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, LogOut, Settings, Trash2, Edit, Plus } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const [admin, setAdmin] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  const dashboardStatsQuery = trpc.admin.getDashboardStats.useQuery(
    { adminId: admin?.id || 0 },
    { enabled: !!admin }
  );

  useEffect(() => {
    const storedUser = localStorage.getItem("tokiwadai-user");
    const userType = localStorage.getItem("tokiwadai-user-type");

    if (!storedUser || userType !== "admin") {
      navigate("/login");
      return;
    }

    setAdmin(JSON.parse(storedUser));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("tokiwadai-user");
    localStorage.removeItem("tokiwadai-user-type");
    navigate("/login");
  };

  if (!admin) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-red-900 text-white p-6 shadow-lg">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">TKW Academy</h1>
          <p className="text-red-200 text-sm">Painel Administrativo</p>
        </div>

        <nav className="space-y-4">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
              activeTab === "dashboard" ? "bg-red-800" : "hover:bg-red-800"
            }`}
          >
            <Settings size={20} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab("students")}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
              activeTab === "students" ? "bg-red-800" : "hover:bg-red-800"
            }`}
          >
            <Users size={20} />
            <span>Gerenciar Estudantes</span>
          </button>

          <button
            onClick={() => setActiveTab("moderation")}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
              activeTab === "moderation" ? "bg-red-800" : "hover:bg-red-800"
            }`}
          >
            <Trash2 size={20} />
            <span>Moderação</span>
          </button>

          <button
            onClick={() => setActiveTab("calendar")}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
              activeTab === "calendar" ? "bg-red-800" : "hover:bg-red-800"
            }`}
          >
            <Settings size={20} />
            <span>Calendário</span>
          </button>

          <button
            onClick={() => setActiveTab("library")}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
              activeTab === "library" ? "bg-red-800" : "hover:bg-red-800"
            }`}
          >
            <Settings size={20} />
            <span>Biblioteca</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
              activeTab === "settings" ? "bg-red-800" : "hover:bg-red-800"
            }`}
          >
            <Settings size={20} />
            <span>Configurações</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-red-800 transition mt-8"
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
            <h2 className="text-3xl font-bold text-gray-800">Painel Administrativo</h2>
            <p className="text-gray-600">Admin: {admin.username}</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="hidden">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="students">Estudantes</TabsTrigger>
              <TabsTrigger value="moderation">Moderação</TabsTrigger>
              <TabsTrigger value="calendar">Calendário</TabsTrigger>
              <TabsTrigger value="library">Biblioteca</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Total de Estudantes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      {dashboardStatsQuery.data?.totalStudents || 0}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Posts no Mirror</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      {dashboardStatsQuery.data?.totalPosts || 0}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Último Estudante</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-semibold">
                      {dashboardStatsQuery.data?.lastStudent?.fullName || "—"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {dashboardStatsQuery.data?.lastStudent?.studentId}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="students">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Gerenciar Estudantes</CardTitle>
                    <Button className="gap-2">
                      <Plus size={20} />
                      Novo Estudante
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Funcionalidade em desenvolvimento...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="moderation">
              <Card>
                <CardHeader>
                  <CardTitle>Moderação do Mirror</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Funcionalidade em desenvolvimento...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calendar">
              <Card>
                <CardHeader>
                  <CardTitle>Gerenciar Calendário</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Funcionalidade em desenvolvimento...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="library">
              <Card>
                <CardHeader>
                  <CardTitle>Gerenciar Biblioteca</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Funcionalidade em desenvolvimento...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações do Sistema</CardTitle>
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
