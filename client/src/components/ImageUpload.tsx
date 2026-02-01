import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  onImageSelected: (file: File) => void;
  maxSizeMB?: number;
  aspectRatio?: "square" | "wide" | "auto";
}

export default function ImageUpload({
  onImageSelected,
  maxSizeMB = 5,
  aspectRatio = "square",
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione uma imagem válida");
      return;
    }

    // Validar tamanho
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      toast.error(`Imagem muito grande. Máximo: ${maxSizeMB}MB`);
      return;
    }

    // Criar preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
      setSelectedFile(file);
      onImageSelected(file);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const aspectRatioClass = {
    square: "aspect-square",
    wide: "aspect-video",
    auto: "",
  }[aspectRatio];

  return (
    <div className="space-y-4">
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className={`w-full rounded-lg object-cover ${aspectRatioClass}`}
          />
          <Button
            variant="destructive"
            size="sm"
            onClick={handleRemove}
            className="absolute top-2 right-2"
          >
            <X size={16} />
            Remover
          </Button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition ${aspectRatioClass}`}
        >
          <Upload className="mx-auto mb-2 text-gray-400" size={32} />
          <p className="text-sm font-medium text-gray-700">
            Clique para selecionar uma imagem
          </p>
          <p className="text-xs text-gray-500">
            PNG, JPG ou GIF (máximo {maxSizeMB}MB)
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {selectedFile && (
        <p className="text-xs text-gray-600">
          Arquivo selecionado: {selectedFile.name}
        </p>
      )}
    </div>
  );
}
