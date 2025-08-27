import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Camera, Upload, FileText, Activity, Clock, CheckCircle, Brain, FileImage, Stethoscope, Database, Sparkles, ChevronRight } from "lucide-react";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { UploadResult } from "@uppy/core";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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

type ProcessingStage = 'idle' | 'uploading' | 'recognizing' | 'analyzing' | 'saving' | 'complete';

interface ProcessingState {
  stage: ProcessingStage;
  progress: number;
  message: string;
  details?: string;
}

export default function BloodAnalysisPage() {
  const [analysisMode, setAnalysisMode] = useState<'photo' | 'text'>('photo');
  const [textInput, setTextInput] = useState('');
  const [processingState, setProcessingState] = useState<ProcessingState>({
    stage: 'idle',
    progress: 0,
    message: '',
    details: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateProcessingState = (stage: ProcessingStage, progress: number, message: string, details?: string) => {
    setProcessingState({ stage, progress, message, details });
  };

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
      updateProcessingState('complete', 100, 'Анализ завершен!', 'Биомаркеры сохранены в ваш профиль');
      toast({
        title: "Анализ завершен",
        description: "Биомаркеры распознаны и сохранены в систему",
      });
      // Redirect to biomarkers page after showing success state
      setTimeout(() => {
        window.location.href = '/biomarkers';
      }, 3000);
    },
    onError: (error: any) => {
      updateProcessingState('idle', 0, 'Ошибка обработки');
      
      // Check if error suggests text input fallback
      if (error?.response?.data?.fallback === "text_input_required") {
        toast({
          title: "Переключитесь на текстовый режим",
          description: "Для анализа изображений требуется дополнительная настройка. Попробуйте ввести данные вручную в текстовом режиме.",
          variant: "destructive",
        });
        // Auto-switch to text mode
        setAnalysisMode('text');
      } else {
        toast({
          title: "Ошибка",
          description: "Не удалось обработать изображение. Попробуйте еще раз или используйте текстовый режим.",
          variant: "destructive",
        });
      }
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
      updateProcessingState('complete', 100, 'Анализ завершен!', 'Биомаркеры сохранены в ваш профиль');
      toast({
        title: "Анализ завершен",
        description: "Биомаркеры обработаны и сохранены в систему",
      });
      setTextInput('');
      // Redirect to biomarkers page after showing success state
      setTimeout(() => {
        window.location.href = '/biomarkers';
      }, 3000);
    },
    onError: () => {
      updateProcessingState('idle', 0, 'Ошибка обработки');
      toast({
        title: "Ошибка",
        description: "Не удалось обработать данные. Попробуйте еще раз.",
        variant: "destructive",
      });
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
      updateProcessingState('uploading', 20, 'Загружаем фото...', 'Подготавливаем файл к обработке');
      
      try {
        // Create blood analysis entry
        updateProcessingState('uploading', 30, 'Создаем запись анализа...', 'Сохраняем в базу данных');
        const analysis = await createAnalysisMutation.mutateAsync();
        
        // Get the original file from Uppy result
        const file = result.successful[0];
        const fileData = file.data as Blob;
        
        updateProcessingState('uploading', 50, 'Сжимаем изображение...', 'Оптимизируем для ИИ обработки');
        const compressedFile = await compressImage(fileData);
        const reader = new FileReader();
        
        reader.onloadend = async () => {
          try {
            const base64 = reader.result as string;
            const [mimeInfo, imageBase64] = base64.split(',');
            const mimeType = mimeInfo.split(':')[1].split(';')[0];
            const actualMimeType = file.type || mimeType;
            
            // Validate image
            if (!actualMimeType.startsWith('image/') || imageBase64.length < 1000) {
              toast({
                title: "Ошибка",
                description: "Пожалуйста, загрузите действительное изображение (PNG, JPG, GIF, WEBP)",
                variant: "destructive",
              });
              updateProcessingState('idle', 0, '');
              return;
            }
            
            updateProcessingState('recognizing', 65, 'Распознаем текст...', 'OpenAI Vision анализирует изображение');
            
            // Start the AI analysis
            updateProcessingState('analyzing', 75, 'Обрабатываем с ИИ...', 'Извлекаем биомаркеры и создаем рекомендации');
            
            updateProcessingState('saving', 90, 'Сохраняем биомаркеры...', 'Добавляем в "Мои биомаркеры" и "Мои анализы"');
            
            await analyzeImageMutation.mutateAsync({
              analysisId: analysis.id,
              imageBase64,
              mimeType: actualMimeType,
            });
          } catch (error) {
            console.error("Error analyzing image:", error);
            updateProcessingState('idle', 0, 'Ошибка обработки');
          }
        };
        
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error("Error processing upload:", error);
        updateProcessingState('idle', 0, 'Ошибка загрузки');
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
      updateProcessingState('uploading', 20, 'Создаем запись анализа...', 'Подготавливаем данные к обработке');
      
      const analysisResponse = await createAnalysisMutation.mutateAsync();
      
      updateProcessingState('analyzing', 50, 'Обрабатываем с ИИ...', 'Извлекаем биомаркеры из вашего текста');
      
      updateProcessingState('saving', 80, 'Сохраняем биомаркеры...', 'Добавляем в "Мои биомаркеры" и "Мои анализы"');
      
      await analyzeTextMutation.mutateAsync({
        analysisId: analysisResponse.id,
        text: textInput,
      });
    } catch (error) {
      console.error('Error analyzing text:', error);
      updateProcessingState('idle', 0, 'Ошибка обработки');
    }
  };

  // Processing stages component
  const ProcessingStages = () => {
    const stages = [
      { id: 'uploading', label: 'Загрузка', icon: Upload },
      { id: 'recognizing', label: 'Распознавание', icon: FileImage },
      { id: 'analyzing', label: 'ИИ анализ', icon: Brain },
      { id: 'saving', label: 'Сохранение', icon: Database },
    ];

    const getCurrentStageIndex = () => {
      return stages.findIndex(stage => stage.id === processingState.stage);
    };

    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">Прогресс обработки</span>
              <span className="text-muted-foreground">{processingState.progress}%</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-trust-green to-medical-blue h-2 rounded-full transition-all duration-500"
                style={{ width: `${processingState.progress}%` }}
              />
            </div>

            <div className="flex justify-between items-center">
              {stages.map((stage, index) => {
                const StageIcon = stage.icon;
                const isActive = getCurrentStageIndex() === index;
                const isCompleted = getCurrentStageIndex() > index;
                
                return (
                  <div key={stage.id} className="flex flex-col items-center space-y-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCompleted ? 'bg-trust-green text-white' :
                      isActive ? 'bg-medical-blue text-white animate-pulse' :
                      'bg-gray-200 text-gray-400'
                    }`}>
                      {isCompleted ? 
                        <CheckCircle className="w-4 h-4" /> : 
                        <StageIcon className="w-4 h-4" />
                      }
                    </div>
                    <span className={`text-xs text-center ${
                      isActive ? 'text-medical-blue font-medium' :
                      isCompleted ? 'text-trust-green font-medium' :
                      'text-gray-500'
                    }`}>
                      {stage.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {processingState.message && (
              <div className="text-center space-y-1 mt-4">
                <p className="font-medium text-foreground">{processingState.message}</p>
                {processingState.details && (
                  <p className="text-sm text-muted-foreground">{processingState.details}</p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (processingState.stage === 'complete') {
    return (
      <div className="eva-page">
        
        <main className="eva-page-content min-h-screen flex flex-col items-center justify-center">
          <div className="text-center space-y-6 max-w-sm">
            <div className="w-24 h-24 bg-gradient-to-br from-trust-green/20 to-medical-blue/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-12 h-12 text-trust-green" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Анализ завершен!</h2>
              <p className="text-muted-foreground mb-4">
                Биомаркеры успешно распознаны с помощью ИИ и сохранены в вашу медицинскую карту
              </p>
              
              <div className="bg-gradient-to-r from-trust-green/10 to-medical-blue/10 rounded-lg p-4 text-left">
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Stethoscope className="w-4 h-4 mr-2 text-trust-green" />
                    <span>Добавлено в "Мои биомаркеры"</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Activity className="w-4 h-4 mr-2 text-medical-blue" />
                    <span>Сохранено в "Мои анализы"</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Sparkles className="w-4 h-4 mr-2 text-purple-600" />
                    <span>Получены персональные рекомендации</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <Link href="/biomarkers">
                <Button className="w-full" data-testid="button-view-biomarkers">
                  <Activity className="w-4 h-4 mr-2" />
                  Посмотреть биомаркеры
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </Button>
              </Link>
              <Link href="/recommendations">
                <Button variant="outline" className="w-full" data-testid="button-view-recommendations">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Рекомендации ИИ
                  <ChevronRight className="w-4 h-4 ml-auto" />
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
      <main className="eva-page-content pt-6">
        {/* Processing indicator - shown during processing */}
        {processingState.stage !== 'idle' && processingState.stage !== 'complete' && (
          <ProcessingStages />
        )}

        {/* Main Content */}
        <div className="max-w-lg mx-auto">
          {/* Header info - only shown when idle */}
          {processingState.stage === 'idle' && (
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-trust-green/20 to-medical-blue/20 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                {analysisMode === 'photo' ? 
                  <Camera className="w-12 h-12 text-trust-green" /> : 
                  <FileText className="w-12 h-12 text-medical-blue" />
                }
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                ИИ анализ крови
              </h2>
              <p className="text-muted-foreground mb-4">
                {analysisMode === 'photo' 
                  ? "Загрузите фото — ИИ распознает текст и выделит все биомаркеры"
                  : "Введите данные — ИИ обработает и создаст персональные рекомендации"
                }
              </p>
              
              {/* Business logic explanation */}
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Brain className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-blue-900 mb-1">Что происходит с вашими данными:</p>
                      <div className="text-xs text-blue-700 space-y-1">
                        <div className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2" />
                          <span>ИИ извлекает все биомаркеры</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2" />
                          <span>Добавляем в "Мои биомаркеры"</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2" />
                          <span>Сохраняем в "Мои анализы"</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2" />
                          <span>Создаем персональные рекомендации</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Mode Toggle - only shown when idle */}
          {processingState.stage === 'idle' && (
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
          )}

          {/* Main upload/input area - only shown when idle */}
          {processingState.stage === 'idle' && (
            <div className="space-y-6">
              {analysisMode === 'photo' ? (
                <>
                  <ObjectUploader
                    maxNumberOfFiles={1}
                    maxFileSize={5242880} // 5MB
                    allowedFileTypes={['image/*']}
                    onGetUploadParameters={handleGetUploadParameters}
                    onComplete={handleComplete}
                    buttonClassName="w-full p-8 border-2 border-dashed border-gray-300 hover:border-trust-green transition-all duration-300 rounded-2xl bg-gradient-to-br from-gray-50 to-white hover:from-trust-green/5 hover:to-medical-blue/5 hover:shadow-lg"
                    asButton={false}
                  >
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-trust-green to-medical-blue rounded-full flex items-center justify-center shadow-lg">
                        <Upload className="w-10 h-10 text-white" />
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-lg text-foreground mb-2">
                          Выберите фото анализа
                        </p>
                        <p className="text-sm text-muted-foreground mb-3">
                          или перетащите файл в эту область
                        </p>
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-trust-green/10 text-trust-green text-xs font-medium">
                          <Sparkles className="w-3 h-3 mr-1" />
                          ИИ распознавание
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground bg-gray-100 px-3 py-1 rounded-full">
                        PNG, JPG, GIF, WEBP • до 5MB
                      </div>
                    </div>
                  </ObjectUploader>

                  {/* Enhanced Features */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <FileImage className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-blue-700 font-semibold text-sm">OCR технология</div>
                            <p className="text-xs text-blue-600">Распознает текст с любых лабораторных бланков</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <Brain className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <div className="text-green-700 font-semibold text-sm">ИИ анализ</div>
                            <p className="text-xs text-green-600">Анализирует показатели и дает рекомендации</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  <Card>
                    <CardContent className="p-0">
                      <Textarea
                        data-testid="textarea-analysis-input"
                        placeholder="Введите данные анализа крови. Например:\n\nГемоглобин: 138 г/л\nЭритроциты: 4.2×10¹²/л\nЛейкоциты: 6.8×10⁹/л\nТромбоциты: 280×10⁹/л\nГлюкоза: 5.1 ммоль/л\nХолестерин: 4.8 ммоль/л\nКреатинин: 85 мкмоль/л"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        className="min-h-[200px] resize-none text-sm border-0 focus:ring-0"
                      />
                    </CardContent>
                  </Card>
                  
                  {/* Smart input tips */}
                  <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-4 h-4 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-amber-900 mb-2">Умный ввод данных</p>
                          <div className="text-xs text-amber-700 space-y-1">
                            <div>• ИИ распознает различные форматы записи</div>
                            <div>• Поддержка русских и английских названий</div>
                            <div>• Автоматическое выделение биомаркеров</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Button
                    data-testid="button-analyze-text"
                    onClick={handleTextAnalysis}
                    disabled={!textInput.trim()}
                    className="w-full py-6 text-base bg-gradient-to-r from-trust-green to-medical-blue hover:from-trust-green/90 hover:to-medical-blue/90"
                    size="lg"
                  >
                    <Brain className="w-5 h-5 mr-2" />
                    Обработать с ИИ
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          )}


          {/* Info Cards - only shown when idle */}
          {processingState.stage === 'idle' && (
            <div className="mt-8 space-y-4">
              <Card className="bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Stethoscope className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-1">Поддерживаемые лаборатории</h3>
                      <p className="text-sm text-blue-700">
                        Invitro, Helix, KDL, CMD, Гемотест и другие российские лаборатории
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-900 mb-1">Полная конфиденциальность</h3>
                      <p className="text-sm text-green-700">
                        Данные защищены шифрованием и используются только для анализа
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}