import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { chatService } from '../../services/chat.service';
import { Message } from '../../types';
import { Send, Image, Check, CheckCheck, X, Clock, AlertCircle } from 'lucide-react';

interface ChatDrawerProps {
  bookingId: string;
  counterpartName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  bookingId,
  counterpartName,
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const { socket, joinBooking, leaveBooking } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load message history & join room
  useEffect(() => {
    if (isOpen && bookingId) {
      chatService
        .getMessages(bookingId)
        .then((data) => {
          setMessages(data);
          chatService.markAsRead(bookingId).catch(() => {});
        })
        .catch(() => {});

      joinBooking(bookingId);

      return () => {
        leaveBooking(bookingId);
      };
    }
  }, [isOpen, bookingId]);

  // Listen for live socket events
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg: Message) => {
      if (msg.bookingId === bookingId) {
        setMessages((prev) => [...prev, msg]);
        if (msg.senderId !== user?.id) {
          chatService.markAsRead(bookingId).catch(() => {});
        }
      }
    };

    const handleMessagesRead = (data: { bookingId: string; userId: string }) => {
      if (data.bookingId === bookingId) {
        setMessages((prev) =>
          prev.map((m) => (m.senderId === user?.id ? { ...m, isRead: true } : m))
        );
      }
    };

    const handleUserTyping = (data: { bookingId: string }) => {
      if (data.bookingId === bookingId) {
        setIsTyping(true);
      }
    };

    const handleUserStoppedTyping = (data: { bookingId: string }) => {
      if (data.bookingId === bookingId) {
        setIsTyping(false);
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('messages_read', handleMessagesRead);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stopped_typing', handleUserStoppedTyping);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('messages_read', handleMessagesRead);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stopped_typing', handleUserStoppedTyping);
    };
  }, [socket, bookingId, user]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !selectedFile) || isSending) return;

    setIsSending(true);
    const formData = new FormData();
    formData.append('content', inputText.trim() || 'Shared attachment');
    if (selectedFile) {
      formData.append('attachment', selectedFile);
    }

    try {
      const msg = await chatService.sendMessage(bookingId, formData);
      setMessages((prev) => [...prev, msg]);
      socket?.emit('send_message', { bookingId, message: msg });
      setInputText('');
      setSelectedFile(null);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white/95 dark:bg-slate-900/90 backdrop-blur-md">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Chat: {counterpartName}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Direct booking chat & image sharing</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-slate-950/40">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
            <Clock className="w-8 h-8 text-slate-400 dark:text-slate-600 mb-2" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">No messages yet</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-500 mt-0.5">Send a message or photo regarding the electrical job.</p>
          </div>
        ) : (
          messages.map((m) => {
            const isMe = m.senderId === user?.id;
            return (
              <div
                key={m.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-3 text-xs ${
                    isMe
                      ? 'bg-volt-500 text-slate-950 font-medium rounded-br-none shadow-glow-volt'
                      : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-none border border-slate-200 dark:border-slate-700/80 shadow-sm'
                  }`}
                >
                  {m.attachmentUrl && (
                    <img
                      src={m.attachmentUrl}
                      alt="Attachment"
                      className="rounded-xl mb-2 max-h-48 w-full object-cover border border-slate-200 dark:border-slate-700"
                    />
                  )}
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 mt-1 px-1">
                  <span>
                    {new Date(m.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {isMe && (
                    <span>
                      {m.isRead ? (
                        <CheckCheck className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 inline" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-slate-400 inline" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}

        {isTyping && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 italic">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce" />
            <span>{counterpartName} is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Selected file preview */}
      {selectedFile && (
        <div className="p-2 px-4 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-800 dark:text-slate-300">
          <span className="truncate max-w-[240px] font-medium">{selectedFile.name}</span>
          <button
            onClick={() => setSelectedFile(null)}
            className="text-rose-500 dark:text-rose-400 hover:text-rose-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input Bar */}
      <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setSelectedFile(e.target.files[0]);
            }
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
          title="Attach photo or document"
        >
          <Image className="w-4 h-4" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type message here..."
          className="flex-1 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-volt-500"
        />

        <button
          type="submit"
          disabled={(!inputText.trim() && !selectedFile) || isSending}
          className="p-2.5 rounded-xl bg-volt-500 text-slate-950 font-bold hover:bg-volt-400 transition-all disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
