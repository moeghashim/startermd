'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Bot, User } from 'lucide-react';

interface ChatInterfaceProps {
  docs: string;
  onClose?: () => void;
}

export function ChatInterface({ docs, onClose }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  
  const { messages, sendMessage, status } = useChat();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && status !== 'streaming') {
      sendMessage({
        role: 'user' as const,
        parts: [{ type: 'text' as const, text: input }],
      }, {
        body: { docs },
      });
      setInput('');
    }
  };

  const isLoading = status === 'streaming';

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Chat with your docs</h2>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Ask me anything about your documentation!
            </CardContent>
          </Card>
        )}
        
        {messages.map((message) => (
          <Card key={message.id} className={message.role === 'user' ? 'ml-8' : 'mr-8'}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                {message.role === 'user' ? (
                  <>
                    <User className="h-4 w-4" />
                    You
                  </>
                ) : (
                  <>
                    <Bot className="h-4 w-4" />
                    Assistant
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap">
                {message.parts.map((part) => 
                  part.type === 'text' ? part.text : ''
                ).join('')}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {isLoading && (
          <Card className="mr-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Bot className="h-4 w-4" />
                Thinking...
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your docs..."
          className="flex-1 min-h-[60px]"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
