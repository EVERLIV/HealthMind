import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Send, Paperclip, Smile, Mic } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

export default function ChatPage() {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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
    
    sendMessageMutation.mutate(message.trim());
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
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="hover:bg-gray-100 text-gray-500"
              data-testid="button-attach"
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
                className="w-full pl-4 pr-24 py-3 rounded-full border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-gray-50 hover:bg-white"
                disabled={sendMessageMutation.isPending}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="hover:bg-gray-100 text-gray-500 w-8 h-8"
                  data-testid="button-emoji"
                >
                  <Smile className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="hover:bg-gray-100 text-gray-500 w-8 h-8"
                  data-testid="button-voice"
                >
                  <Mic className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <Button
              data-testid="button-send-message"
              type="submit"
              disabled={!message.trim() || sendMessageMutation.isPending}
              className="rounded-full px-4 h-10 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          
          <div className="flex items-center justify-center mt-2 space-x-4">
            <button className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
              Анализ крови
            </button>
            <span className="text-gray-300">•</span>
            <button className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
              Симптомы
            </button>
            <span className="text-gray-300">•</span>
            <button className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
              Рекомендации
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}