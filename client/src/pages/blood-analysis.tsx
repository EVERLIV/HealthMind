import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeft, Camera, Upload, FileText, Activity, Clock, CheckCircle, Brain, FileImage, Stethoscope, Database, Sparkles, ChevronRight, X, AlertCircle, Shield, Heart, ChevronLeft, Edit3, Save, Trash2, Plus, Calendar } from "lucide-react";
import { IconContainer, iconSizes } from "@/components/ui/icon-container";
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

interface BiomarkerField {
  id: string;
  name: string;
  value: string;
  unit: string;
  status: 'normal' | 'high' | 'low' | 'unknown';
  category: string;
  isEditing?: boolean;
}

// Функция для определения статуса показателя
function determineBiomarkerStatus(name: string, value: string, unit: string): 'normal' | 'high' | 'low' | 'unknown' {
  const numValue = parseFloat(value.replace(',', '.'));
  if (isNaN(numValue)) return 'unknown';

  // Базовые нормы для основных показателей
  const norms: Record<string, { min: number; max: number }> = {
    'гемоглобин': { min: 110, max: 190 },
    'эритроциты': { min: 4.0, max: 5.5 },
    'лейкоциты': { min: 4.0, max: 11.0 },
    'тромбоциты': { min: 150, max: 450 },
    'глюкоза': { min: 3.9, max: 6.1 },
    'холестерин': { min: 3.0, max: 5.2 },
    'креатинин': { min: 53, max: 115 },
    'гематокрит': { min: 37, max: 54 }
  };

  const normalizedName = name.toLowerCase().trim();
  for (const [key, range] of Object.entries(norms)) {
    if (normalizedName.includes(key)) {
      if (numValue < range.min) return 'low';
      if (numValue > range.max) return 'high';
      return 'normal';
    }
  }

  return 'unknown';
}

// Функция для определения категории показателя
function categorizeBiomarker(name: string): string {
  const normalizedName = name.toLowerCase();
  
  if (['гемоглобин', 'эритроциты', 'гематокрит'].some(term => normalizedName.includes(term))) {
    return 'Кровь и кислород';
  }
  if (['лейкоциты', 'нейтрофилы', 'лимфоциты', 'моноциты', 'эозинофилы', 'базофилы'].some(term => normalizedName.includes(term))) {
    return 'Иммунная система';
  }
  if (['тромбоциты'].some(term => normalizedName.includes(term))) {
    return 'Свертываемость';
  }
  if (['глюкоза', 'холестерин', 'триглицериды'].some(term => normalizedName.includes(term))) {
    return 'Биохимия';
  }
  if (['креатинин', 'мочевина'].some(term => normalizedName.includes(term))) {
    return 'Почки';
  }
  
  return 'Другие показатели';
}

// Функция парсинга распознанного текста в структурированные поля
function parseExtractedText(text: string): BiomarkerField[] {
  const lines = text.split('\n').filter(line => line.trim());
  const biomarkers: BiomarkerField[] = [];
  
  lines.forEach((line, index) => {
    // Паттерн: "Название: значение единица (референс: мин-макс)"
    const match = line.match(/^([^:]+):\s*([0-9.,]+)\s*([^(]*?)(?:\s*\(референс:\s*([^)]+)\))?/i);
    
    if (match) {
      const [, name, value, unit] = match;
      const cleanName = name.trim();
      const cleanValue = value.trim();
      const cleanUnit = unit.trim();
      
      biomarkers.push({
        id: `biomarker-${index}`,
        name: cleanName,
        value: cleanValue,
        unit: cleanUnit,
        status: determineBiomarkerStatus(cleanName, cleanValue, cleanUnit),
        category: categorizeBiomarker(cleanName),
        isEditing: false
      });
    }
  });
  
  return biomarkers;
}

export default function BloodAnalysisPage() {
  const [analysisMode, setAnalysisMode] = useState<'photo' | 'text'>('photo');
  const [textInput, setTextInput] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [showTextReview, setShowTextReview] = useState(false);
  const [showBiomarkerEditor, setShowBiomarkerEditor] = useState(false);
  const [biomarkers, setBiomarkers] = useState<BiomarkerField[]>([]);
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);
  const [analysisDate, setAnalysisDate] = useState<string>(new Date().toISOString().split('T')[0]); // Default to today
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
      console.log('Creating blood analysis entry...');
      try {
        const response = await apiRequest("/api/blood-analyses", {
          method: "POST",
          body: JSON.stringify({
            status: "pending",
            analysisDate: new Date(analysisDate).toISOString(),
          }),
        });
        console.log('Blood analysis created:', response);
        return response;
      } catch (error) {
        console.error('Failed to create blood analysis:', error);
        throw error;
      }
    },
    onError: (error: any) => {
      console.error('Create analysis mutation error:', error);
      if (error.message?.includes('Unexpected token')) {
        console.error('Got HTML instead of JSON - possible routing issue');
      }
    }
  });

  const extractTextMutation = useMutation({
    mutationFn: async ({ analysisId, imageBase64, mimeType }: { analysisId: string; imageBase64: string; mimeType?: string }) => {
      console.log('Sending extract text request...');
      const result = await apiRequest(`/api/blood-analyses/${analysisId}/extract-text`, {
        method: "POST",
        body: JSON.stringify({
          imageBase64,
          mimeType,
        }),
      });
      console.log('Extract text result:', result);
      return result;
    },
    onSuccess: (result) => {
      console.log('Extract text success, extracted text:', result.extractedText);
      updateProcessingState('idle', 0, '');
      setExtractedText(result.extractedText || '');
      
      // Парсим распознанный текст в структурированные поля
      const parsedBiomarkers = parseExtractedText(result.extractedText || '');
      setBiomarkers(parsedBiomarkers);
      setShowBiomarkerEditor(true);
      setShowTextReview(false);
      
      toast({
        title: "Текст распознан",
        description: `Найдено ${parsedBiomarkers.length} показателей. Проверьте данные перед анализом.`,
      });
    },
    onError: (error: any) => {
      console.error('Extract text error:', error);
      updateProcessingState('idle', 0, 'Ошибка распознавания');
      
      let errorMessage = "Не удалось распознать текст. Попробуйте еще раз или введите данные вручную.";
      
      // Handle specific error types
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        errorMessage = "Сессия истекла. Войдите в систему заново.";
        setTimeout(() => window.location.href = '/login', 2000);
      } else if (error.message?.includes('Service temporarily unavailable')) {
        errorMessage = "Сервис распознавания временно недоступен. Попробуйте позже.";
      }
      
      toast({
        title: "Ошибка",
        description: errorMessage,
        variant: "destructive",
      });
      setAnalysisMode('text');
    },
  });

  const analyzeTextMutation = useMutation({
    mutationFn: async ({ analysisId, text }: { analysisId: string; text: string }) => {
      return await apiRequest(`/api/blood-analyses/${analysisId}/analyze-text`, {
        method: "POST",
        body: JSON.stringify({
          text,
        }),
      });
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
        window.location.href = '/app/biomarkers';
      }, 3000);
    },
    onError: (error: any) => {
      console.error('Analyze text error:', error);
      console.error('Error details:', error.response?.data || error.message);
      updateProcessingState('idle', 0, 'Ошибка обработки');
      
      let errorMessage = "Не удалось обработать данные. Попробуйте еще раз.";
      
      // Handle auth errors
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        errorMessage = "Сессия истекла. Войдите в систему заново.";
        setTimeout(() => window.location.href = '/login', 2000);
      } else if (error.message?.includes('Service temporarily unavailable')) {
        errorMessage = "Сервис анализа временно недоступен. Попробуйте позже.";
      } else if (error.message?.includes('Unexpected token')) {
        errorMessage = "Ошибка обработки ответа сервера. Попробуйте обновить страницу.";
        console.error('Response parsing error - got HTML instead of JSON');
      }
      
      toast({
        title: "Ошибка",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleGetUploadParameters = async () => {
    try {
      console.log('Getting upload parameters...');
      const { uploadURL } = await apiRequest("/api/objects/upload", {
        method: "POST",
      });
      console.log('Got upload URL successfully');
      return {
        method: "PUT" as const,
        url: uploadURL,
      };
    } catch (error: any) {
      console.error('Upload parameters error:', error);
      
      // Handle auth errors specifically
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        toast({
          title: "Ошибка авторизации",
          description: "Сессия истекла. Пожалуйста, войдите в систему заново.",
          variant: "destructive",
        });
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        toast({
          title: "Ошибка",
          description: error.message || "Не удалось получить URL для загрузки",
          variant: "destructive",
        });
      }
      throw error;
    }
  };

  const handleComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    console.log("Upload result:", result);
    
    // Check for failed uploads
    if (result.failed && result.failed.length > 0) {
      console.error("Upload failed:", result.failed);
      toast({
        title: "Ошибка загрузки",
        description: `Не удалось загрузить файл: ${result.failed[0].error || 'Неизвестная ошибка'}`,
        variant: "destructive",
      });
      updateProcessingState('idle', 0, '');
      return;
    }
    
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
            
            updateProcessingState('recognizing', 65, 'Распознаем текст...', 'OpenAI Vision извлекает данные из изображения');
            
            // Extract text from image
            setCurrentAnalysisId(analysis.id);
            await extractTextMutation.mutateAsync({
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
        toast({
          title: "Ошибка",
          description: error instanceof Error ? error.message : "Не удалось обработать изображение",
          variant: "destructive",
        });
      }
    } else {
      console.error("No successful uploads found");
      toast({
        title: "Ошибка",
        description: "Файл не был загружен успешно. Проверьте формат и размер файла.",
        variant: "destructive",
      });
      updateProcessingState('idle', 0, '');
    }
  };

  // Функция для обновления биомаркера
  const updateBiomarker = (id: string, updates: Partial<BiomarkerField>) => {
    setBiomarkers(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  // Функция для добавления нового биомаркера
  const addNewBiomarker = () => {
    const newBiomarker: BiomarkerField = {
      id: `biomarker-new-${Date.now()}`,
      name: '',
      value: '',
      unit: '',
      status: 'unknown',
      category: 'Другие показатели',
      isEditing: true
    };
    setBiomarkers(prev => [...prev, newBiomarker]);
  };

  // Функция для удаления биомаркера
  const removeBiomarker = (id: string) => {
    setBiomarkers(prev => prev.filter(b => b.id !== id));
  };

  // Функция для подтверждения биомаркеров и отправки на анализ
  const handleConfirmBiomarkers = async () => {
    const validBiomarkers = biomarkers.filter(b => b.name.trim() && b.value.trim());
    
    if (validBiomarkers.length === 0 || !currentAnalysisId) {
      toast({
        title: "Ошибка",
        description: "Добавьте хотя бы один показатель для анализа",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Confirming biomarkers...', { currentAnalysisId, validBiomarkers: validBiomarkers.length });
      
      // Конвертируем биомаркеры обратно в текстовый формат для анализа
      const textForAnalysis = validBiomarkers.map(b => {
        return `${b.name}: ${b.value} ${b.unit}`;
      }).join('\n');

      console.log('Text for analysis:', textForAnalysis);

      // Закрываем модальное окно и показываем прогресс анализа
      setShowBiomarkerEditor(false);
      updateProcessingState('analyzing', 75, 'Анализируем данные...', 'ИИ-консультант обрабатывает биомаркеры');
      
      await analyzeTextMutation.mutateAsync({
        analysisId: currentAnalysisId,
        text: textForAnalysis,
      });
      
      console.log('Biomarkers analysis completed successfully');
      
      // Очищаем состояние после успешного анализа (это будет выполнено в onSuccess)
      setBiomarkers([]);
      setCurrentAnalysisId(null);
    } catch (error: any) {
      console.error('Ошибка анализа:', error);
      updateProcessingState('idle', 0, 'Ошибка анализа');
      
      let errorMessage = "Не удалось обработать данные. Попробуйте еще раз.";
      
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        errorMessage = "Сессия истекла. Войдите в систему заново.";
        setTimeout(() => window.location.href = '/login', 2000);
      } else if (error.message?.includes('Service temporarily unavailable')) {
        errorMessage = "Сервис анализа временно недоступен. Попробуйте позже.";
      }
      
      toast({
        title: "Ошибка",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleConfirmExtractedText = async () => {
    if (!extractedText.trim() || !currentAnalysisId) {
      toast({
        title: "Ошибка",
        description: "Нет данных для анализа",
        variant: "destructive",
      });
      return;
    }

    try {
      updateProcessingState('analyzing', 75, 'Анализируем данные...', 'ИИ-консультант обрабатывает биомаркеры');
      
      await analyzeTextMutation.mutateAsync({
        analysisId: currentAnalysisId,
        text: extractedText,
      });
      
      setShowTextReview(false);
      setExtractedText('');
      setCurrentAnalysisId(null);
    } catch (error) {
      console.error("Error analyzing text:", error);
      updateProcessingState('idle', 0, 'Ошибка анализа');
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
      console.log('Starting text analysis...');
      updateProcessingState('uploading', 20, 'Создаем запись анализа...', 'Подготавливаем данные к обработке');
      
      const analysisResponse = await createAnalysisMutation.mutateAsync();
      console.log('Analysis created:', analysisResponse);
      
      updateProcessingState('analyzing', 50, 'Обрабатываем с ИИ...', 'Извлекаем биомаркеры из вашего текста');
      
      updateProcessingState('saving', 80, 'Сохраняем биомаркеры...', 'Добавляем в "Мои биомаркеры" и "Мои анализы"');
      
      await analyzeTextMutation.mutateAsync({
        analysisId: analysisResponse.id,
        text: textInput,
      });
      
      console.log('Text analysis completed successfully');
    } catch (error: any) {
      console.error('Error analyzing text:', error);
      updateProcessingState('idle', 0, 'Ошибка обработки');
      
      let errorMessage = "Не удалось обработать данные. Попробуйте еще раз.";
      
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        errorMessage = "Сессия истекла. Войдите в систему заново.";
        setTimeout(() => window.location.href = '/login', 2000);
      } else if (error.message?.includes('Service temporarily unavailable')) {
        errorMessage = "Сервис анализа временно недоступен. Попробуйте позже.";
      }
      
      toast({
        title: "Ошибка",
        description: errorMessage,
        variant: "destructive",
      });
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
            <IconContainer size="xl" className="bg-gradient-to-br from-trust-green/20 to-medical-blue/20 text-trust-green border-trust-green/20 mx-auto">
              <CheckCircle className={iconSizes.xl} />
            </IconContainer>
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
              <Link href="/app/biomarkers">
                <Button className="w-full" data-testid="button-view-biomarkers">
                  <Activity className="w-4 h-4 mr-2" />
                  Посмотреть биомаркеры
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </Button>
              </Link>
              <Link href="/app/recommendations">
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
        {['uploading', 'recognizing', 'analyzing', 'saving'].includes(processingState.stage) && (
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
            <div className="space-y-6 mb-8">
              <div className="flex bg-gray-100 rounded-full p-1">
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
              
              {/* Analysis Date Field */}
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <label className="text-sm font-medium text-blue-900 block mb-2">
                        Дата анализа
                      </label>
                      <div className="relative">
                        <Input
                          type="date"
                          value={analysisDate}
                          onChange={(e) => setAnalysisDate(e.target.value)}
                          className="bg-white border-blue-200 focus:border-blue-400 pr-4 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:top-1/2 [&::-webkit-calendar-picker-indicator]:transform [&::-webkit-calendar-picker-indicator]:-translate-y-1/2 [&::-webkit-calendar-picker-indicator]:w-4 [&::-webkit-calendar-picker-indicator]:h-4 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60"
                          data-testid="input-analysis-date"
                          style={{
                            colorScheme: 'light'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-blue-600 mt-2 ml-11">
                    Укажите дату прохождения анализа для точного отслеживания истории
                  </p>
                </CardContent>
              </Card>
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
                          сфотографируйте камерой или перетащите файл в эту область
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


          {/* Text Review Interface */}
          {showTextReview && (
            <Card className="mt-6 border-2 border-trust-green shadow-lg">
              <CardHeader className="bg-gradient-to-r from-trust-green to-medical-blue text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Распознанный текст</h3>
                      <p className="text-white/90 text-sm">
                        Распознано {extractedText.length} символов
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      setShowTextReview(false);
                      setExtractedText('');
                      setCurrentAnalysisId(null);
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Проверьте и отредактируйте данные:
                  </label>
                  <Textarea
                    data-testid="textarea-extracted-text"
                    value={extractedText}
                    onChange={(e) => setExtractedText(e.target.value)}
                    className="min-h-[300px] text-sm font-mono"
                    placeholder="Распознанный текст появится здесь..."
                  />
                </div>
                
                {/* Stats */}
                {extractedText && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="grid grid-cols-3 gap-2 text-xs text-center">
                      <div>
                        <div className="font-semibold text-blue-900">Строк</div>
                        <div className="text-blue-600 font-bold">
                          {extractedText.split('\n').filter(line => line.trim()).length}
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold text-blue-900">Показателей</div>
                        <div className="text-blue-600 font-bold">
                          {extractedText.split('\n').filter(line => 
                            line.includes(':') && line.match(/\d+[.,]?\d*/)
                          ).length}
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold text-blue-900">Единиц</div>
                        <div className="text-blue-600 font-bold">
                          {(extractedText.match(/(г\/л|мг\/дл|ммоль\/л|мкмоль\/л|%|х10|x10)/gi) || []).length}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Buttons */}
                <div className="flex gap-2">
                  <Button
                    data-testid="button-confirm-analysis"
                    onClick={handleConfirmExtractedText}
                    disabled={!extractedText.trim() || extractedText.length < 10}
                    className="flex-1 bg-trust-green hover:bg-trust-green/90"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Анализировать с ИИ
                  </Button>
                  <Button
                    onClick={() => {
                      setShowTextReview(false);
                      setExtractedText('');
                      setCurrentAnalysisId(null);
                      setAnalysisMode('text');
                    }}
                    variant="outline"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Ручной ввод
                  </Button>
                </div>
                
                {/* Tips */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="text-sm text-amber-800">
                    <p className="font-semibold mb-1">💡 Советы:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Проверьте числовые значения</li>
                      <li>• Убедитесь в правильности единиц измерения</li>
                      <li>• Добавьте пропущенные показатели</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Modern Adaptive Biomarker Modal */}
          {showBiomarkerEditor && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
              <div className="w-full max-w-4xl max-h-full sm:max-h-[90vh] bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-8 duration-300">
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 text-white p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Activity className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl font-bold">Результаты анализа</h2>
                        <p className="text-white/90 text-sm">
                          {biomarkers.length} показателей • {biomarkers.filter(b => b.status === 'normal').length} в норме
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        setShowBiomarkerEditor(false);
                        setBiomarkers([]);
                        setCurrentAnalysisId(null);
                      }}
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20 min-h-[44px] min-w-[44px] rounded-xl"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto max-h-[calc(100vh-200px)] sm:max-h-[50vh]">
                  {/* Categories */}
                  {Object.entries(
                    biomarkers.reduce((acc, biomarker) => {
                      if (!acc[biomarker.category]) acc[biomarker.category] = [];
                      acc[biomarker.category].push(biomarker);
                      return acc;
                    }, {} as Record<string, BiomarkerField[]>)
                  ).map(([category, categoryBiomarkers]) => (
                    <div key={category} className="p-4 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">
                        {category}
                      </h3>
                      <div className="space-y-3">
                        {categoryBiomarkers.map((biomarker) => {
                          const statusColors = {
                            normal: 'bg-emerald-50 border-emerald-200 text-emerald-800',
                            high: 'bg-red-50 border-red-200 text-red-800',
                            low: 'bg-orange-50 border-orange-200 text-orange-800',
                            unknown: 'bg-gray-50 border-gray-200 text-gray-800'
                          };
                          
                          const statusIcons = {
                            normal: '✓',
                            high: '↑',
                            low: '↓',
                            unknown: '?'
                          };

                          const statusLabels = {
                            normal: 'Норма',
                            high: 'Выше нормы',
                            low: 'Ниже нормы',
                            unknown: 'Неизвестно'
                          };

                          return (
                            <div
                              key={biomarker.id}
                              className={`p-4 rounded-2xl border-2 transition-all ${statusColors[biomarker.status]} hover:shadow-md`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <Input
                                      value={biomarker.name}
                                      onChange={(e) => {
                                        const newName = e.target.value;
                                        const newStatus = determineBiomarkerStatus(newName, biomarker.value, biomarker.unit);
                                        const newCategory = categorizeBiomarker(newName);
                                        updateBiomarker(biomarker.id, { 
                                          name: newName, 
                                          status: newStatus,
                                          category: newCategory 
                                        });
                                      }}
                                      placeholder="Название показателя"
                                      className="font-medium text-gray-900 bg-transparent border-0 p-0 text-base h-auto focus:ring-0"
                                      data-testid={`input-biomarker-name-${biomarker.id}`}
                                    />
                                    <span className="text-xl font-bold">
                                      {statusIcons[biomarker.status]}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Input
                                      value={biomarker.value}
                                      onChange={(e) => {
                                        const newValue = e.target.value;
                                        const newStatus = determineBiomarkerStatus(biomarker.name, newValue, biomarker.unit);
                                        updateBiomarker(biomarker.id, { value: newValue, status: newStatus });
                                      }}
                                      placeholder="0"
                                      className="w-20 text-xl font-bold bg-transparent border-0 p-0 h-auto focus:ring-0"
                                      data-testid={`input-biomarker-value-${biomarker.id}`}
                                    />
                                    <Input
                                      value={biomarker.unit}
                                      onChange={(e) => updateBiomarker(biomarker.id, { unit: e.target.value })}
                                      placeholder="ед."
                                      className="w-16 text-sm bg-transparent border-0 p-0 h-auto focus:ring-0 text-gray-600"
                                      data-testid={`input-biomarker-unit-${biomarker.id}`}
                                    />
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/50">
                                    {statusLabels[biomarker.status]}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeBiomarker(biomarker.id)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-100 min-h-[44px] min-w-[44px] rounded-xl"
                                    data-testid={`button-delete-biomarker-${biomarker.id}`}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {/* Add New Biomarker */}
                  <div className="p-4">
                    <Button
                      variant="outline"
                      onClick={addNewBiomarker}
                      className="w-full min-h-[52px] border-2 border-dashed border-gray-300 hover:border-blue-400 text-gray-600 hover:text-blue-600 rounded-2xl"
                      data-testid="button-add-biomarker"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Добавить показатель
                    </Button>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="bg-gray-50 p-4 pb-8 sm:pb-4 border-t border-gray-100">
                  <div className="flex flex-col gap-3">
                    <Button
                      onClick={handleConfirmBiomarkers}
                      disabled={biomarkers.filter(b => b.name.trim() && b.value.trim()).length === 0}
                      className="min-h-[52px] w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white rounded-2xl shadow-lg"
                      data-testid="button-confirm-biomarkers"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Получить рекомендации ИИ
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        // Export functionality
                        const exportData = biomarkers.map(b => `${b.name}: ${b.value} ${b.unit} (${b.status})`).join('\n');
                        navigator.clipboard.writeText(exportData);
                        toast({ title: "Скопировано", description: "Результаты скопированы в буфер обмена" });
                      }}
                      className="text-sm text-gray-500 hover:text-gray-700 min-h-[44px]"
                    >
                      📋 Экспорт результатов
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Info Cards - only shown when idle */}
          {processingState.stage === 'idle' && !showTextReview && !showBiomarkerEditor && (
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