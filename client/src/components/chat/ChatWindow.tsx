import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { io, Socket } from "socket.io-client";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface Props {
  accommodationId: string;
  onClose: () => void;
}

export default function ChatWindow({ accommodationId, onClose }: Props) {
  const [messages, setMessages] = useState<any[]>([]);
  const [conversation, setConversation] = useState<any>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const myId = (user?._id || user?.id)?.toString();

  useEffect(() => {
    const init = async () => {
      try {
        // Get or create conversation
        const { data: convData } = await axios.post(
          `${API}/api/chat/conversation`,
          { accommodationId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const conv = convData.data;
        setConversation(conv);

        // Load messages
        const { data: msgData } = await axios.get(
          `${API}/api/chat/${conv._id}/messages`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(msgData.data);

        // Mark as read
        await axios.put(`${API}/api/chat/${conv._id}/read`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Socket setup
        const socket = io(API, { auth: { token } });
        socketRef.current = socket;

        socket.emit("user_online", myId);
        socket.emit("join_conversation", conv._id);

        socket.on("receive_message", (msg) => {
          const senderId = (msg.senderId?._id || msg.senderId)?.toString();
          if (senderId === myId) return; // ignore own (already added locally)
          setMessages((prev) => [...prev, msg]);
        });

        socket.on("user_typing", () => setTyping(true));
        socket.on("user_stop_typing", () => setTyping(false));
      } catch (err) {
        console.error("ChatWindow init error:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
    return () => { socketRef.current?.disconnect(); };
  }, [accommodationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !conversation) return;

    // Add locally immediately
    const tempMsg = {
      _id: Date.now().toString(),
      conversationId: conversation._id,
      senderId: { _id: myId, name: user?.name },
      message: input.trim(),
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    socketRef.current?.emit("send_message", {
      conversationId: conversation._id,
      senderId: myId,
      message: input.trim(),
    });
    setInput("");
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    socketRef.current?.emit("typing", { conversationId: conversation?._id, userId: myId });
    setTimeout(() => {
      socketRef.current?.emit("stop_typing", { conversationId: conversation?._id, userId: myId });
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md h-[520px] flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
              {conversation?.ownerId?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div>
              <p className="font-semibold text-slate-700 text-sm">
                {conversation?.ownerId?.name || "Admin"}
              </p>
              <p className="text-xs text-emerald-500">● Online</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">×</button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-slate-400 text-sm py-8">
              <p className="text-3xl mb-2">👋</p>
              Say hello to the admin!
            </div>
          ) : (
            messages.map((msg) => {
              const senderId = (msg.senderId?._id || msg.senderId)?.toString();
              const isMine = senderId === myId;
              return (
                <div key={msg._id} className={`flex items-end gap-2 ${isMine ? "justify-end" : "justify-start"}`}>
                  {!isMine && (
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600 flex-shrink-0">
                      A
                    </div>
                  )}
                  <div className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-sm ${
                    isMine ? "bg-indigo-600 text-white rounded-br-sm" : "bg-slate-100 text-slate-700 rounded-bl-sm"
                  }`}>
                    <p>{msg.message}</p>
                    <p className={`text-xs mt-0.5 ${isMine ? "text-indigo-200" : "text-slate-400"}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {isMine && (
                    <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                      {user?.name?.charAt(0)?.toUpperCase() || "S"}
                    </div>
                  )}
                </div>
              );
            })
          )}
          {typing && (
            <div className="flex justify-start">
              <div className="bg-slate-100 px-4 py-2 rounded-2xl rounded-bl-sm">
                <div className="flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-slate-100">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={handleTyping}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <button onClick={sendMessage} disabled={!input.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}