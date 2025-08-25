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
      setIsUploading(false);
      setIsAnalyzing(false);
      setAnalysisComplete(true);
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
      setTextInput('');
      setIsAnalyzing(false);
      setAnalysisComplete(true);
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
                  maxFileSize={10485760} // 10MB
                  onGetUploadParameters={handleGetUploadParameters}
                  onComplete={handleComplete}
                  buttonClassName="w-full"
                >
                  <div className="w-full p-8 border-2 border-dashed border-gray-300 hover:border-trust-green transition-colors rounded-2xl bg-gray-50 hover:bg-gray-100">
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
                        PNG, JPG или PDF до 10MB
                      </div>
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