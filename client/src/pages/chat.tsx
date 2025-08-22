import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Send, Paperclip, Mic, MicOff } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function ChatPage() {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
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

  const createSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/chat-sessions", {
        title: "Консультация с ИИ Доктором",
      });
      return response.json();
    },
    onSuccess: (session) => {
      setCurrentSessionId(session.id);
      queryClient.invalidateQueries({ queryKey: ["/api/chat-sessions"] });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", `/api/chat-sessions/${currentSessionId}/messages`, {
        role: "user",
        content,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/chat-sessions", currentSessionId, "messages"] 
      });
      setMessage("");
      // Scroll to bottom after new message
      setTimeout(() => {
        if (scrollAreaRef.current) {
          const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
          if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
          }
        }
      }, 100);
    },
    onError: () => {
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
      setAttachedFiles(prev => [...prev, ...newFiles]);
      toast({
        title: "Файлы прикреплены",
        description: `Добавлено ${newFiles.length} файл(ов)`,
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
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">🤖</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">ИИ Доктор</h3>
                <p className="text-xs text-green-600 font-medium">● Онлайн</p>
              </div>
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
                <div className="flex space-x-3 max-w-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">🤖</span>
                  </div>
                  <div 
                    className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100"
                  >
                    <p className="text-gray-700">
                      Здравствуйте! Я ваш персональный ИИ-консультант по здоровью. 
                      Могу помочь с интерпретацией анализов, ответить на вопросы о здоровье 
                      или дать рекомендации по улучшению самочувствия. Чем могу помочь?
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              (messages as any[]).map((msg: any, index: number) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {msg.role === "user" ? (
                    <div className="max-w-lg">
                      <div
                        className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-md"
                        data-testid={`message-${msg.role}`}
                      >
                        <p className="whitespace-pre-line">{msg.content}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 text-right">
                        {new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ) : (
                    <div className="flex space-x-3 max-w-lg">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm">🤖</span>
                      </div>
                      <div>
                        <div 
                          className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100"
                          data-testid={`message-${msg.role}`}
                        >
                          <p className="text-gray-700 whitespace-pre-line">{msg.content}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
            {sendMessageMutation.isPending && (
              <div className="flex justify-start">
                <div className="flex space-x-3 max-w-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">🤖</span>
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
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