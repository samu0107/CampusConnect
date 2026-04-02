import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import AccommodationForm from "../components/accommodation/AccommodationForm";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const FACILITY_ICONS: Record<string, string> = {
  WiFi: "📶", Parking: "🅿️", Kitchen: "🍳",
  "Air Conditioning": "❄️", "Hot Water": "🚿", Security: "🔒",
  "Study Room": "📚", CCTV: "📹",
  Furnished: "🛋️", "Water Included": "💧", "Electricity Included": "⚡",
};

export default function AdminAccommodationPage() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const myId = (user?._id || user?.id)?.toString();

  const [activeTab, setActiveTab] = useState<"listings" | "messages">("listings");
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState("");

  const [conversations, setConversations] = useState<any[]>([]);
  const [convLoading, setConvLoading] = useState(false);
  const [activeConv, setActiveConv] = useState<any>(null);
  const activeConvRef = useRef<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [msgInput, setMsgInput] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const fetchListings = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/accommodations?available=all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setListings(data.data);
    } catch { showToast("Failed to load listings"); }
    finally { setLoading(false); }
  };

  const fetchConversations = async () => {
    setConvLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations(data.data || []);
    } catch (err: any) {
      console.error("fetchConversations error:", err.response?.data || err.message);
    } finally { setConvLoading(false); }
  };

  useEffect(() => {
    fetchListings();
    fetchConversations();

    const socket = io(API, { auth: { token } });
    socketRef.current = socket;

    socket.emit("user_online", myId);

    socket.on("receive_message", (msg) => {
      const senderId = (msg.senderId?._id || msg.senderId)?.toString();
      // Only add to messages if it's for the active conversation and not from me
      if (msg.conversationId === activeConvRef.current?._id && senderId !== myId) {
        setMessages((prev) => [...prev, msg]);
      }
      fetchConversations(); // update unread counts
    });

    socket.on("new_message_notification", () => fetchConversations());

    return () => { socket.disconnect(); };
  }, []);

  const openConversation = async (conv: any) => {
    setActiveConv(conv);
    activeConvRef.current = conv;
    socketRef.current?.emit("join_conversation", conv._id);
    try {
      const { data } = await axios.get(`${API}/api/chat/${conv._id}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(data.data);
      await axios.put(`${API}/api/chat/${conv._id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchConversations();
    } catch (err) {
      console.error("openConversation error:", err);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!msgInput.trim() || !activeConv) return;

    const tempMsg = {
      _id: Date.now().toString(),
      conversationId: activeConv._id,
      senderId: { _id: myId, name: user?.name },
      message: msgInput.trim(),
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    socketRef.current?.emit("send_message", {
      conversationId: activeConv._id,
      senderId: myId,
      message: msgInput.trim(),
    });
    setMsgInput("");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axios.delete(`${API}/api/accommodations/${deleteTarget._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("Listing deleted successfully");
      setDeleteTarget(null);
      fetchListings();
    } catch { showToast("Failed to delete listing"); }
    finally { setDeleting(false); }
  };

  const handleSuccess = () => {
    setEditItem(null);
    setShowForm(false);
    showToast(editItem ? "Listing updated" : "Listing created");
    fetchListings();
  };

  if (editItem) {
    return (
      <div>
        <div className="bg-[#0d1117] border-b border-[#1e2535] px-6 py-3 flex items-center gap-3">
          <button onClick={() => setEditItem(null)} className="text-slate-400 hover:text-white text-sm">← Back</button>
          <div className="w-px h-4 bg-[#2a3142]" />
          <span className="text-xs text-slate-500">Editing: <span className="text-cyan-400">{editItem.title}</span></span>
        </div>
        <AccommodationForm existing={editItem} onSuccess={handleSuccess} onCancel={() => setEditItem(null)} />
      </div>
    );
  }

  if (showForm) {
    return (
      <div>
        <div className="bg-[#0d1117] border-b border-[#1e2535] px-6 py-3 flex items-center gap-3">
          <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white text-sm">← Back</button>
          <div className="w-px h-4 bg-[#2a3142]" />
          <span className="text-xs text-slate-500">New listing</span>
        </div>
        <AccommodationForm onSuccess={handleSuccess} onCancel={() => setShowForm(false)} />
      </div>
    );
  }

  const totalUnread = conversations.reduce((sum, c) => sum + (c.ownerUnread || 0), 0);

  return (
    <div className="min-h-screen bg-[#0d1117] text-white font-sans">

      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-[#141824] border border-[#2a3142] text-sm text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <span className="text-emerald-400">✓</span> {toast}
        </div>
      )}

      {/* Header */}
      <div className="border-b border-[#1e2535]">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white">Accommodation Database</h1>
            <p className="text-xs text-slate-500 mt-0.5">Live Database Connection ● <span className="text-emerald-400">● Active</span></p>
          </div>
          {activeTab === "listings" && (
            <button onClick={() => setShowForm(true)}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all flex items-center gap-2">
              + Inject New Record
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-6 flex gap-1">
          {[
            { key: "listings", label: "Listings", count: listings.length },
            { key: "messages", label: "Messages", count: totalUnread },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all ${
                activeTab === tab.key ? "border-indigo-500 text-white" : "border-transparent text-slate-500 hover:text-slate-300"
              }`}>
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                  tab.key === "messages" && totalUnread > 0 ? "bg-indigo-600 text-white" : "bg-[#2a3142] text-slate-400"
                }`}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── LISTINGS TAB ── */}
      {activeTab === "listings" && (
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "Total Listings", value: listings.length, color: "text-white" },
              { label: "Available", value: listings.filter(l => l.isAvailable && l.availableRooms > 0).length, color: "text-emerald-400" },
              { label: "Full", value: listings.filter(l => l.availableRooms === 0).length, color: "text-red-400" },
            ].map((s) => (
              <div key={s.label} className="bg-[#141824] border border-[#1e2535] rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">{s.label}</p>
                <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-[#141824] border border-[#1e2535] rounded-xl p-5 animate-pulse h-20" />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="bg-[#141824] border border-[#1e2535] rounded-xl p-16 text-center">
              <p className="text-4xl mb-3">🏚️</p>
              <p className="text-slate-400 font-semibold">No records found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {listings.map((item) => (
                <div key={item._id} className="bg-[#141824] border border-[#1e2535] hover:border-[#2a3142] rounded-xl p-5 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-[#0d1117]">
                      {item.photos?.[0] ? (
                        <img src={`${API}${item.photos[0]}`} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600 text-xl">🏠</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-white text-sm truncate">{item.title}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded tracking-wider border ${
                          item.gender === "Male" ? "bg-blue-900/30 text-blue-400 border-blue-700/30"
                          : item.gender === "Female" ? "bg-pink-900/30 text-pink-400 border-pink-700/30"
                          : "bg-emerald-900/30 text-emerald-400 border-emerald-700/30"
                        }`}>{item.gender?.toUpperCase()}</span>
                        {item.availableRooms === 0 && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded tracking-wider bg-red-900/30 text-red-400 border border-red-700/30">FULL</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="text-cyan-400 font-bold">Rs. {item.price?.toLocaleString()}/mo</span>
                        <span>📍 {item.distance} {item.distanceUnit} from uni</span>
                        <span>🚪 {item.availableRooms} rooms</span>
                      </div>
                      {item.facilities?.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {item.facilities.slice(0, 5).map((f: string) => (
                            <span key={f} className="text-[10px] bg-[#0d1117] border border-[#2a3142] text-slate-500 px-1.5 py-0.5 rounded">
                              {FACILITY_ICONS[f]} {f}
                            </span>
                          ))}
                          {item.facilities.length > 5 && (
                            <span className="text-[10px] text-slate-600 px-1.5 py-0.5">+{item.facilities.length - 5}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button onClick={() => setEditItem(item)}
                        className="px-5 py-1.5 rounded-lg border border-indigo-500/40 text-indigo-400 text-xs font-black uppercase hover:bg-indigo-600/20 transition-all">
                        EDIT
                      </button>
                      <button onClick={() => setDeleteTarget(item)}
                        className="px-5 py-1.5 rounded-lg border border-red-500/30 text-red-400 text-xs font-black uppercase hover:bg-red-600/10 transition-all">
                        DROP
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── MESSAGES TAB ── */}
      {activeTab === "messages" && (
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">

            {/* Conversation List */}
            <div className="bg-[#141824] border border-[#1e2535] rounded-xl overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-[#1e2535]">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Conversations</p>
              </div>
              <div className="flex-1 overflow-y-auto">
                {convLoading ? (
                  <div className="p-4 space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse flex gap-3">
                        <div className="w-9 h-9 bg-[#2a3142] rounded-full" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-[#2a3142] rounded w-2/3" />
                          <div className="h-2 bg-[#2a3142] rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6">
                    <p className="text-3xl mb-2">💬</p>
                    <p className="text-slate-500 text-sm">No messages yet</p>
                  </div>
                ) : (
                  conversations.map((conv) => {
                    const student = conv.studentId;
                    const unread = conv.ownerUnread || 0;
                    const isActive = activeConv?._id === conv._id;
                    return (
                      <button key={conv._id} onClick={() => openConversation(conv)}
                        className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-[#1a1f2e] transition-colors text-left border-b border-[#1e2535] ${
                          isActive ? "bg-indigo-600/10 border-l-2 border-l-indigo-500" : ""
                        }`}>
                        <div className="w-9 h-9 rounded-full bg-indigo-900/40 border border-indigo-700/30 flex items-center justify-center text-indigo-300 font-black text-sm flex-shrink-0">
                          {student?.name?.charAt(0)?.toUpperCase() || "S"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-white truncate">{student?.name || "Student"}</p>
                            {unread > 0 && (
                              <span className="bg-indigo-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full ml-1 flex-shrink-0">{unread}</span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 truncate">{conv.lastMessage || "No messages yet"}</p>
                          <p className="text-[10px] text-slate-600 mt-0.5 truncate">🏠 {conv.accommodationId?.title}</p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Chat Panel */}
            <div className="md:col-span-2 bg-[#141824] border border-[#1e2535] rounded-xl flex flex-col overflow-hidden">
              {!activeConv ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <p className="text-5xl mb-4">💬</p>
                  <p className="text-slate-400 font-semibold">Select a conversation</p>
                  <p className="text-slate-600 text-sm mt-1">Choose a student from the left</p>
                </div>
              ) : (
                <>
                  {/* Chat Header */}
                  <div className="px-5 py-3.5 border-b border-[#1e2535] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-900/40 border border-indigo-700/30 flex items-center justify-center text-indigo-300 font-black text-sm">
                        {activeConv.studentId?.name?.charAt(0)?.toUpperCase() || "S"}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{activeConv.studentId?.name || "Student"}</p>
                        <p className="text-xs text-slate-500">🏠 {activeConv.accommodationId?.title}</p>
                      </div>
                    </div>
                    <button onClick={() => { setActiveConv(null); activeConvRef.current = null; }}
                      className="text-slate-600 hover:text-slate-400 text-lg">×</button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <p className="text-3xl mb-2">👋</p>
                        <p className="text-slate-500 text-sm">No messages yet</p>
                      </div>
                    ) : (
                      messages.map((msg) => {
                        const senderId = (msg.senderId?._id || msg.senderId)?.toString();
                        const isMine = senderId === myId;
                        return (
                          <div key={msg._id} className={`flex items-end gap-2 ${isMine ? "justify-end" : "justify-start"}`}>
                            {!isMine && (
                              <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-black text-slate-300 flex-shrink-0">
                                {activeConv.studentId?.name?.charAt(0)?.toUpperCase() || "S"}
                              </div>
                            )}
                            <div className={`max-w-[70%] px-3.5 py-2 rounded-2xl text-sm ${
                              isMine ? "bg-indigo-600 text-white rounded-br-sm" : "bg-[#1e2535] text-slate-200 rounded-bl-sm"
                            }`}>
                              <p>{msg.message}</p>
                              <p className={`text-xs mt-0.5 ${isMine ? "text-indigo-300" : "text-slate-500"}`}>
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                            {isMine && (
                              <div className="w-6 h-6 rounded-full bg-indigo-700 flex items-center justify-center text-[10px] font-black text-white flex-shrink-0">
                                A
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                    <div ref={bottomRef} />
                  </div>

                  {/* Input */}
                  <div className="p-3 border-t border-[#1e2535]">
                    <div className="flex gap-2">
                      <input value={msgInput} onChange={(e) => setMsgInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        placeholder="Type a reply..."
                        className="flex-1 bg-[#0d1117] border border-[#2a3142] rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all" />
                      <button onClick={sendMessage} disabled={!msgInput.trim()}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-40">
                        Send
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#141824] border border-[#2a3142] rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-10 h-10 rounded-xl bg-red-900/30 border border-red-700/30 flex items-center justify-center flex-shrink-0 text-lg">⚠️</div>
              <div>
                <h3 className="font-black text-white text-base">Drop Record?</h3>
                <p className="text-slate-400 text-sm mt-1">
                  Permanently delete <span className="text-white font-semibold">"{deleteTarget.title}"</span>?
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#2a3142] text-slate-300 text-sm font-bold hover:bg-[#1a1f2e] transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {deleting ? "Dropping..." : "DROP RECORD"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}