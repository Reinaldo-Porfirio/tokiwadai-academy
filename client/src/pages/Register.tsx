import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Register() {
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthDate: "",
    grade: "",
    district: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const registerMutation = trpc.auth.registerStudent.useMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast.error("As senhas não correspondem");
      setIsLoading(false);
      return;
    }

    try {
      const result = await registerMutation.mutateAsync({
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        birthDate: formData.birthDate,
        grade: parseInt(formData.grade),
        district: parseInt(formData.district),
      });

      toast.success(`Conta criada com sucesso! ID: ${result.studentId}`);
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar conta");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Criar Conta de Estudante</h1>
          <p className="text-blue-200">Tokiwadai Academy - Axis City</p>
        </div>

        <Card className="bg-white/95 backdrop-blur border-0 shadow-2xl">
          <CardHeader>
            <CardTitle>Formulário de Registro</CardTitle>
            <CardDescription>
              Preencha todos os campos para criar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Nome Completo
                  </label>
                  <Input
                    type="text"
                    name="fullName"
                    placeholder="Seu nome completo"
                    value={formData.fullName}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Nome de Usuário
                  </label>
                  <Input
                    type="text"
                    name="username"
                    placeholder="seu_usuario"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <Input
                    type="email"
                    name="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Data de Nascimento
                  </label>
                  <Input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Série (1-6)
                  </label>
                  <Select value={formData.grade} onValueChange={(value) => handleSelectChange("grade", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione a série" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map((grade) => (
                        <SelectItem key={grade} value={String(grade)}>
                          {grade}º ano
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Distrito (1-23)
                  </label>
                  <Select value={formData.district} onValueChange={(value) => handleSelectChange("district", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione o distrito" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 23 }, (_, i) => i + 1).map((district) => (
                        <SelectItem key={district} value={String(district)}>
                          Distrito {district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Senha
                  </label>
                  <Input
                    type="password"
                    name="password"
                    placeholder="Mínimo 8 caracteres"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Confirmar Senha
                  </label>
                  <Input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirme sua senha"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 mt-6"
                disabled={isLoading}
              >
                {isLoading ? "Criando conta..." : "Criar Conta"}
              </Button>

              <div className="text-center text-sm">
                <span className="text-gray-600">Já tem conta? </span>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Fazer login
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
