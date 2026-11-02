import React from 'react';
import { SpringStaggerGroup } from '../motion/SpringStaggerGroup';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  time: string;
  isDelivered?: boolean;
  isRead?: boolean;
}

export interface EncryptedChatStreamProps {
  messages: ChatMessage[];
  className?: string;
  width?: number | string;
  delayFrames?: number;
}

export const EncryptedChatStream: React.FC<EncryptedChatStreamProps> = ({
  messages,
  className = '',
  width = 360,
  delayFrames = 0,
}) => {
  return (
    <div className={`flex flex-col gap-3 select-none ${className}`} style={{ width }}>
      <SpringStaggerGroup delayFrames={delayFrames} staggerFrames={5} direction="up">
        {messages.map((msg) => {
          const isOutgoing = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isOutgoing ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`relative px-5 py-4 rounded-2xl max-w-[85%] text-[20px] leading-relaxed shadow-lg ${
                  isOutgoing
                    ? 'bg-[#005c4b] text-white rounded-br-xs'
                    : 'bg-white text-zinc-900 border border-zinc-200 shadow-sm rounded-bl-xs'
                }`}
              >
                <p>{msg.text}</p>

                {/* Alt Zaman ve Çift Tik Rozeti */}
                <div
                  className={`mt-1 flex items-center gap-1.5 text-[15px] justify-end ${
                    isOutgoing ? 'text-emerald-200/90' : 'text-zinc-500'
                  }`}
                >
                  <span>{msg.time}</span>
                  {isOutgoing && (
                    <span className="font-bold tracking-tighter text-[#53bdeb]">
                      {msg.isRead ? '✓✓' : msg.isDelivered ? '✓✓' : '✓'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </SpringStaggerGroup>
    </div>
  );
};
