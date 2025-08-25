import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Camera, Upload, FileText, Activity, Clock, CheckCircle } from "lucide-react";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { UploadResult } from "@uppy/core";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import MobileNav from "@/components/layout/mobile-nav";
import BottomNav from "@/components/layout/bottom-nav";

// Helper function to compress images
function compressImage(file: Blob, quality = 0.8): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      const maxDimension = 1024;
      
      if (width > maxDimension || height > maxDimension) {
        const ratio = Math.min(maxDimension / width, maxDimension / height);
        width *= ratio;
        height *= ratio;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        resolve(blob || file); // Fallback to original file if compression fails
      }, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
}

export default function BloodAnalysisPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [analysisMode, setAnalysisMode] = useState<'photo' | 'text'>('photo');
  const [textInput, setTextInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
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
    mutationFn: async ({ analysisId, imageBase64, mimeType }: { analysisId: string; imageBase64: string; mimeType?: string }) => {
      const response = await apiRequest("POST", `/api/blood-analyses/${analysisId}/analyze-image`, {
        imageBase64,
        mimeType,
      });
      return response.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["/api/blood-analyses"] });
      toast({
        title: "Анализ завершен",
        description: "Ваш анализ крови успешно обработан с помощью ИИ",
      });
      setIsUploading(false);
      setIsAnalyzing(false);
      setAnalysisComplete(true);
      // Redirect to the analysis detail page after 2 seconds
      setTimeout(() => {
        window.location.href = `/blood-analyses/${result.analysis?.id}`;
      }, 2000);
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
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["/api/blood-analyses"] });
      toast({
        title: "Анализ завершен",
        description: "Ваши данные успешно обработаны с помощью ИИ",
      });
      setTextInput('');
      setIsAnalyzing(false);
      setAnalysisComplete(true);
      // Redirect to the analysis detail page after 2 seconds
      setTimeout(() => {
        window.location.href = `/blood-analyses/${result.analysis?.id}`;
      }, 2000);
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
        
        // Get the original file from Uppy result instead of downloading from URL
        const file = result.successful[0];
        console.log('File info:', file);
        
        // Use the original file data with compression
        const fileData = file.data as Blob;
        
        // Compress image if it's too large
        const compressedFile = await compressImage(fileData);
        const reader = new FileReader();
        
        reader.onloadend = async () => {
          try {
            const base64 = reader.result as string;
            const [mimeInfo, imageBase64] = base64.split(',');
            const mimeType = mimeInfo.split(':')[1].split(';')[0]; // Extract MIME type
            
            console.log('Original file type:', file.type);
            console.log('Extracted MIME type:', mimeType);
            console.log('Image size (base64):', imageBase64.length);
            
            // Use the original file type if available, fallback to extracted MIME type
            const actualMimeType = file.type || mimeType;
            
            // Validate that we have an image
            if (!actualMimeType.startsWith('image/') || imageBase64.length < 1000) {
              toast({
                title: "Ошибка",
                description: "Пожалуйста, загрузите действительное изображение (PNG, JPG, GIF, WEBP)",
                variant: "destructive",
              });
              setIsUploading(false);
              setIsAnalyzing(false);
              return;
            }
            
            // Analyze with OpenAI Vision AI
            await analyzeImageMutation.mutateAsync({
              analysisId: analysis.id,
              imageBase64,
              mimeType: actualMimeType,
            });
          } catch (error) {
            console.error("Error analyzing image:", error);
            setIsUploading(false);
            setIsAnalyzing(false);
          }
        };
        
        reader.readAsDataURL(compressedFile);
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

  if (analysisComplete) {
    return (
      <div className="eva-page">
        <MobileNav />
        
        <main className="eva-page-content min-h-screen flex flex-col items-center justify-center">
          <div className="text-center space-y-6 max-w-sm">
            <div className="w-20 h-20 bg-trust-green/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-trust-green" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Анализ завершен!</h2>
              <p className="text-muted-foreground">
                Ваши результаты успешно обработаны с помощью DeepSeek AI и сохранены в системе
              </p>
            </div>
            <div className="space-y-3">
              <Link href="/biomarkers">
                <Button className="w-full" data-testid="button-view-results">
                  <Activity className="w-4 h-4 mr-2" />
                  Посмотреть результаты
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full" data-testid="button-to-dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  На главную
                </Button>
              </Link>
            </div>
          </div>
        </main>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="eva-page">
      <MobileNav />
      
      <main className="eva-page-content">
        {/* Header */}
        <div className="bg-white sticky top-0 z-10 -mx-4 px-4 py-3 border-b border-gray-200 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-gray-100"
                  data-testid="button-back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <h1 className="text-xl font-bold">Анализ крови</h1>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>2-3 мин</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-trust-green/20 to-medical-blue/20 rounded-full flex items-center justify-center mx-auto mb-4">
              {analysisMode === 'photo' ? 
                <Camera className="w-10 h-10 text-trust-green" /> : 
                <FileText className="w-10 h-10 text-medical-blue" />
              }
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Анализ с DeepSeek AI
            </h2>
            <p className="text-muted-foreground">
              {analysisMode === 'photo' 
                ? "Загрузите фото результатов анализа для автоматической обработки"
                : "Введите данные анализа вручную для получения рекомендаций"
              }
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex mb-8 bg-gray-100 rounded-full p-1">
            <Button
              data-testid="button-photo-mode"
              variant={analysisMode === 'photo' ? 'default' : 'ghost'}
              size="sm"
              className={`flex-1 rounded-full ${analysisMode === 'photo' ? 'shadow-md' : ''}`}
              onClick={() => setAnalysisMode('photo')}
            >
              <Camera className="w-4 h-4 mr-2" />
              Фото анализа
            </Button>
            <Button
              data-testid="button-text-mode"
              variant={analysisMode === 'text' ? 'default' : 'ghost'}
              size="sm"
              className={`flex-1 rounded-full ${analysisMode === 'text' ? 'shadow-md' : ''}`}
              onClick={() => setAnalysisMode('text')}
            >
              <FileText className="w-4 h-4 mr-2" />
              Ввести вручную
            </Button>
          </div>

          <div className="space-y-6">
            {analysisMode === 'photo' ? (
              <>
                <ObjectUploader
                  maxNumberOfFiles={1}
                  maxFileSize={5242880} // 5MB (уменьшаем лимит)
                  allowedFileTypes={['image/*']}
                  onGetUploadParameters={handleGetUploadParameters}
                  onComplete={handleComplete}
                  buttonClassName="w-full p-8 border-2 border-dashed border-gray-300 hover:border-trust-green transition-colors rounded-2xl bg-gray-50 hover:bg-gray-100"
                  asButton={false}
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <Upload className="w-8 h-8 text-trust-green" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-foreground">
                        {isUploading ? "Загружаем..." : "Нажмите для загрузки"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        или перетащите файл сюда
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Только изображения: PNG, JPG, GIF, WEBP до 5MB
                    </div>
                  </div>
                </ObjectUploader>

                {/* Features */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <div className="text-blue-600 font-semibold mb-1">🔬 OCR технология</div>
                    <p className="text-xs text-gray-600">Распознает текст с любых лабораторных бланков</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-xl">
                    <div className="text-green-600 font-semibold mb-1">🤖 DeepSeek AI</div>
                    <p className="text-xs text-gray-600">Анализирует показатели и дает рекомендации</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <Textarea
                  data-testid="textarea-analysis-input"
                  placeholder="Введите данные анализа крови. Например:&#10;&#10;Гемоглобин: 138 г/л&#10;Эритроциты: 4.2×10¹²/л&#10;Лейкоциты: 6.8×10⁹/л&#10;Тромбоциты: 280×10⁹/л&#10;Глюкоза: 5.1 ммоль/л&#10;Холестерин: 4.8 ммоль/л"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="min-h-[200px] resize-none text-sm"
                  disabled={isAnalyzing}
                />
                
                {/* Example format */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-xs text-amber-800 font-medium mb-1">💡 Совет</p>
                  <p className="text-xs text-amber-700">
                    Введите показатели в формате "Название: значение единицы". 
                    ИИ распознает различные форматы и единицы измерения.
                  </p>
                </div>

                <Button
                  data-testid="button-analyze-text"
                  onClick={handleTextAnalysis}
                  disabled={isAnalyzing || !textInput.trim()}
                  className="w-full py-6 text-base"
                  size="lg"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Анализируем...
                    </>
                  ) : (
                    <>
                      <Activity className="w-5 h-5 mr-2" />
                      Анализировать с ИИ
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Processing Status */}
          {(isUploading || isAnalyzing) && (
            <div className="mt-8 p-6 bg-gradient-to-r from-trust-green/10 to-medical-blue/10 rounded-2xl">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-trust-green"></div>
                <div>
                  <p className="font-semibold text-foreground">
                    {isAnalyzing ? "Анализируем с DeepSeek AI" : "Обрабатываем файл"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isAnalyzing 
                      ? "Распознаем показатели и готовим рекомендации..." 
                      : "Загружаем и подготавливаем данные..."
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Info Cards */}
          <div className="mt-8 space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold mb-2 flex items-center">
                <span className="text-xl mr-2">🏥</span>
                Поддерживаемые лаборатории
              </h3>
              <p className="text-sm text-muted-foreground">
                Invitro, Helix, KDL, CMD, Гемотест и другие российские лаборатории
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold mb-2 flex items-center">
                <span className="text-xl mr-2">🔒</span>
                Конфиденциальность
              </h3>
              <p className="text-sm text-muted-foreground">
                Ваши данные защищены и обрабатываются только для анализа
              </p>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}