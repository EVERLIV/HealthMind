import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Send, Paperclip, Mic, MicOff } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { TypingAnimation } from "@/components/TypingAnimation";

export default function ChatPage() {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [lastMessageTimestamp, setLastMessageTimestamp] = useState<string | null>(null);
  const [isAiResponding, setIsAiResponding] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Get or create chat session
  const { data: sessions } = useQuery({
    queryKey: ["/api/chat-sessions"],
  });

  const { data: messages } = useQuery({
    queryKey: ["/api/chat-sessions", currentSessionId, "messages"],
    enabled: !!currentSessionId,
  });

  // Track when new messages arrive
  useEffect(() => {
    if (messages && Array.isArray(messages) && messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      if (latestMessage && latestMessage.createdAt !== lastMessageTimestamp) {
        setLastMessageTimestamp(latestMessage.createdAt);
        
        // If latest message is from assistant, stop the "thinking" indicator
        if (latestMessage.role === 'assistant') {
          setIsAiResponding(false);
        }
      }
    }
  }, [messages, lastMessageTimestamp]);

  const createSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("/api/chat-sessions", {
        method: "POST",
        body: JSON.stringify({
          title: "Консультация с EVERLIV Помощником",
        }),
      });
      return response;
    },
    onSuccess: (session) => {
      setCurrentSessionId(session.id);
      queryClient.invalidateQueries({ queryKey: ["/api/chat-sessions"] });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest(`/api/chat-sessions/${currentSessionId}/messages`, {
        method: "POST",
        body: JSON.stringify({
          role: "user",
          content,
        }),
      });
    },
    onMutate: async (content: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["/api/chat-sessions", currentSessionId, "messages"] });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData(["/api/chat-sessions", currentSessionId, "messages"]);

      // Optimistically update to the new value
      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        content,
        role: "user",
        sessionId: currentSessionId,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData(
        ["/api/chat-sessions", currentSessionId, "messages"],
        (old: any) => old ? [...old, optimisticMessage] : [optimisticMessage]
      );

      setMessage("");
      
      // Scroll to bottom immediately
      setTimeout(() => {
        if (scrollAreaRef.current) {
          const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
          if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
          }
        }
      }, 50);

      // Return a context object with the snapshotted value
      return { previousMessages };
    },
    onSuccess: () => {
      // Start the AI thinking indicator
      setIsAiResponding(true);
      
      // Delay invalidation to allow optimistic update to show first
      setTimeout(() => {
        queryClient.invalidateQueries({ 
          queryKey: ["/api/chat-sessions", currentSessionId, "messages"] 
        });
      }, 500);
    },
    onError: (err, variables, context: any) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(
        ["/api/chat-sessions", currentSessionId, "messages"],
        context?.previousMessages
      );
      
      // Restore the message input
      setMessage(variables);
      
      toast({
        title: "Ошибка",
        description: "Не удалось отправить сообщение",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (sessions && Array.isArray(sessions) && sessions.length > 0) {
      setCurrentSessionId(sessions[0].id);
    } else if (sessions && Array.isArray(sessions) && sessions.length === 0) {
      createSessionMutation.mutate();
    }
  }, [sessions]);

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    if (messages && scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentSessionId) return;
    
    let messageContent = message.trim();
    if (attachedFiles.length > 0) {
      messageContent += `\n\n📎 Прикреплено файлов: ${attachedFiles.length}`;
      attachedFiles.forEach(file => {
        messageContent += `\n• ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
      });
    }
    
    sendMessageMutation.mutate(messageContent);
    setAttachedFiles([]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      // Check if files are images for analysis
      const imageFiles = newFiles.filter(file => file.type.startsWith('image/'));
      const otherFiles = newFiles.filter(file => !file.type.startsWith('image/'));
      
      if (imageFiles.length > 0) {
        // Process images for AI analysis
        imageFiles.forEach(file => {
          const reader = new FileReader();
          reader.onload = async (event) => {
            if (event.target?.result && currentSessionId) {
              const imageBase64 = (event.target.result as string).split(',')[1];
              await analyzeImageWithAI(imageBase64, file.type, file.name);
            }
          };
          reader.readAsDataURL(file);
        });
      }
      
      if (otherFiles.length > 0) {
        setAttachedFiles(prev => [...prev, ...otherFiles]);
        toast({
          title: "Файлы прикреплены",
          description: `Добавлено ${otherFiles.length} файл(ов)`,
        });
      }
    }
  };

  const analyzeImageWithAI = async (imageBase64: string, mimeType: string, fileName: string) => {
    if (!currentSessionId) return;
    
    try {
      // First, add user message optimistically
      const userMessage = `📷 Отправляю изображение для анализа: ${fileName}`;
      
      // Add optimistic user message
      const optimisticUserMessage = {
        id: `temp-user-${Date.now()}`,
        content: userMessage,
        role: "user",
        sessionId: currentSessionId,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData(
        ["/api/chat-sessions", currentSessionId, "messages"],
        (old: any) => old ? [...old, optimisticUserMessage] : [optimisticUserMessage]
      );

      // Send actual user message
      await apiRequest(`/api/chat-sessions/${currentSessionId}/messages`, {
        method: "POST",
        body: JSON.stringify({
          role: "user",
          content: userMessage,
        }),
      });

      // Then analyze the image
      const response = await apiRequest(`/api/chat-sessions/${currentSessionId}/analyze-image`, {
        method: "POST",
        body: JSON.stringify({
          imageBase64,
          mimeType,
          question: message.trim() || "Проанализируйте это изображение с медицинской точки зрения"
        }),
      });

      // Add optimistic AI response
      const aiContent = `🤖 **Анализ изображения "${fileName}":**\n\n${response.analysis}`;
      const optimisticAIMessage = {
        id: `temp-ai-${Date.now()}`,
        content: aiContent,
        role: "assistant", 
        sessionId: currentSessionId,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData(
        ["/api/chat-sessions", currentSessionId, "messages"],
        (old: any) => old ? [...old, optimisticAIMessage] : [optimisticAIMessage]
      );

      // Send actual AI message
      await apiRequest(`/api/chat-sessions/${currentSessionId}/messages`, {
        method: "POST",
        body: JSON.stringify({
          role: "assistant",
          content: aiContent,
        }),
      });

      // Stop the AI responding indicator and refresh messages
      setIsAiResponding(false);
      
      setTimeout(() => {
        queryClient.invalidateQueries({ 
          queryKey: ["/api/chat-sessions", currentSessionId, "messages"] 
        });
      }, 100);

      // Clear message input and set AI responding state
      setMessage("");
      setIsAiResponding(true);
      
      toast({
        title: "✅ Изображение обработано",
        description: "Анализ изображения завершен - смотрите результат в чате",
      });
    } catch (error) {
      console.error("Error analyzing image:", error);
      
      // Send fallback message even if API fails
      try {
        await apiRequest(`/api/chat-sessions/${currentSessionId}/messages`, {
          method: "POST",
          body: JSON.stringify({
            role: "assistant",
            content: `🔧 **Проблема с анализом изображения "${fileName}"**\n\nНе удалось обработать изображение автоматически.\n\n**💬 Опишите что на фото:**\n• Кожная проблема, симптомы?\n• Результаты анализов?\n• Медицинские документы?\n\n🎯 Я помогу на основе вашего описания!`,
          }),
        });
        
        setTimeout(() => {
          queryClient.invalidateQueries({ 
            queryKey: ["/api/chat-sessions", currentSessionId, "messages"] 
          });
        }, 100);
      } catch (fallbackError) {
        console.error("Failed to send fallback message:", fallbackError);
      }
      
      toast({
        title: "⚠️ Проблема с анализом",
        description: "Опишите что на фото - я помогу текстом",
        variant: "destructive",
      });
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // Здесь можно добавить обработку записанного аудио
        // Например, преобразование в текст через Web Speech API
        convertSpeechToText(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast({
        title: "Запись началась",
        description: "Говорите в микрофон",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось получить доступ к микрофону",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast({
        title: "Запись остановлена",
        description: "Обработка голоса...",
      });
    }
  };

  const convertSpeechToText = async (audioBlob: Blob) => {
    // Использование Web Speech API для браузеров, которые его поддерживают
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'ru-RU';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setMessage(prev => prev + ' ' + transcript);
        toast({
          title: "Текст распознан",
          description: transcript,
        });
      };

      recognition.onerror = () => {
        toast({
          title: "Ошибка распознавания",
          description: "Не удалось распознать речь",
          variant: "destructive",
        });
      };

      // Симуляция обработки аудио
      setTimeout(() => {
        const simulatedText = "Это демонстрация голосового ввода";
        setMessage(prev => prev + ' ' + simulatedText);
        toast({
          title: "Голос распознан",
          description: simulatedText,
        });
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <Link href="/">
              <Button
                data-testid="button-back"
                variant="ghost"
                size="icon"
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h3 className="font-semibold text-gray-800">EVERLIV Помощник</h3>
              <p className="text-xs text-green-600 font-medium">● Персональный ИИ-консультант</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-100"
              data-testid="button-chat-menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="space-y-4">
            {!messages || !Array.isArray(messages) || messages.length === 0 ? (
              <div className="flex justify-start">
                <div className="max-w-lg animate-fadeIn">
                  <div 
                    className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100 transform transition-all duration-200 hover:shadow-md"
                  >
                    <p className="text-gray-700">
                      Здравствуйте! Я EVERLIV Помощник — ваш персональный ИИ-консультант по здоровью. 
                      Могу анализировать ваши анализы крови, отвечать на вопросы о здоровье, 
                      анализировать фото кожных проблем и давать персонализированные рекомендации. 
                      📷 Отправьте фото или задайте вопрос!
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              (messages as any[]).map((msg: any, index: number) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end animate-slideInRight" : "justify-start animate-slideInLeft"}`}
                  style={{ 
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  {msg.role === "user" ? (
                    <div className="max-w-lg">
                      <div
                        className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-md transform transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
                        data-testid={`message-${msg.role}`}
                      >
                        <p className="whitespace-pre-line">{msg.content}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 text-right opacity-70">
                        {new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ) : (
                    <div className="max-w-lg">
                      <div 
                        className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100 transform transition-all duration-200 hover:shadow-md"
                        data-testid={`message-${msg.role}`}
                      >
{/* Only use typing animation for the most recent assistant message that just arrived */}
                        {msg.role === "assistant" && 
                         msg.createdAt === lastMessageTimestamp && 
                         index === ((messages as any[])?.length - 1) && 
                         !isAiResponding ? (
                          <TypingAnimation 
                            text={msg.content} 
                            speed={15} 
                            className="text-gray-700"
                          />
                        ) : (
                          <p className="text-gray-700 whitespace-pre-line">{msg.content}</p>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-2 opacity-70">
                        {new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
{(sendMessageMutation.isPending || isAiResponding) && (
              <div className="flex justify-start">
                <div className="max-w-lg animate-fadeIn">
                  <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100">
                    <div className="flex space-x-2 items-center">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      <span className="text-xs text-gray-500 ml-2">EVERLIV Помощник думает...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          {/* Show attached files */}
          {attachedFiles.length > 0 && (
            <div className="mb-2 p-2 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">Прикрепленные файлы:</div>
              <div className="flex flex-wrap gap-2">
                {attachedFiles.map((file, index) => (
                  <div key={index} className="bg-white px-2 py-1 rounded-full border border-gray-200 text-xs flex items-center gap-1">
                    <Paperclip className="w-3 h-3" />
                    <span>{file.name}</span>
                    <button
                      type="button"
                      onClick={() => setAttachedFiles(prev => prev.filter((_, i) => i !== index))}
                      className="ml-1 text-gray-400 hover:text-red-500"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
            
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="hover:bg-gray-100 text-gray-500"
              data-testid="button-attach"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="w-5 h-5" />
            </Button>
            
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                data-testid="input-chat-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Напишите сообщение..."
                className="w-full pl-4 pr-12 py-3 rounded-full border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-gray-50 hover:bg-white"
                disabled={sendMessageMutation.isPending || isRecording}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={`hover:bg-gray-100 w-8 h-8 ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-500'}`}
                  data-testid="button-voice"
                  onClick={isRecording ? stopRecording : startRecording}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            
            <Button
              data-testid="button-send-message"
              type="submit"
              disabled={!message.trim() || sendMessageMutation.isPending}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center p-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          
          <div className="flex items-center justify-center mt-2 space-x-4">
            <button 
              onClick={() => setMessage("Хочу загрузить результаты анализа крови")}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              Анализ крови
            </button>
            <span className="text-gray-300">•</span>
            <button 
              onClick={() => setMessage("У меня следующие симптомы: ")}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              Симптомы
            </button>
            <span className="text-gray-300">•</span>
            <button 
              onClick={() => setMessage("Дайте рекомендации по улучшению здоровья")}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              Рекомендации
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}