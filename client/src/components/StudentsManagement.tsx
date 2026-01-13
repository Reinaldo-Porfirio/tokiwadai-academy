import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Lock, Unlock, Search } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface Student {
  id: number;
  studentId: string;
  fullName: string;
  username: string;
  email: string;
  grade: number;
  district: number;
  status: "active" | "suspended";
  createdAt: Date;
}

export default function StudentsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [gradeFilter, setGradeFilter] = useState<number | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Student | null>(null);

  // Get admin ID from localStorage
  const admin = localStorage.getItem("tokiwadai-user") ? JSON.parse(localStorage.getItem("tokiwadai-user") || "{}") : null;
  const adminId = admin?.id || 0;

  // Fetch students
  const studentsQuery = trpc.admin.listStudents.useQuery(
    { adminId },
    { enabled: !!adminId }
  );
  const students = (studentsQuery.data as Student[]) || [];

  // Mutations
  const createStudentMutation = trpc.admin.createStudent.useMutation({
    onSuccess: () => {
      toast.success("Estudante criado com sucesso!");
      setIsCreateOpen(false);
      studentsQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const updateStudentMutation = trpc.admin.updateStudent.useMutation({
    onSuccess: () => {
      toast.success("Estudante atualizado com sucesso!");
      setIsEditOpen(false);
      studentsQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const deleteStudentMutation = trpc.admin.deleteStudent.useMutation({
    onSuccess: () => {
      toast.success("Estudante deletado com sucesso!");
      setDeleteConfirm(null);
      studentsQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const suspendMutation = trpc.admin.suspendStudent.useMutation({
    onSuccess: () => {
      toast.success("Estudante suspenso com sucesso!");
      studentsQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const reactivateMutation = trpc.admin.reactivateStudent.useMutation({
    onSuccess: () => {
      toast.success("Estudante reativado com sucesso!");
      studentsQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  // Filter and search
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.username.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesGrade = gradeFilter === "all" || student.grade === gradeFilter;
      const matchesStatus = statusFilter === "all" || student.status === statusFilter;

      return matchesSearch && matchesGrade && matchesStatus;
    });
  }, [students, searchTerm, gradeFilter, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Estudantes</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus size={20} />
              Novo Estudante
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Estudante</DialogTitle>
            </DialogHeader>
            <CreateStudentForm
              onSubmit={(data) => {
                createStudentMutation.mutate({
                  ...data,
                  adminId,
                });
              }}
              isLoading={createStudentMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <Input
              placeholder="Buscar por nome, ID, email ou usuário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <select
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value === "all" ? "all" : parseInt(e.target.value))}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">Todas as Séries</option>
          {[1, 2, 3, 4, 5, 6].map((grade) => (
            <option key={grade} value={grade}>
              Série {grade}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">Todos os Status</option>
          <option value="active">Ativo</option>
          <option value="suspended">Suspenso</option>
        </select>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead>ID do Estudante</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Série</TableHead>
              <TableHead>Distrito</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  Nenhum estudante encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => (
                <TableRow key={student.id} className="hover:bg-gray-50">
                  <TableCell className="font-mono text-sm">{student.studentId}</TableCell>
                  <TableCell className="font-medium">{student.fullName}</TableCell>
                  <TableCell>{student.username}</TableCell>
                  <TableCell className="text-sm">{student.email}</TableCell>
                  <TableCell className="text-center">{student.grade}</TableCell>
                  <TableCell className="text-center">{student.district}</TableCell>
                  <TableCell>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        student.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {student.status === "active" ? "Ativo" : "Suspenso"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog open={isEditOpen && selectedStudent?.id === student.id} onOpenChange={setIsEditOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedStudent(student)}
                          >
                            <Edit size={16} />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Editar Estudante</DialogTitle>
                          </DialogHeader>
                          {selectedStudent && (
                            <EditStudentForm
                              student={selectedStudent}
                              onSubmit={(data) => {
                                updateStudentMutation.mutate({
                                  studentId: selectedStudent.id,
                                  ...data,
                                  adminId,
                                });
                              }}
                              isLoading={updateStudentMutation.isPending}
                            />
                          )}
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (student.status === "active") {
                            suspendMutation.mutate({
                              studentId: student.id,
                              adminId,
                            });
                          } else {
                            reactivateMutation.mutate({
                              studentId: student.id,
                              adminId,
                            });
                          }
                        }}
                        disabled={suspendMutation.isPending || reactivateMutation.isPending}
                      >
                        {student.status === "active" ? (
                          <Lock size={16} />
                        ) : (
                          <Unlock size={16} />
                        )}
                      </Button>

                      <AlertDialog open={deleteConfirm?.id === student.id} onOpenChange={(open) => {
                        if (!open) setDeleteConfirm(null);
                      }}>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteConfirm(student)}
                        >
                          <Trash2 size={16} />
                        </Button>
                        <AlertDialogContent>
                          <AlertDialogTitle>Deletar Estudante</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja deletar {student.fullName}? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                          <div className="flex gap-4 justify-end">
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                deleteStudentMutation.mutate({
                                  studentId: student.id,
                                  adminId,
                                })
                              }
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Deletar
                            </AlertDialogAction>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Total de Estudantes</p>
          <p className="text-2xl font-bold">{students.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Estudantes Ativos</p>
          <p className="text-2xl font-bold">{students.filter((s) => s.status === "active").length}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Estudantes Suspensos</p>
          <p className="text-2xl font-bold">{students.filter((s) => s.status === "suspended").length}</p>
        </div>
      </div>
    </div>
  );
}

// Form Components
function CreateStudentForm({
  onSubmit,
  isLoading,
}: {
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    birthDate: "",
    grade: 1,
    district: 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Nome Completo</label>
        <Input
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Nome de Usuário</label>
        <Input
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Senha</label>
        <Input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Data de Nascimento</label>
        <Input
          type="date"
          value={formData.birthDate}
          onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Série</label>
          <select
            value={formData.grade}
            onChange={(e) => setFormData({ ...formData, grade: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border rounded-lg"
          >
            {[1, 2, 3, 4, 5, 6].map((grade) => (
              <option key={grade} value={grade}>
                Série {grade}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Distrito</label>
          <select
            value={formData.district}
            onChange={(e) => setFormData({ ...formData, district: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border rounded-lg"
          >
            {Array.from({ length: 23 }, (_, i) => i + 1).map((district) => (
              <option key={district} value={district}>
                Distrito {district}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Criando..." : "Criar Estudante"}
      </Button>
    </form>
  );
}

function EditStudentForm({
  student,
  onSubmit,
  isLoading,
}: {
  student: Student;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    fullName: student.fullName,
    email: student.email,
    grade: student.grade,
    district: student.district,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Nome Completo</label>
        <Input
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Série</label>
          <select
            value={formData.grade}
            onChange={(e) => setFormData({ ...formData, grade: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border rounded-lg"
          >
            {[1, 2, 3, 4, 5, 6].map((grade) => (
              <option key={grade} value={grade}>
                Série {grade}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Distrito</label>
          <select
            value={formData.district}
            onChange={(e) => setFormData({ ...formData, district: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border rounded-lg"
          >
            {Array.from({ length: 23 }, (_, i) => i + 1).map((district) => (
              <option key={district} value={district}>
                Distrito {district}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Salvando..." : "Salvar Alterações"}
      </Button>
    </form>
  );
}
