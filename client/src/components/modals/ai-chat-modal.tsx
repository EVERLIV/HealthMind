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
    if (open && sessions && sessions.length > 0) {
      setCurrentSessionId(sessions[0].id);
    } else if (open && sessions && sessions.length === 0) {
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
      <DialogContent className="max-w-md mx-auto h-[90vh] p-0 gap-0">
        <DialogTitle className="sr-only">ИИ Доктор</DialogTitle>
        <DialogDescription className="sr-only">Консультация с искусственным интеллектом</DialogDescription>
        {/* Header */}
        <div className="bg-medical-blue text-white p-4 flex items-center justify-between rounded-t-lg">
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

        {/* Messages */}
        <ScrollArea className="flex-1 p-4 max-h-96">
          <div className="space-y-4">
            {!messages || messages.length === 0 ? (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-medical-blue rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div className="bg-accent rounded-2xl rounded-tl-sm p-3 flex-1">
                  <p className="text-sm">
                    Здравствуйте! Я ваш ИИ-доктор. Как вы себя чувствуете сегодня? 
                    Могу помочь с интерпретацией анализов или ответить на вопросы о здоровье.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((msg: any) => (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-3 ${
                    msg.role === "user" ? "justify-end" : ""
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 bg-medical-blue rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`rounded-2xl p-3 max-w-xs ${
                      msg.role === "user"
                        ? "bg-medical-blue text-white rounded-tr-sm"
                        : "bg-accent rounded-tl-sm"
                    }`}
                    data-testid={`message-${msg.role}`}
                  >
                    <p className="text-sm whitespace-pre-line">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <form onSubmit={handleSendMessage} className="flex space-x-3">
            <Input
              data-testid="input-chat-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Напишите ваш вопрос..."
              className="flex-1"
              disabled={sendMessageMutation.isPending}
            />
            <Button
              data-testid="button-send-message"
              type="submit"
              disabled={!message.trim() || sendMessageMutation.isPending}
              className="bg-medical-blue hover:bg-medical-blue/90 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
