import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Camera, X, Upload, FileText } from "lucide-react";
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
  const [analysisMode, setAnalysisMode] = useState<'photo' | 'text'>('photo');
  const [textInput, setTextInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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

  const analyzeImageMutation = useMutation({
    mutationFn: async ({ analysisId, imageBase64 }: { analysisId: string; imageBase64: string }) => {
      const response = await apiRequest("POST", `/api/blood-analyses/${analysisId}/analyze-image`, {
        imageBase64,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blood-analyses"] });
      toast({
        title: "Анализ завершен",
        description: "Ваш анализ крови успешно обработан с помощью ИИ",
      });
      onOpenChange(false);
      setIsUploading(false);
      setIsAnalyzing(false);
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось проанализировать изображение",
        variant: "destructive",
      });
      setIsUploading(false);
      setIsAnalyzing(false);
    },
  });

  const analyzeTextMutation = useMutation({
    mutationFn: async ({ analysisId, text }: { analysisId: string; text: string }) => {
      const response = await apiRequest("POST", `/api/blood-analyses/${analysisId}/analyze-text`, {
        text,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blood-analyses"] });
      toast({
        title: "Анализ завершен",
        description: "Ваши данные успешно обработаны с помощью ИИ",
      });
      onOpenChange(false);
      setTextInput('');
      setIsAnalyzing(false);
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось проанализировать данные",
        variant: "destructive",
      });
      setIsAnalyzing(false);
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
    if (result.successful && result.successful.length > 0) {
      setIsUploading(true);
      setIsAnalyzing(true);
      
      try {
        // Create blood analysis entry
        const analysis = await createAnalysisMutation.mutateAsync();
        
        // Get uploaded image and convert to base64 for DeepSeek
        const uploadURL = result.successful[0].uploadURL as string;
        const response = await fetch(uploadURL);
        const blob = await response.blob();
        const reader = new FileReader();
        
        reader.onloadend = async () => {
          try {
            const base64 = reader.result as string;
            const imageBase64 = base64.split(',')[1]; // Remove data:image/jpeg;base64, prefix
            
            // Analyze with DeepSeek AI
            await analyzeImageMutation.mutateAsync({
              analysisId: analysis.id,
              imageBase64,
            });
          } catch (error) {
            console.error("Error analyzing image:", error);
            setIsUploading(false);
            setIsAnalyzing(false);
          }
        };
        
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error("Error processing upload:", error);
        setIsUploading(false);
        setIsAnalyzing(false);
      }
    }
  };

  const handleTextAnalysis = async () => {
    if (!textInput.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите данные анализа",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      // Create analysis first
      const analysisResponse = await createAnalysisMutation.mutateAsync();
      
      // Analyze with DeepSeek
      await analyzeTextMutation.mutateAsync({
        analysisId: analysisResponse.id,
        text: textInput,
      });
    } catch (error) {
      console.error('Error analyzing text:', error);
      setIsAnalyzing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm w-full p-6">
        <DialogTitle className="sr-only">Анализ крови</DialogTitle>
        <DialogDescription className="sr-only">Загрузите фото анализа крови или введите данные вручную для анализа с помощью ИИ</DialogDescription>
        
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-trust-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
            {analysisMode === 'photo' ? <Camera className="w-8 h-8 text-trust-green" /> : <FileText className="w-8 h-8 text-trust-green" />}
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            Анализ крови с ИИ
          </h3>
          <p className="text-muted-foreground text-sm">
            {analysisMode === 'photo' 
              ? "Загрузите фото результатов анализа для получения рекомендаций DeepSeek AI"
              : "Введите данные анализа вручную для обработки с помощью ИИ"
            }
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex mb-6 bg-muted rounded-lg p-1">
          <Button
            data-testid="button-photo-mode"
            variant={analysisMode === 'photo' ? 'default' : 'ghost'}
            size="sm"
            className="flex-1"
            onClick={() => setAnalysisMode('photo')}
          >
            <Camera className="w-4 h-4 mr-2" />
            Фото
          </Button>
          <Button
            data-testid="button-text-mode"
            variant={analysisMode === 'text' ? 'default' : 'ghost'}
            size="sm"
            className="flex-1"
            onClick={() => setAnalysisMode('text')}
          >
            <FileText className="w-4 h-4 mr-2" />
            Текст
          </Button>
        </div>

        <div className="space-y-4">
          {analysisMode === 'photo' ? (
            <ObjectUploader
              maxNumberOfFiles={1}
              maxFileSize={10485760} // 10MB
              onGetUploadParameters={handleGetUploadParameters}
              onComplete={handleComplete}
              buttonClassName="w-full p-4 border-2 border-dashed border-border hover:border-trust-green transition-colors rounded-xl bg-transparent"
              asButton={false}
            >
              <div className="flex flex-col items-center space-y-2">
                <Upload className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {isUploading ? "Загружаем..." : "Загрузить фото анализа"}
                </span>
              </div>
            </ObjectUploader>
          ) : (
            <div className="space-y-4">
              <Textarea
                data-testid="textarea-analysis-input"
                placeholder="Введите данные анализа крови. Например:&#10;&#10;Гемоглобин: 138 г/л&#10;Эритроциты: 4.2×10¹²/л&#10;Лейкоциты: 6.8×10⁹/л&#10;Тромбоциты: 280×10⁹/л&#10;Глюкоза: 5.1 ммоль/л"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="min-h-[120px] resize-none"
                disabled={isAnalyzing}
              />
              <Button
                data-testid="button-analyze-text"
                onClick={handleTextAnalysis}
                disabled={isAnalyzing || !textInput.trim()}
                className="w-full"
              >
                {isAnalyzing ? "Анализируем..." : "Анализировать с ИИ"}
              </Button>
            </div>
          )}

          <div className="flex space-x-3">
            <Button
              data-testid="button-cancel-upload"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={isUploading || isAnalyzing}
            >
              Отмена
            </Button>
          </div>
        </div>

        {(isUploading || isAnalyzing) && (
          <div className="text-center mt-4">
            <div className="animate-pulse text-sm text-trust-green">
              {isAnalyzing ? "Анализируем с помощью DeepSeek AI..." : "Обрабатываем ваш анализ..."}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
