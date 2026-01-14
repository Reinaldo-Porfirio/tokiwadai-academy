import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Login() {
  const [, navigate] = useLocation();
  const [studentIdentifier, setStudentIdentifier] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loginStudentMutation = trpc.auth.loginStudent.useMutation();
  const loginAdminMutation = trpc.auth.loginAdmin.useMutation();

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await loginStudentMutation.mutateAsync({
        identifier: studentIdentifier,
        password: studentPassword,
      });

      localStorage.setItem("tokiwadai-user", JSON.stringify(result));
      localStorage.setItem("tokiwadai-user-type", "student");

      toast.success("Login de estudante realizado com sucesso!");
      navigate("/dashboard/student");
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await loginAdminMutation.mutateAsync({
        username: adminUsername,
        password: adminPassword,
      });

      localStorage.setItem("tokiwadai-user", JSON.stringify(result));
      localStorage.setItem("tokiwadai-user-type", "admin");

      toast.success("Login de administrador realizado com sucesso!");
      navigate("/dashboard/admin");
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-lg mb-4">
            <div className="text-2xl font-bold text-blue-900">TKW</div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Tokiwadai Academy</h1>
          <p className="text-blue-200">Sistema de Gerenciamento Acadêmico</p>
        </div>

        <Card className="bg-white/95 backdrop-blur border-0 shadow-2xl">
          <Tabs defaultValue="student" className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-t-lg">
              <TabsTrigger value="student">Estudante</TabsTrigger>
              <TabsTrigger value="admin">Administrador</TabsTrigger>
            </TabsList>

            <TabsContent value="student">
              <CardHeader>
                <CardTitle>Login de Estudante</CardTitle>
                <CardDescription>
                  Use seu ID de estudante ou nome de usuário
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleStudentLogin} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      ID de Estudante ou Usuário
                    </label>
                    <Input
                      type="text"
                      placeholder="TKW-2026-00001 ou seu_usuario"
                      value={studentIdentifier}
                      onChange={(e) => setStudentIdentifier(e.target.value)}
                      disabled={isLoading}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Senha
                    </label>
                    <Input
                      type="password"
                      placeholder="Sua senha"
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      disabled={isLoading}
                      className="mt-1"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Conectando..." : "Entrar"}
                  </Button>

                  <div className="text-center text-sm">
                    <span className="text-gray-600">Não tem conta? </span>
                    <button
                      type="button"
                      onClick={() => navigate("/register")}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Criar conta
                    </button>
                  </div>
                </form>
              </CardContent>
            </TabsContent>

            <TabsContent value="admin">
              <CardHeader>
                <CardTitle>Login de Administrador</CardTitle>
                <CardDescription>
                  Acesso restrito a administradores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Usuário Admin
                    </label>
                    <Input
                      type="text"
                      placeholder="admin"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      disabled={isLoading}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Senha
                    </label>
                    <Input
                      type="password"
                      placeholder="Sua senha"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      disabled={isLoading}
                      className="mt-1"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Conectando..." : "Entrar como Admin"}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>

        <div className="mt-8 text-center text-blue-100 text-sm">
          <p>Tokiwadai Academy © 2026</p>
          <p className="text-blue-300">Axis City - Metrópole Soberana</p>
        </div>
      </div>
    </div>
  );
}
