import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const token = () => localStorage.getItem("token");
const headers = () => ({ Authorization: `Bearer ${token()}` });

function daysUntil(date: string) {
  const diff = new Date(date).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function Modal({ title, color, onClose, children }: { title: string; color: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className={`${color} px-6 py-4 flex items-center justify-between`}>
          <h3 className="font-bold text-white text-base">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-xl transition-colors">×</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

const inp = "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 text-slate-700 bg-slate-50 transition-all";
const lbl = "block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide";

function ReminderBell({ assignments, exams }: { assignments: any[]; exams: any[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const reminders: { type: string; title: string; days: number; urgent: boolean }[] = [];
  assignments.forEach(a => {
    if (a.status === "Completed") return;
    const days = daysUntil(a.deadline);
    if (days <= 7) reminders.push({ type: "assignment", title: `${a.title} (${a.subject})`, days, urgent: days <= 2 });
  });
  exams.forEach(e => {
    const days = daysUntil(e.examDate);
    if (days <= 14 && days >= 0) reminders.push({ type: "exam", title: `${e.subject} Exam`, days, urgent: days <= 3 });
  });
  reminders.sort((a, b) => a.days - b.days);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)}
        className="relative w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
        <span className="text-xl">🔔</span>
        {reminders.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg border-2 border-white">
            {reminders.length > 9 ? "9+" : reminders.length}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-between">
            <p className="font-bold text-white text-sm">🔔 Upcoming Reminders</p>
            <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">{reminders.length} alerts</span>
          </div>
          {reminders.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-3xl mb-2">✅</p>
              <p className="text-sm text-slate-400 font-semibold">All clear!</p>
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
              {reminders.map((r, i) => (
                <div key={i} className={`px-4 py-3 flex items-center gap-3 ${r.urgent ? "bg-red-50" : "hover:bg-slate-50"}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-black ${
                    r.type === "exam" ? "bg-indigo-100 text-indigo-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {r.type === "exam" ? "🎯" : "📝"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{r.title}</p>
                    <p className={`text-xs font-bold mt-0.5 ${
                      r.days < 0 ? "text-red-500" : r.days === 0 ? "text-red-600" : r.urgent ? "text-red-500" : "text-amber-500"
                    }`}>
                      {r.days < 0 ? `Overdue by ${Math.abs(r.days)}d!` : r.days === 0 ? "Due Today! 🚨" : r.days === 1 ? "Due Tomorrow! ⚠️" : `${r.days} days left`}
                    </p>
                  </div>
                  {r.urgent && <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />}
                </div>
              ))}
            </div>
          )}
          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
            <p className="text-xs text-slate-400 text-center">Assignments ≤7 days · Exams ≤14 days</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TimeManagementPage() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"weekly" | "monthly">("weekly");
  const [assignments, setAssignments] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [toast, setToast] = useState("");

  const [showAssForm, setShowAssForm] = useState(false);
  const [editAss, setEditAss] = useState<any>(null);
  const [assForm, setAssForm] = useState({ title: "", subject: "", description: "", deadline: "", priority: "Medium" });

  const [showSessForm, setShowSessForm] = useState(false);
  const [editSess, setEditSess] = useState<any>(null);
  const [sessForm, setSessForm] = useState({ subject: "", topic: "", date: "", startTime: "", endTime: "", notes: "" });

  const [showExamForm, setShowExamForm] = useState(false);
  const [editExam, setEditExam] = useState<any>(null);
  const [examForm, setExamForm] = useState({ subject: "", examDate: "", startTime: "", venue: "", notes: "" });

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const fetchAll = async () => {
    try {
      const [a, s, e] = await Promise.all([
        axios.get(`${API}/api/time/assignments`, { headers: headers() }),
        axios.get(`${API}/api/time/study-sessions`, { headers: headers() }),
        axios.get(`${API}/api/time/exams`, { headers: headers() }),
      ]);
      setAssignments(a.data.data);
      setSessions(s.data.data);
      setExams(e.data.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchAll(); }, []);

  const saveAssignment = async () => {
    try {
      if (editAss) await axios.put(`${API}/api/time/assignments/${editAss._id}`, assForm, { headers: headers() });
      else await axios.post(`${API}/api/time/assignments`, assForm, { headers: headers() });
      showToast(editAss ? "Assignment updated!" : "Assignment added!");
      setShowAssForm(false); setEditAss(null);
      setAssForm({ title: "", subject: "", description: "", deadline: "", priority: "Medium" }); fetchAll();
    } catch (err) { console.error(err); }
  };

  const saveSession = async () => {
    try {
      if (editSess) await axios.put(`${API}/api/time/study-sessions/${editSess._id}`, sessForm, { headers: headers() });
      else await axios.post(`${API}/api/time/study-sessions`, sessForm, { headers: headers() });
      showToast(editSess ? "Session updated!" : "Session added!");
      setShowSessForm(false); setEditSess(null);
      setSessForm({ subject: "", topic: "", date: "", startTime: "", endTime: "", notes: "" }); fetchAll();
    } catch (err) { console.error(err); }
  };

  const saveExam = async () => {
    try {
      if (editExam) await axios.put(`${API}/api/time/exams/${editExam._id}`, examForm, { headers: headers() });
      else await axios.post(`${API}/api/time/exams`, examForm, { headers: headers() });
      showToast(editExam ? "Exam updated!" : "Exam added!");
      setShowExamForm(false); setEditExam(null);
      setExamForm({ subject: "", examDate: "", startTime: "", venue: "", notes: "" }); fetchAll();
    } catch (err) { console.error(err); }
  };

  const updateAssStatus = async (id: string, completed: boolean) => {
    await axios.put(`${API}/api/time/assignments/${id}`, { status: completed ? "Completed" : "Pending" }, { headers: headers() });
    fetchAll();
  };

  const weekData = () => {
    const week: any[] = [];
    const today = new Date(currentDate);
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      week.push({
        date, dateStr,
        exams: exams.filter(e => e.examDate?.split("T")[0] === dateStr),
        assignments: assignments.filter(a => a.deadline?.split("T")[0] === dateStr),
        sessions: sessions.filter(s => s.date?.split("T")[0] === dateStr),
      });
    }
    return week;
  };

  const monthlyCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    const calendar: any[] = [];
    let current = new Date(startDate);
    while (current <= lastDay || current.getDay() !== 0) {
      const dateStr = current.toISOString().split("T")[0];
      calendar.push({
        date: new Date(current), dateStr,
        isCurrentMonth: current.getMonth() === month,
        exams: exams.filter(e => e.examDate?.split("T")[0] === dateStr),
        assignments: assignments.filter(a => a.deadline?.split("T")[0] === dateStr),
        sessions: sessions.filter(s => s.date?.split("T")[0] === dateStr),
      });
      current.setDate(current.getDate() + 1);
    }
    return calendar;
  };

  const totalEvents = assignments.length + sessions.length + exams.length;
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 font-sans text-slate-800">

      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-white border border-blue-100 text-blue-700 font-bold text-sm px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2">
          <span className="w-5 h-5 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center text-xs">✓</span>
          {toast}
        </div>
      )}

      {/* Navbar — matches MainDashboard */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg shadow-md flex items-center justify-center">
              <span className="text-white font-bold text-xl leading-none">C</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-blue-700">
              Campus<span className="text-slate-800">Connect</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <ReminderBell assignments={assignments} exams={exams} />
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-all active:scale-95"
            >
              ← Back to Hub
            </button>
          </div>
        </div>
      </nav>

      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3 tracking-tight">
          {" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
           Time Management
          </span>
        </h2>
        <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">
          Manage your assignments, exams & study sessions all in one place.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

          {/* LEFT SIDEBAR */}
          <div className="lg:col-span-1 space-y-4">

            {/* Quick Add */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 space-y-2.5">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Quick Add</p>
              <button onClick={() => { setEditAss(null); setAssForm({ title: "", subject: "", description: "", deadline: "", priority: "Medium" }); setShowAssForm(true); }}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5">
                📝 Add Assignment
              </button>
              <button onClick={() => { setEditExam(null); setExamForm({ subject: "", examDate: "", startTime: "", venue: "", notes: "" }); setShowExamForm(true); }}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5">
                🎯 Add Exam
              </button>
              <button onClick={() => { setEditSess(null); setSessForm({ subject: "", topic: "", date: "", startTime: "", endTime: "", notes: "" }); setShowSessForm(true); }}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5">
                📚 Add Study Session
              </button>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Summary</p>
              <div className="space-y-2.5">
                {[
                  { label: "Assignments", value: assignments.length, color: "text-blue-600", bg: "bg-blue-50" },
                  { label: "Exams", value: exams.length, color: "text-indigo-600", bg: "bg-indigo-50" },
                  { label: "Study Sessions", value: sessions.length, color: "text-emerald-600", bg: "bg-emerald-50" },
                ].map(s => (
                  <div key={s.label} className={`${s.bg} rounded-2xl px-3 py-2.5 flex items-center justify-between`}>
                    <span className="text-sm text-slate-600 font-semibold">{s.label}</span>
                    <span className={`text-lg font-black ${s.color}`}>{s.value}</span>
                  </div>
                ))}
                <div className="bg-slate-50 rounded-2xl px-3 py-2.5 flex items-center justify-between border border-slate-200">
                  <span className="text-sm font-black text-slate-700">Total</span>
                  <span className="text-lg font-black text-slate-800">{totalEvents}</span>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Progress</p>
              <div className="space-y-3">
                {[
                  { label: "Assignments", done: assignments.filter(a => a.status === "Completed").length, total: assignments.length, color: "bg-gradient-to-r from-blue-500 to-blue-600" },
                  { label: "Study Sessions", done: sessions.filter(s => s.completed).length, total: sessions.length, color: "bg-gradient-to-r from-emerald-500 to-emerald-600" },
                ].map(p => (
                  <div key={p.label}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-600">{p.label}</span>
                      <span className="font-black text-slate-700">{p.done}/{p.total}</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${p.color} rounded-full transition-all`}
                        style={{ width: p.total > 0 ? `${(p.done / p.total) * 100}%` : "0%" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Legend</p>
              <div className="space-y-2">
                {[
                  { color: "bg-blue-500", label: "Assignment" },
                  { color: "bg-indigo-500", label: "Exam" },
                  { color: "bg-emerald-500", label: "Study Session" },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-2.5">
                    <div className={`w-3 h-3 rounded-full ${l.color} flex-shrink-0`} />
                    <span className="text-sm text-slate-600 font-medium">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* MAIN CALENDAR */}
          <div className="lg:col-span-3 space-y-5">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">

              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-black text-slate-800">
                  {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </h2>
                <div className="flex items-center gap-2">
                  <button onClick={() => {
                    const d = new Date(currentDate);
                    viewMode === "weekly" ? d.setDate(d.getDate() - 7) : d.setMonth(d.getMonth() - 1);
                    setCurrentDate(d);
                  }} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold transition-colors">←</button>
                  <button onClick={() => setCurrentDate(new Date())}
                    className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">Today</button>
                  <button onClick={() => {
                    const d = new Date(currentDate);
                    viewMode === "weekly" ? d.setDate(d.getDate() + 7) : d.setMonth(d.getMonth() + 1);
                    setCurrentDate(d);
                  }} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold transition-colors">→</button>
                  <div className="flex bg-slate-100 rounded-xl p-1 ml-2">
                    {["weekly", "monthly"].map(m => (
                      <button key={m} onClick={() => setViewMode(m as any)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${
                          viewMode === m ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        }`}>{m}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Weekly View */}
              {viewMode === "weekly" && (
                <div className="space-y-2">
                  {weekData().map((day, idx) => {
                    const isToday = day.dateStr === todayStr;
                    const hasItems = day.exams.length + day.assignments.length + day.sessions.length > 0;
                    return (
                      <div key={idx} className={`rounded-2xl border transition-all ${isToday ? "border-blue-300 bg-blue-50/50" : "border-slate-100 bg-slate-50/50"}`}>
                        <div className={`px-4 py-2 flex items-center gap-3 rounded-t-2xl ${isToday ? "bg-blue-100/80" : "bg-slate-100/80"}`}>
                          <span className={`text-sm font-black ${isToday ? "text-blue-700" : "text-slate-600"}`}>
                            {day.date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                          </span>
                          {isToday && <span className="text-[10px] bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black px-2 py-0.5 rounded-full">TODAY</span>}
                          {!hasItems && <span className="text-xs text-slate-400 ml-auto italic">No events</span>}
                        </div>
                        {hasItems && (
                          <div className="px-4 py-2 space-y-1.5">
                            {day.exams.map((exam: any) => (
                              <div key={exam._id} className="flex items-center gap-3 group">
                                <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                                <div className="flex-1 bg-white border border-indigo-100 rounded-xl px-3 py-2 flex items-center justify-between group-hover:border-indigo-300 transition-colors">
                                  <div>
                                    <span className="text-sm font-bold text-slate-800">{exam.subject}</span>
                                    <span className="text-xs text-indigo-600 ml-2 font-semibold">🕐 {exam.startTime}</span>
                                    {exam.venue && <span className="text-xs text-slate-400 ml-2">📍 {exam.venue}</span>}
                                  </div>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                    <button onClick={() => { setEditExam(exam); setExamForm({ subject: exam.subject, examDate: exam.examDate?.slice(0,10), startTime: exam.startTime, venue: exam.venue, notes: exam.notes }); setShowExamForm(true); }}
                                      className="px-2 py-0.5 text-xs font-bold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100">Edit</button>
                                    <button onClick={() => axios.delete(`${API}/api/time/exams/${exam._id}`, { headers: headers() }).then(() => { showToast("Deleted!"); fetchAll(); })}
                                      className="px-2 py-0.5 text-xs font-bold text-red-500 bg-red-50 rounded-lg hover:bg-red-100">Del</button>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {day.assignments.map((ass: any) => (
                              <div key={ass._id} className="flex items-center gap-3 group">
                                <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                                <div className={`flex-1 bg-white border rounded-xl px-3 py-2 flex items-center justify-between transition-colors ${ass.status === "Completed" ? "border-slate-100 opacity-60" : "border-blue-100 group-hover:border-blue-300"}`}>
                                  <div className="flex items-center gap-2">
                                    <button onClick={() => updateAssStatus(ass._id, ass.status !== "Completed")}
                                      className={`w-4 h-4 rounded border-2 flex items-center justify-center text-[10px] font-black transition-all flex-shrink-0 ${
                                        ass.status === "Completed" ? "bg-emerald-500 border-emerald-500 text-white" : "border-blue-400"
                                      }`}>{ass.status === "Completed" && "✓"}</button>
                                    <span className={`text-sm font-bold ${ass.status === "Completed" ? "line-through text-slate-400" : "text-slate-800"}`}>{ass.title}</span>
                                    <span className="text-xs text-blue-500 font-semibold">{ass.subject}</span>
                                  </div>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                    <button onClick={() => { setEditAss(ass); setAssForm({ title: ass.title, subject: ass.subject, description: ass.description, deadline: ass.deadline?.slice(0,10), priority: ass.priority }); setShowAssForm(true); }}
                                      className="px-2 py-0.5 text-xs font-bold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100">Edit</button>
                                    <button onClick={() => axios.delete(`${API}/api/time/assignments/${ass._id}`, { headers: headers() }).then(() => { showToast("Deleted!"); fetchAll(); })}
                                      className="px-2 py-0.5 text-xs font-bold text-red-500 bg-red-50 rounded-lg hover:bg-red-100">Del</button>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {day.sessions.map((sess: any) => (
                              <div key={sess._id} className="flex items-center gap-3 group">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                                <div className={`flex-1 bg-white border rounded-xl px-3 py-2 flex items-center justify-between transition-colors ${sess.completed ? "border-slate-100 opacity-60" : "border-emerald-100 group-hover:border-emerald-300"}`}>
                                  <div>
                                    <span className={`text-sm font-bold ${sess.completed ? "line-through text-slate-400" : "text-slate-800"}`}>{sess.topic}</span>
                                    <span className="text-xs text-emerald-600 ml-2 font-semibold">{sess.subject}</span>
                                    <span className="text-xs text-slate-400 ml-2">🕐 {sess.startTime}–{sess.endTime}</span>
                                  </div>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                    <button onClick={() => { setEditSess(sess); setSessForm({ subject: sess.subject, topic: sess.topic, date: sess.date?.slice(0,10), startTime: sess.startTime, endTime: sess.endTime, notes: sess.notes }); setShowSessForm(true); }}
                                      className="px-2 py-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100">Edit</button>
                                    <button onClick={() => axios.delete(`${API}/api/time/study-sessions/${sess._id}`, { headers: headers() }).then(() => { showToast("Deleted!"); fetchAll(); })}
                                      className="px-2 py-0.5 text-xs font-bold text-red-500 bg-red-50 rounded-lg hover:bg-red-100">Del</button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Monthly View */}
              {viewMode === "monthly" && (
                <div>
                  <div className="grid grid-cols-7 gap-1.5 mb-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                      <div key={d} className="text-center text-xs font-black text-slate-400 py-2">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1.5">
                    {monthlyCalendar().map((day, idx) => {
                      const isToday = day.dateStr === todayStr;
                      const total = day.exams.length + day.assignments.length + day.sessions.length;
                      return (
                        <div key={idx} className={`min-h-20 p-1.5 rounded-xl border transition-all ${
                          !day.isCurrentMonth ? "bg-slate-50 border-slate-100" :
                          isToday ? "bg-blue-50 border-blue-300 ring-2 ring-blue-300" :
                          "bg-white border-slate-200 hover:border-slate-300"
                        }`}>
                          <p className={`text-xs font-black mb-1 ${
                            !day.isCurrentMonth ? "text-slate-300" :
                            isToday ? "text-blue-700" : "text-slate-700"
                          }`}>{day.date.getDate()}</p>
                          <div className="space-y-0.5">
                            {day.assignments.slice(0,2).map((a: any) => (
                              <div key={a._id} className="group relative bg-blue-100 text-blue-700 text-[9px] px-1 py-0.5 rounded font-bold">
                                <span className="truncate pr-4">{a.title}</span>
                                <div className="absolute right-0 top-0 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => { setEditAss(a); setAssForm({ title: a.title, subject: a.subject, description: a.description, deadline: a.deadline?.slice(0,10), priority: a.priority }); setShowAssForm(true); }}
                                    className="w-3 h-3 bg-blue-200 hover:bg-blue-300 rounded flex items-center justify-center text-[6px]" title="Edit">✏️</button>
                                  <button onClick={() => axios.delete(`${API}/api/time/assignments/${a._id}`, { headers: headers() }).then(() => { showToast("Deleted!"); fetchAll(); })}
                                    className="w-3 h-3 bg-red-200 hover:bg-red-300 rounded flex items-center justify-center text-[6px]" title="Delete">🗑️</button>
                                </div>
                              </div>
                            ))}
                            {day.exams.slice(0,1).map((e: any) => (
                              <div key={e._id} className="bg-indigo-100 text-indigo-700 text-[9px] px-1 py-0.5 rounded font-bold truncate">{e.subject}</div>
                            ))}
                            {day.sessions.slice(0,1).map((s: any) => (
                              <div key={s._id} className="bg-emerald-100 text-emerald-700 text-[9px] px-1 py-0.5 rounded font-bold truncate">{s.topic}</div>
                            ))}
                            {total > 3 && <div className="text-[9px] text-slate-400 font-bold px-1">+{total - 3} more</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* All Tasks List */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
              <h3 className="text-base font-black text-slate-800 mb-4">All Tasks (Sorted by Date)</h3>
              <div className="space-y-2">
                {[
                  ...assignments.map(a => ({ ...a, _type: "assignment", _date: new Date(a.deadline) })),
                  ...exams.map(e => ({ ...e, _type: "exam", _date: new Date(e.examDate) })),
                  ...sessions.map(s => ({ ...s, _type: "session", _date: new Date(s.date) })),
                ].sort((a: any, b: any) => a._date - b._date)
                .map((item: any) => (
                  <div key={`${item._type}-${item._id}`} className={`group flex items-center gap-3 p-3 rounded-2xl border-l-4 transition-all hover:shadow-sm ${
                    item._type === "assignment" ? `border-blue-500 ${item.status === "Completed" ? "bg-slate-50 opacity-60" : "bg-blue-50/50"}` :
                    item._type === "exam" ? "border-indigo-500 bg-indigo-50/50" :
                    `border-emerald-500 ${item.completed ? "bg-slate-50 opacity-60" : "bg-emerald-50/50"}`
                  }`}>
                    {item._type === "assignment" && (
                      <>
                        <button onClick={() => updateAssStatus(item._id, item.status !== "Completed")}
                          className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-xs font-black transition-all ${
                            item.status === "Completed" ? "bg-emerald-500 border-emerald-500 text-white" : "border-blue-400 hover:border-blue-600"
                          }`}>{item.status === "Completed" && "✓"}</button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold ${item.status === "Completed" ? "line-through text-slate-400" : "text-slate-800"}`}>{item.title}</p>
                          <p className="text-xs text-slate-500">{item.subject} · Due {item._date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => { setEditAss(item); setAssForm({ title: item.title, subject: item.subject, description: item.description, deadline: item.deadline?.slice(0,10), priority: item.priority }); setShowAssForm(true); }}
                            className="w-6 h-6 rounded-lg bg-blue-50 hover:bg-blue-100 flex items-center justify-center text-blue-600 text-sm transition-colors" title="Edit">✏️</button>
                          <button onClick={() => axios.delete(`${API}/api/time/assignments/${item._id}`, { headers: headers() }).then(() => { showToast("Deleted!"); fetchAll(); })}
                            className="w-6 h-6 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 text-sm transition-colors" title="Delete">🗑️</button>
                        </div>
                        <span className="text-[10px] bg-blue-100 text-blue-700 font-black px-2 py-1 rounded-full flex-shrink-0">Assignment</span>
                      </>
                    )}
                    {item._type === "exam" && (
                      <>
                        <div className="w-5 h-5 rounded-full bg-indigo-200 flex-shrink-0 flex items-center justify-center text-[10px]">🎯</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800">{item.subject} Exam</p>
                          <p className="text-xs text-slate-500">{item._date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {item.startTime}{item.venue && ` · ${item.venue}`}</p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => { setEditExam(item); setExamForm({ subject: item.subject, examDate: item.examDate?.slice(0,10), startTime: item.startTime, venue: item.venue, notes: item.notes }); setShowExamForm(true); }}
                            className="w-6 h-6 rounded-lg bg-indigo-50 hover:bg-indigo-100 flex items-center justify-center text-indigo-600 text-sm transition-colors" title="Edit">✏️</button>
                          <button onClick={() => axios.delete(`${API}/api/time/exams/${item._id}`, { headers: headers() }).then(() => { showToast("Deleted!"); fetchAll(); })}
                            className="w-6 h-6 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 text-sm transition-colors" title="Delete">🗑️</button>
                        </div>
                        <span className="text-[10px] bg-indigo-100 text-indigo-700 font-black px-2 py-1 rounded-full flex-shrink-0">Exam</span>
                      </>
                    )}
                    {item._type === "session" && (
                      <>
                        <button onClick={() => axios.put(`${API}/api/time/study-sessions/${item._id}`, { completed: !item.completed }, { headers: headers() }).then(fetchAll)}
                          className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center text-xs font-black transition-all ${
                            item.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-emerald-400 hover:border-emerald-600"
                          }`}>{item.completed && "✓"}</button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold ${item.completed ? "line-through text-slate-400" : "text-slate-800"}`}>{item.topic}</p>
                          <p className="text-xs text-slate-500">{item.subject} · {item._date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {item.startTime}</p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => { setEditSess(item); setSessForm({ subject: item.subject, topic: item.topic, date: item.date?.slice(0,10), startTime: item.startTime, endTime: item.endTime, notes: item.notes }); setShowSessForm(true); }}
                            className="w-6 h-6 rounded-lg bg-emerald-50 hover:bg-emerald-100 flex items-center justify-center text-emerald-600 text-sm transition-colors" title="Edit">✏️</button>
                          <button onClick={() => axios.delete(`${API}/api/time/study-sessions/${item._id}`, { headers: headers() }).then(() => { showToast("Deleted!"); fetchAll(); })}
                            className="w-6 h-6 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 text-sm transition-colors" title="Delete">🗑️</button>
                        </div>
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 font-black px-2 py-1 rounded-full flex-shrink-0">Study</span>
                      </>
                    )}
                  </div>
                ))}
                {totalEvents === 0 && (
                  <div className="text-center py-10">
                    <p className="text-4xl mb-3">📋</p>
                    <p className="text-slate-400 font-semibold">No tasks yet! Add your first item above.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {showAssForm && (
        <Modal title={editAss ? "✏️ Edit Assignment" : "📝 New Assignment"} color="bg-gradient-to-r from-blue-600 to-blue-700" onClose={() => setShowAssForm(false)}>
          <div className="space-y-3">
            <div><label className={lbl}>Title</label>
              <input className={inp} value={assForm.title} onChange={e => setAssForm({...assForm, title: e.target.value})} placeholder="Assignment title" /></div>
            <div><label className={lbl}>Subject</label>
              <input className={inp} value={assForm.subject} onChange={e => setAssForm({...assForm, subject: e.target.value})} placeholder="e.g. Mathematics" /></div>
            <div><label className={lbl}>Description</label>
              <textarea className={inp + " resize-none"} rows={2} value={assForm.description} onChange={e => setAssForm({...assForm, description: e.target.value})} placeholder="Optional..." /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={lbl}>Deadline</label>
                <input type="date" className={inp} value={assForm.deadline} onChange={e => setAssForm({...assForm, deadline: e.target.value})} /></div>
              <div><label className={lbl}>Priority</label>
                <select className={inp} value={assForm.priority} onChange={e => setAssForm({...assForm, priority: e.target.value})}>
                  <option>Low</option><option>Medium</option><option>High</option>
                </select></div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowAssForm(false)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50">Cancel</button>
              <button onClick={saveAssignment} className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-sm font-bold shadow-md">{editAss ? "Update" : "Add"}</button>
            </div>
          </div>
        </Modal>
      )}

      {showExamForm && (
        <Modal title={editExam ? "✏️ Edit Exam" : "🎯 New Exam"} color="bg-gradient-to-r from-indigo-600 to-indigo-700" onClose={() => setShowExamForm(false)}>
          <div className="space-y-3">
            <div><label className={lbl}>Subject</label>
              <input className={inp} value={examForm.subject} onChange={e => setExamForm({...examForm, subject: e.target.value})} placeholder="e.g. Chemistry" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={lbl}>Exam Date</label>
                <input type="date" className={inp} value={examForm.examDate} onChange={e => setExamForm({...examForm, examDate: e.target.value})} /></div>
              <div><label className={lbl}>Start Time</label>
                <input type="time" className={inp} value={examForm.startTime} onChange={e => setExamForm({...examForm, startTime: e.target.value})} /></div>
            </div>
            <div><label className={lbl}>Venue</label>
              <input className={inp} value={examForm.venue} onChange={e => setExamForm({...examForm, venue: e.target.value})} placeholder="e.g. Hall A" /></div>
            <div><label className={lbl}>Notes</label>
              <textarea className={inp + " resize-none"} rows={2} value={examForm.notes} onChange={e => setExamForm({...examForm, notes: e.target.value})} placeholder="Topics to focus on..." /></div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowExamForm(false)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50">Cancel</button>
              <button onClick={saveExam} className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-sm font-bold shadow-md">{editExam ? "Update" : "Add"}</button>
            </div>
          </div>
        </Modal>
      )}

      {showSessForm && (
        <Modal title={editSess ? "✏️ Edit Session" : "📚 New Study Session"} color="bg-gradient-to-r from-emerald-500 to-emerald-600" onClose={() => setShowSessForm(false)}>
          <div className="space-y-3">
            <div><label className={lbl}>Subject</label>
              <input className={inp} value={sessForm.subject} onChange={e => setSessForm({...sessForm, subject: e.target.value})} placeholder="e.g. Physics" /></div>
            <div><label className={lbl}>Topic</label>
              <input className={inp} value={sessForm.topic} onChange={e => setSessForm({...sessForm, topic: e.target.value})} placeholder="e.g. Newton's Laws" /></div>
            <div><label className={lbl}>Date</label>
              <input type="date" className={inp} value={sessForm.date} onChange={e => setSessForm({...sessForm, date: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={lbl}>Start Time</label>
                <input type="time" className={inp} value={sessForm.startTime} onChange={e => setSessForm({...sessForm, startTime: e.target.value})} /></div>
              <div><label className={lbl}>End Time</label>
                <input type="time" className={inp} value={sessForm.endTime} onChange={e => setSessForm({...sessForm, endTime: e.target.value})} /></div>
            </div>
            <div><label className={lbl}>Notes</label>
              <textarea className={inp + " resize-none"} rows={2} value={sessForm.notes} onChange={e => setSessForm({...sessForm, notes: e.target.value})} placeholder="Optional..." /></div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowSessForm(false)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50">Cancel</button>
              <button onClick={saveSession} className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl text-sm font-bold shadow-md">{editSess ? "Update" : "Add"}</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}