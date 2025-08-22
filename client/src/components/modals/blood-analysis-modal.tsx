import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, X, Upload } from "lucide-react";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { UploadResult } from "@uppy/core";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface BloodAnalysisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BloodAnalysisModal({ open, onOpenChange }: BloodAnalysisModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createAnalysisMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/blood-analyses", {
        status: "pending",
      });
      return response.json();
    },
  });

  const updateAnalysisImageMutation = useMutation({
    mutationFn: async ({ analysisId, imageURL }: { analysisId: string; imageURL: string }) => {
      const response = await apiRequest("PUT", `/api/blood-analyses/${analysisId}/image`, {
        imageURL,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blood-analyses"] });
      toast({
        title: "Анализ загружен",
        description: "Ваш анализ крови успешно загружен и обрабатывается",
      });
      onOpenChange(false);
      setIsUploading(false);
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить анализ",
        variant: "destructive",
      });
      setIsUploading(false);
    },
  });

  const handleGetUploadParameters = async () => {
    try {
      const response = await apiRequest("POST", "/api/objects/upload");
      const { uploadURL } = await response.json();
      return {
        method: "PUT" as const,
        url: uploadURL,
      };
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось получить URL для загрузки",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful.length > 0) {
      setIsUploading(true);
      
      try {
        // Create blood analysis entry
        const analysis = await createAnalysisMutation.mutateAsync();
        
        // Update with image URL
        const uploadURL = result.successful[0].uploadURL as string;
        await updateAnalysisImageMutation.mutateAsync({
          analysisId: analysis.id,
          imageURL: uploadURL,
        });
      } catch (error) {
        console.error("Error processing upload:", error);
        setIsUploading(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm w-full p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-trust-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Camera className="w-8 h-8 text-trust-green" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">Анализ крови</h3>
          <p className="text-muted-foreground text-sm">
            Загрузите фото результатов анализа для получения рекомендаций
          </p>
        </div>

        <div className="space-y-4">
          <ObjectUploader
            maxNumberOfFiles={1}
            maxFileSize={10485760} // 10MB
            onGetUploadParameters={handleGetUploadParameters}
            onComplete={handleComplete}
            buttonClassName="w-full p-4 border-2 border-dashed border-border hover:border-trust-green transition-colors rounded-xl bg-transparent"
          >
            <div className="flex flex-col items-center space-y-2">
              <Upload className="w-8 h-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {isUploading ? "Загружаем..." : "Загрузить фото"}
              </span>
            </div>
          </ObjectUploader>

          <div className="flex space-x-3">
            <Button
              data-testid="button-cancel-upload"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={isUploading}
            >
              Отмена
            </Button>
            <Button
              data-testid="button-manual-analysis"
              variant="outline"
              className="flex-1"
              disabled={isUploading}
            >
              Ввести вручную
            </Button>
          </div>
        </div>

        {isUploading && (
          <div className="text-center mt-4">
            <div className="animate-pulse text-sm text-trust-green">
              Обрабатываем ваш анализ...
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
