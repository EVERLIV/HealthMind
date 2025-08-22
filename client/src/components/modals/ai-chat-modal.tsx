import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, X, Send } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AIChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AIChatModal({ open, onOpenChange }: AIChatModalProps) {
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get or create chat session
  const { data: sessions } = useQuery({
    queryKey: ["/api/chat-sessions"],
    enabled: open,
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
    if (open && sessions && Array.isArray(sessions) && sessions.length > 0) {
      setCurrentSessionId(sessions[0].id);
    } else if (open && sessions && Array.isArray(sessions) && sessions.length === 0) {
      createSessionMutation.mutate();
    }
  }, [open, sessions]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentSessionId) return;
    
    sendMessageMutation.mutate(message.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto h-[90vh] p-0 gap-0 overflow-hidden">
        <DialogTitle className="sr-only">ИИ Доктор</DialogTitle>
        <DialogDescription className="sr-only">Консультация с искусственным интеллектом</DialogDescription>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">ИИ Доктор</h3>
              <p className="text-xs opacity-90">Онлайн</p>
            </div>
          </div>
          <Button
            data-testid="button-close-chat"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="p-2 hover:bg-white/20 text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Messages Area with Cloud Background */}
        <div 
          className="flex-1 relative"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            minHeight: '400px'
          }}
        >
          <ScrollArea className="h-full p-4">
            <div className="flex flex-col gap-4">
              {!messages || !Array.isArray(messages) || messages.length === 0 ? (
                <div className="flex justify-start">
                  <div 
                    className="cloud-message message-left relative bg-gray-100 text-gray-800 rounded-2xl px-4 py-3 max-w-xs shadow-lg animate-fadeInScale"
                    style={{
                      fontSize: '15px',
                      lineHeight: '1.4',
                      wordWrap: 'break-word'
                    }}
                  >
                    <div className="absolute -left-2 top-4 w-0 h-0 border-l-0 border-r-8 border-t-8 border-b-8 border-transparent border-r-gray-100"></div>
                    <p>
                      Здравствуйте! Я ваш ИИ-доктор. Как вы себя чувствуете сегодня? 
                      Могу помочь с интерпретацией анализов или ответить на вопросы о здоровье.
                    </p>
                  </div>
                </div>
              ) : (
                (messages as any[]).map((msg: any, index: number) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`cloud-message relative rounded-2xl px-4 py-3 max-w-xs shadow-lg animate-fadeInScale ${
                        msg.role === "user"
                          ? "text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                      style={{
                        fontSize: '15px',
                        lineHeight: '1.4',
                        wordWrap: 'break-word',
                        background: msg.role === "user" 
                          ? 'linear-gradient(135deg, #667eea, #764ba2)' 
                          : '#f1f3f5',
                        animationDelay: `${index * 0.1}s`
                      }}
                      data-testid={`message-${msg.role}`}
                    >
                      {/* Cloud tail */}
                      <div 
                        className={`absolute top-4 w-0 h-0 border-8 border-transparent ${
                          msg.role === "user"
                            ? "-right-2 border-l-8 border-r-0"
                            : "-left-2 border-r-8 border-l-0"
                        }`}
                        style={{
                          borderLeftColor: msg.role === "user" ? '#764ba2' : '#f1f3f5',
                          borderRightColor: msg.role === "user" ? 'transparent' : '#f1f3f5'
                        }}
                      ></div>
                      <p className="whitespace-pre-line">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200">
          <form onSubmit={handleSendMessage} className="flex space-x-3">
            <Input
              data-testid="input-chat-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Напишите ваш вопрос..."
              className="flex-1 rounded-2xl border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              disabled={sendMessageMutation.isPending}
            />
            <Button
              data-testid="button-send-message"
              type="submit"
              disabled={!message.trim() || sendMessageMutation.isPending}
              className="rounded-2xl px-6 text-white shadow-lg transition-all duration-200 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)'
              }}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
