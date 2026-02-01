import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import ImageUpload from "./ImageUpload";

interface ProfilePhotoUploadProps {
  studentId: number;
  currentPhotoUrl?: string;
  onSuccess?: (url: string) => void;
}

export default function ProfilePhotoUpload({
  studentId,
  currentPhotoUrl,
  onSuccess,
}: ProfilePhotoUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const uploadMutation = trpc.students.uploadProfilePhoto.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setSelectedFile(null);
      onSuccess?.(data.url);
    },
    onError: (error: any) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const handleImageSelected = (file: File) => {
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Por favor, selecione uma imagem");
      return;
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = (event.target?.result as string).split(",")[1];
        uploadMutation.mutate({
          studentId,
          imageData: base64,
          fileName: selectedFile.name,
        });
        setIsUploading(false);
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      toast.error("Erro ao processar imagem");
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Foto de Perfil</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentPhotoUrl && (
          <div>
            <p className="text-sm font-medium mb-2">Foto Atual</p>
            <img
              src={currentPhotoUrl}
              alt="Foto de perfil"
              className="w-32 h-32 rounded-full object-cover"
            />
          </div>
        )}

        <ImageUpload
          onImageSelected={handleImageSelected}
          maxSizeMB={5}
          aspectRatio="square"
        />

        <Button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading || uploadMutation.isPending}
          className="w-full"
        >
          {isUploading || uploadMutation.isPending ? "Enviando..." : "Enviar Foto"}
        </Button>
      </CardContent>
    </Card>
  );
}
