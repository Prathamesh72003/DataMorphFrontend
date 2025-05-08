'use client';

import { useState, useRef, useEffect } from 'react';
import { marked } from 'marked';
import { BsChatDots, BsSend } from 'react-icons/bs';
import { API_BASE_URL } from '@/constants';

type Message = {
  sender: 'user' | 'bot';
  content: string;
};

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value);
  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage: Message = { sender: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
        credentials: 'include',
      });
      const data = await res.json();
      setIsTyping(false);
      if (data.reply) {
        const botMessage: Message = { sender: 'bot', content: data.reply };
        setMessages((prev) => [...prev, botMessage]);
      } else if (data.error) {
        const errorMessage: Message = { sender: 'bot', content: `Error: ${data.error}` };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      setIsTyping(false);
      const errorMessage: Message = { sender: 'bot', content: 'Sorry, there was an error processing your request.' };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-5 right-5 w-[60px] h-[60px] rounded-full bg-gradient-to-r from-[#4568dc] to-[#b06ab3] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform z-50"
        >
          <BsChatDots size={24} />
        </button>
      )}
      {isOpen && (
        <div className="fixed bottom-5 right-5 w-[350px] h-[500px] bg-white rounded-2xl shadow-lg flex flex-col z-50 border border-gray-100">
          <div className="bg-gradient-to-r from-[#4568dc] to-[#b06ab3] text-white p-4 rounded-t-2xl flex justify-between items-center">
            <h5 className="text-base font-medium m-0">Data Morph AI Assistant</h5>
            <button onClick={handleClose} className="text-white opacity-80 hover:opacity-100 text-xl">
              ×
            </button>
          </div>
          <div
            ref={messagesRef}
            className="flex-1 p-5 overflow-y-auto bg-gray-50 flex flex-col gap-3 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent"
          >
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-[#4568dc] to-[#b06ab3] text-white rounded-br-md'
                      : 'bg-white border border-gray-200 rounded-bl-md'
                  }`}
                >
                  <div dangerouslySetInnerHTML={{ __html: marked.parse(msg.content) }} />
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-bl-md shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-[#b06ab3] rounded-full animate-[bounce_1.2s_infinite_0s]"></div>
                    <div className="w-2 h-2 bg-[#b06ab3] rounded-full animate-[bounce_1.2s_infinite_0.2s]"></div>
                    <div className="w-2 h-2 bg-[#b06ab3] rounded-full animate-[bounce_1.2s_infinite_0.4s]"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about data issues..."
              className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm bg-gray-100 focus:bg-white focus:border-[#4568dc] focus:ring-2 focus:ring-[#4568dc]/10 outline-none transition-all"
            />
            <button
              onClick={handleSend}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-[#4568dc] to-[#b06ab3] text-white flex items-center justify-center hover:scale-105 transition-transform"
            >
              <BsSend size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}