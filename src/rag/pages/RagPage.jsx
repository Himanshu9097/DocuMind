import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileText, CloudArrowUp, PaperPlaneRight, Trash, CircleNotch, Robot, UserCircle, CaretDown, CaretUp, CaretRight, Download, ChatTeardropText, PlusCircle, Microphone, ArrowsClockwise, Copy, ShareNetwork, SpeakerHigh, Brain, List, X } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import RagLayout from '../layouts/RagLayout';
import { supabase } from '../../core/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5006';

export default function RagPage() {
  const [documents, setDocuments] = useState([]);
  const [activeDoc, setActiveDoc] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [docsExpanded, setDocsExpanded] = useState(true);
  const [chatsExpanded, setChatsExpanded] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState(null);
  const [recording, setRecording] = useState(false);
  const [audioLevels, setAudioLevels] = useState([10, 10, 10, 10, 10]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [ttsLoading, setTtsLoading] = useState(null);
  
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const animFrameRef = useRef(null);

  const speak = useCallback(async (text, messageIndex) => {
    try {
      setTtsLoading(messageIndex);
      // Strip out exports/citations brackets for cleaner speech
      const cleanText = text.replace(/\[EXPORT:[A-Z]+\]/g, '').replace(/\[\d+\]/g, '').trim();
      
      const formData = new FormData();
      formData.append('text', cleanText);
      formData.append('voice_url', 'alba');
      
      const response = await fetch('/tts-api/tts', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) throw new Error('TTS Failed');
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate AI voice');
    } finally {
      setTtsLoading(null);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
    fetchSessions();
  }, []);

  useEffect(() => {
    if (!activeSessionId) {
      setMessages([]);
      return;
    }
    const fetchMessages = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${API_URL}/rag/sessions/${activeSessionId}/messages`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setMessages(prev => {
          if (data && data.length === 0 && prev.length === 1 && prev[0].role === 'user') {
            return prev;
          }
          return data || [];
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchMessages();
  }, [activeSessionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || '';
  };

  const fetchDocuments = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/rag/documents`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setDocuments(data);
    } catch (err) {
      console.error('Failed to fetch documents', err);
    }
  };

  const fetchSessions = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/rag/sessions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setSessions(data || []);
    } catch (err) {
      console.error('Failed to fetch sessions', err);
    }
  };

  const onDrop = useCallback(async (acceptedFiles, fileRejections) => {
    if (fileRejections.length > 0) {
      toast.error('File is too large. Maximum size is 15MB.');
      return;
    }
    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    try {
      const token = await getToken();
      
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_URL}/rag/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      const data = await res.json();
      if (data.document) {
        setDocuments(prev => [data.document, ...prev]);
        toast.success('Document uploaded successfully!');
      } else if (data.error) {
        toast.error(`Error: ${data.error}\nDetails: ${data.details}`);
        console.error('Server error details:', data.stack);
      }
    } catch (err) {
      console.error('Upload failed', err);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 
      'application/pdf': ['.pdf'],
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'text/plain': ['.txt']
    },
    maxSize: 15 * 1024 * 1024,
    multiple: false
  });

  const handleExport = async (msgContent, format) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/rag/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: msgContent, format })
      });
      
      if (!res.ok) throw new Error('Export failed');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export-${Date.now()}.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error('Failed to export document');
      console.error(err);
    }
  };

  const transcribeAudio = async (audioBlob) => {
    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append("file", audioBlob, "recording.webm");

      const res = await fetch(`${API_URL}/rag/transcribe`, {
        method: "POST",
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (!res.ok) throw new Error('Transcription failed');
      const data = await res.json();
      return data.text;
    } catch (err) {
      console.error(err);
      toast.error('Voice transcription failed');
      return null;
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      
      // Set up Audio Visualizer
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 64;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const updateVisualizer = () => {
        analyser.getByteFrequencyData(dataArray);
        // Extract 5 frequency bands for a simple equalizer look
        const levels = [
          Math.max(8, dataArray[2] / 3),
          Math.max(8, dataArray[4] / 2),
          Math.max(8, dataArray[8] / 2),
          Math.max(8, dataArray[12] / 2),
          Math.max(8, dataArray[16] / 3)
        ];
        setAudioLevels(levels);
        animFrameRef.current = requestAnimationFrame(updateVisualizer);
      };
      updateVisualizer();

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setTranscribing(true);
        const text = await transcribeAudio(audioBlob);
        setTranscribing(false);
        if (text) {
          setInput(text);
          // Wait briefly for input state to settle so user can see it before they choose to send
        }
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setRecording(true);
    } catch (err) {
      toast.error('Microphone access denied or unavailable');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setRecording(false);
  };

  const handleSend = async () => {
    if (!input.trim() || documents.length === 0) return;

    const userMsgIndex = (messages.length);
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const token = await getToken();
      let currentSessionId = activeSessionId;
      if (!currentSessionId) {
        const sessRes = await fetch(`${API_URL}/rag/sessions`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const sessData = await sessRes.json();
        currentSessionId = sessData.id;
        setActiveSessionId(currentSessionId);
        setSessions(prev => [sessData, ...prev]);
      }

      const res = await fetch(`${API_URL}/rag/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          question: userMessage.content,
          sessionId: currentSessionId
        })
      });

      const data = await res.json();

      if (data.answer) {
        setMessages(prev => {
          return [...prev, {
            role: 'assistant',
            content: data.answer,
            citations: data.citations 
          }];
        });
        
        // Auto refresh title after a few seconds if it was a new session
        if (!activeSessionId) {
          setTimeout(fetchSessions, 3000);
        }
      } else if (data.error) {
        toast.error(`Error: ${data.error}\nDetails: ${data.details}`);
      }
    } catch (err) {
      console.error('Ask failed', err);
      setMessages(prev => {
        return [...prev, { role: 'assistant', content: 'Sorry, I encountered an error answering your question.' }];
      });
    } finally {
      setLoading(false);
    }
  };

  const performDeleteDoc = async (docId, t) => {
    toast.dismiss(t.id);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/rag/document/${docId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete document from server');
      
      setDocuments(prev => prev.filter(d => d._id !== docId));
      if (activeDoc?._id === docId) {
        setActiveDoc(null);
      }
      toast.success('Document deleted');
    } catch (err) {
      console.error('Delete failed', err);
      toast.error('Failed to delete document');
    }
  };

  const handleDelete = (e, docId) => {
    e.stopPropagation();
    toast((t) => (
      <div className="flex flex-col gap-3">
        <span className="font-semibold text-ink-deep">Delete this document?</span>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-[#e41e3f] text-white rounded text-sm font-bold" onClick={() => performDeleteDoc(docId, t)}>Delete</button>
          <button className="px-3 py-1.5 bg-[#f1f4f7] text-[#0a1317] rounded text-sm font-bold" onClick={() => toast.dismiss(t.id)}>Cancel</button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  const performDeleteSession = async (sessionId, t) => {
    toast.dismiss(t.id);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/rag/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete chat from server');
      
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
        setMessages([]);
      }
      toast.success('Chat history deleted');
    } catch (err) {
      console.error('Delete session failed', err);
      toast.error('Failed to delete chat history');
    }
  };

  const handleDeleteSession = (e, sessionId) => {
    e.stopPropagation();
    toast((t) => (
      <div className="flex flex-col gap-3">
        <span className="font-semibold text-ink-deep">Delete this chat history?</span>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-[#e41e3f] text-white rounded text-sm font-bold" onClick={() => performDeleteSession(sessionId, t)}>Delete</button>
          <button className="px-3 py-1.5 bg-[#f1f4f7] text-[#0a1317] rounded text-sm font-bold" onClick={() => toast.dismiss(t.id)}>Cancel</button>
        </div>
      </div>
    ), { duration: Infinity });
  };


  const renderSidebar = () => (
    <>
          {/* Document Section */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-6 pb-2 md:hidden">
              <h2 className="flex items-center gap-2 text-[15px] font-semibold text-ink-deep">
                Menu
              </h2>
              <button onClick={() => setMobileMenuOpen(false)} className="text-slate hover:text-ink-deep p-2 bg-surface-soft rounded-full">
                <X size={16} weight="bold" />
              </button>
            </div>
            <div 
              className="px-6 md:p-6 pb-4 cursor-pointer select-none flex items-center justify-between group"
              onClick={() => setDocsExpanded(!docsExpanded)}
            >
              <h2 className="flex items-center gap-2 text-[15px] font-semibold text-ink-deep">
                <FileText weight="bold" size={18} className="text-primary" />
                Document AI
              </h2>
              {docsExpanded ? <CaretUp weight="bold" className="text-slate group-hover:text-ink-deep transition-colors" /> : <CaretDown weight="bold" className="text-slate group-hover:text-ink-deep transition-colors" />}
            </div>
            
            <AnimatePresence>
              {docsExpanded && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 pb-4 flex flex-col gap-2 overflow-y-auto max-h-[30vh]"
                >
                  {documents.map(doc => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={doc._id} 
                      className="group flex items-center gap-3 p-3 rounded-2xl hover:bg-surface-soft transition-all border border-transparent hover:border-hairline-soft"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
                        <FileText weight="duotone" size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-semibold text-ink-deep truncate">{doc.originalName}</div>
                        <div className="text-[12px] text-slate">{new Date(doc.createdAt).toLocaleDateString()}</div>
                      </div>
                      <button 
                        className="opacity-0 group-hover:opacity-100 p-2 text-slate hover:text-[#e41e3f] transition-all hover:bg-white rounded-full" 
                        onClick={(e) => handleDelete(e, doc._id)}
                      >
                        <Trash weight="fill" size={16} />
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chat History Section */}
            <div className="border-t border-hairline-soft pt-4 mt-2">
              <div 
                className="px-6 pb-4 cursor-pointer select-none flex items-center justify-between group"
                onClick={() => setChatsExpanded(!chatsExpanded)}
              >
                <h2 className="flex items-center gap-2 text-[15px] font-semibold text-ink-deep">
                  <ChatTeardropText weight="bold" size={18} className="text-primary" />
                  Chat History
                </h2>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveSessionId(null); setMessages([]); }} 
                    className="text-primary hover:text-primary-deep flex items-center gap-1 text-[13px] font-bold bg-primary-soft px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-105 active:scale-95" 
                    title="New Chat"
                  >
                    <PlusCircle weight="fill" size={14}/> New
                  </button>
                  {chatsExpanded ? <CaretUp weight="bold" className="text-slate group-hover:text-ink-deep transition-colors" /> : <CaretDown weight="bold" className="text-slate group-hover:text-ink-deep transition-colors" />}
                </div>
              </div>

              <AnimatePresence>
                {chatsExpanded && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4 flex flex-col gap-2 overflow-y-auto flex-1 max-h-[30vh]"
                  >
                    {sessions.map(session => (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        key={session.id} 
                        onClick={() => setActiveSessionId(session.id)}
                        className={`group flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer border ${activeSessionId === session.id ? 'bg-surface-soft border-hairline-soft shadow-sm' : 'border-transparent hover:bg-surface-soft hover:border-hairline-soft'}`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${activeSessionId === session.id ? 'bg-primary text-white shadow-[0_4px_12px_-4px_rgba(0,112,243,0.5)]' : 'bg-surface-soft text-charcoal'}`}>
                          <ChatTeardropText weight={activeSessionId === session.id ? "fill" : "duotone"} size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-[14px] truncate ${activeSessionId === session.id ? 'font-bold text-ink-deep' : 'font-medium text-charcoal'}`}>
                            {session.title}
                          </div>
                        </div>
                        <button 
                          className="opacity-0 group-hover:opacity-100 p-2 text-slate hover:text-[#e41e3f] transition-all hover:bg-white rounded-full" 
                          onClick={(e) => handleDeleteSession(e, session.id)}
                        >
                          <Trash weight="fill" size={16} />
                        </button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Upload Dropzone */}
          <div className="p-4 bg-surface-soft border-t border-hairline-soft">
            <div 
              {...getRootProps()} 
              className={`w-full border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${isDragActive ? 'border-primary bg-primary-soft scale-[1.02]' : 'border-hairline hover:border-slate hover:bg-canvas'}`}
            >
              <input {...getInputProps()} />
              {uploading ? (
                <CircleNotch weight="bold" className="animate-spin text-primary mb-3" size={28} />
              ) : (
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                  <CloudArrowUp weight="duotone" className="text-primary" size={24} />
                </div>
              )}
              <div className="text-[13px] font-semibold text-charcoal">
                {uploading ? 'Processing Document...' : 'Drop PDF, CSV, or TXT'}
              </div>
            </div>
          </div>
    </>
  );

  return (
    <RagLayout>
      <div className="flex flex-col md:flex-row h-[100dvh] md:h-[calc(100vh-80px)] w-full max-w-[1600px] mx-auto p-4 md:p-6 gap-4 md:gap-6">
        
        {/* Mobile Backdrop */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden" 
            />
          )}
        </AnimatePresence>

        {/* Mobile Sidebar Slide Up */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 w-full h-[85vh] bg-canvas rounded-t-3xl border-t border-hairline-soft shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden z-50 md:hidden"
            >
              {renderSidebar()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="hidden md:flex w-[340px] shrink-0 bg-canvas rounded-[2.5rem] border border-hairline-soft shadow-diffusion flex-col overflow-hidden relative z-10"
        >
          {renderSidebar()}
        </motion.div>

        {/* Main Chat Area - Bento Card */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
          className="flex-1 h-full bg-canvas rounded-3xl md:rounded-[2.5rem] border border-hairline-soft shadow-diffusion flex flex-col overflow-hidden relative"
        >
          {/* Header */}
          <div className="h-20 border-b border-hairline-soft flex items-center px-6 md:px-8 bg-canvas/80 backdrop-blur-xl absolute top-0 w-full z-10">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setMobileMenuOpen(true)}
                className="w-10 h-10 flex md:hidden items-center justify-center bg-surface-soft hover:bg-hairline-soft rounded-xl text-ink-deep transition-colors border border-hairline-soft"
              >
                <List size={20} weight="bold" />
              </button>
              <div className="w-10 h-10 bg-primary-soft rounded-xl flex items-center justify-center border border-primary/10">
                <Brain weight="duotone" className="text-primary" size={24} />
              </div>
              <div>
                <h1 className="text-[18px] font-bold text-ink-deep tracking-tight">
                  DocuMind
                </h1>
                <p className="text-[13px] text-slate font-medium">Powered by Cloudflare AI</p>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-8 pt-28 pb-8 flex flex-col gap-6 scroll-smooth">
            {documents.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto opacity-60">
                <div className="w-20 h-20 bg-surface-soft rounded-3xl flex items-center justify-center mb-6">
                  <Brain weight="duotone" className="text-charcoal" size={40} />
                </div>
                <h3 className="text-[20px] font-bold text-ink-deep mb-2">Workspace Empty</h3>
                <p className="text-[15px] text-charcoal">Drag and drop a PDF on the left sidebar to start extracting insights and asking questions.</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto">
                <div className="w-20 h-20 bg-primary-soft border border-primary/10 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
                  <Brain weight="duotone" className="text-primary" size={40} />
                </div>
                <h3 className="text-[20px] font-bold text-ink-deep mb-2">DocuMind is ready</h3>
                <p className="text-[15px] text-charcoal">Ask anything about your {documents.length} uploaded document(s). Try asking for a summary or specific clause.</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                    key={i} 
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full group`}
                  >
                    <div className={`flex gap-2 md:gap-4 w-full md:max-w-[80%] max-w-[95%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      {msg.role !== 'user' && (
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-surface-soft flex items-center justify-center shrink-0 border border-hairline-soft mt-1">
                          <Brain weight="duotone" className="text-primary w-4 h-4 md:w-5 md:h-5" />
                        </div>
                      )}
                      
                      <div className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`p-5 rounded-[1.5rem] shadow-sm text-[15px] leading-relaxed ${
                          msg.role === 'user' 
                            ? 'bg-ink-deep text-canvas rounded-tr-sm' 
                            : 'bg-surface-soft text-ink-deep rounded-tl-sm border border-hairline-soft'
                        }`}>
                          {msg.role === 'user' ? (
                            <div>{msg.content}</div>
                          ) : (
                            <div className="prose prose-sm dark:prose-invert prose-p:leading-relaxed max-w-none">
                              {(msg.content.includes('[EXPORT:PDF]') || msg.content.includes('[EXPORT:DOCX]')) && (
                                <div className="flex gap-2 mb-4 border-b border-hairline-soft pb-3">
                                  {msg.content.includes('[EXPORT:PDF]') && (
                                    <button onClick={() => handleExport(msg.content.replace(/\[EXPORT:PDF\]/g, '').replace(/\[EXPORT:DOCX\]/g, '').trim(), 'pdf')} className="text-[12px] font-bold text-white bg-[#ef4444] hover:bg-[#dc2626] px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"><Download weight="bold" size={14}/> PDF</button>
                                  )}
                                  {msg.content.includes('[EXPORT:DOCX]') && (
                                    <button onClick={() => handleExport(msg.content.replace(/\[EXPORT:PDF\]/g, '').replace(/\[EXPORT:DOCX\]/g, '').trim(), 'docx')} className="text-[12px] font-bold text-white bg-[#2563eb] hover:bg-[#1d4ed8] px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"><Download weight="bold" size={14}/> DOCX</button>
                                  )}
                                </div>
                              )}
                              <ReactMarkdown 
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  a: ({ node, ...props }) => {
                                    if (props.href?.startsWith('#cite-')) {
                                      const id = parseInt(props.href.replace('#cite-', ''));
                                      const citation = msg.citations?.find(c => c.id === id);
                                      return (
                                        <button 
                                          onClick={(e) => { e.preventDefault(); if(citation) setSelectedCitation(citation); }}
                                          className="inline-flex items-center justify-center px-2 py-0.5 mx-1 text-[11px] font-bold text-primary bg-primary-soft hover:bg-primary hover:text-white rounded-md transition-colors cursor-pointer border border-primary/20 align-super"
                                        >
                                          {props.children}
                                        </button>
                                      );
                                    }
                                    return <a {...props} className="text-primary hover:underline font-medium" />;
                                  },
                                  p: ({node, ...props}) => <p className="mb-4 last:mb-0" {...props} />,
                                  ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-2" {...props} />,
                                  ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4 space-y-2" {...props} />,
                                  h3: ({node, ...props}) => <h3 className="text-lg font-bold mt-6 mb-3" {...props} />,
                                  h4: ({node, ...props}) => <h4 className="text-base font-bold mt-4 mb-2" {...props} />,
                                  table: ({node, ...props}) => <div className="overflow-x-auto my-4 rounded-lg border border-hairline-soft"><table className="w-full text-left border-collapse text-[13px]" {...props} /></div>,
                                  thead: ({node, ...props}) => <thead className="bg-surface-soft text-ink-deep border-b border-hairline-soft" {...props} />,
                                  th: ({node, ...props}) => <th className="px-4 py-3 font-semibold border-r border-hairline-soft last:border-r-0" {...props} />,
                                  td: ({node, ...props}) => <td className="px-4 py-3 border-r border-t border-hairline-soft last:border-r-0 text-charcoal" {...props} />
                                }}
                              >
                                {msg.content.replace(/\[EXPORT:PDF\]/g, '').replace(/\[EXPORT:DOCX\]/g, '').replace(/\[(\d+)\]/g, '[$1](#cite-$1)').trim()}
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>
                        {msg.role === 'assistant' && (
                          <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1 ml-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => speak(msg.content, i)}
                              className={`transition-colors flex items-center gap-1.5 text-[11px] font-medium ${ttsLoading === i ? 'text-primary' : 'text-slate hover:text-primary'}`}
                              title="Read aloud"
                              disabled={ttsLoading === i}
                            >
                              {ttsLoading === i ? (
                                <CircleNotch weight="bold" size={14} className="animate-spin" />
                              ) : (
                                <SpeakerHigh weight="fill" size={14} />
                              )}
                              <span className="hidden sm:inline">{ttsLoading === i ? 'Generating...' : 'Speaker'}</span>
                            </button>
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(msg.content);
                                toast.success("Copied to clipboard!");
                              }}
                              className="text-slate hover:text-primary transition-colors flex items-center gap-1.5 text-[11px] font-medium"
                              title="Copy text"
                            >
                              <Copy size={14} weight="bold" /> Copy
                            </button>
                            <button 
                              onClick={() => {
                                if (navigator.share) {
                                  navigator.share({ title: 'AI Response', text: msg.content }).catch(() => {});
                                } else {
                                  toast("Sharing not supported on this browser.");
                                }
                              }}
                              className="text-slate hover:text-primary transition-colors flex items-center gap-1.5 text-[11px] font-medium"
                              title="Share"
                            >
                              <ShareNetwork size={14} weight="bold" /> Share
                            </button>
                            <button 
                              onClick={() => {
                                // Find previous user message
                                const prevUserMsg = messages[i - 1];
                                if (prevUserMsg && prevUserMsg.role === 'user') {
                                  setInput(prevUserMsg.content);
                                  toast("Query restored. Click send to regenerate.");
                                }
                              }}
                              className="text-slate hover:text-primary transition-colors flex items-center gap-1.5 text-[11px] font-medium"
                              title="Regenerate"
                            >
                              <ArrowsClockwise size={14} weight="bold" /> Regenerate
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {loading && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start w-full"
                  >
                    <div className="flex gap-2 md:gap-4 w-full md:max-w-[80%] max-w-[95%]">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-surface-soft flex items-center justify-center shrink-0 border border-hairline-soft mt-1">
                        <Brain weight="duotone" className="text-primary w-4 h-4 md:w-5 md:h-5" />
                      </div>
                      <div className="p-5 rounded-[1.5rem] rounded-tl-sm bg-surface-soft border border-hairline-soft text-ink-deep flex items-center h-[56px] shadow-sm">
                        <motion.div
                           animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                           transition={{ duration: 2, ease: "linear", repeat: Infinity }}
                           style={{ backgroundSize: "200% 200%" }}
                           className="text-transparent bg-clip-text font-bold bg-gradient-to-r from-slate via-ink-deep to-slate flex items-center gap-2"
                        >
                          <CircleNotch weight="bold" className="animate-spin text-charcoal" size={16} /> Thinking...
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 bg-canvas border-t border-hairline-soft">
            <div className={`relative flex items-end bg-surface-soft rounded-[1.5rem] border transition-colors ${documents.length > 0 ? 'border-hairline hover:border-slate focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 focus-within:bg-canvas' : 'border-hairline-soft opacity-50 cursor-not-allowed'}`}>
              <textarea
                className={`w-full max-h-[200px] min-h-[56px] bg-transparent border-none outline-none shadow-none focus:outline-none focus:ring-0 focus:border-transparent resize-none py-4 pl-4 md:pl-6 pr-[90px] md:pr-[110px] text-[14px] md:text-[15px] text-ink-deep placeholder-slate font-medium appearance-none ${recording || transcribing ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                placeholder={documents.length > 0 ? "Ask a question about your documents..." : "Upload a document to ask questions..."}
                value={input}
                disabled={documents.length === 0}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                rows={1}
              />
              
              {/* Recording Visualizer Overlay */}
              {recording && (
                <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-[3px]">
                  {audioLevels.map((level, i) => (
                    <div 
                      key={i} 
                      className="w-1.5 bg-red-500 rounded-full transition-all duration-75" 
                      style={{ height: `${level}px` }} 
                    />
                  ))}
                  <span className="text-[14px] font-bold text-red-500 ml-3 animate-pulse tracking-wide">Listening...</span>
                </div>
              )}

              {/* Transcribing Overlay */}
              {transcribing && (
                <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <CircleNotch weight="bold" className="animate-spin text-primary" size={18} />
                  <span className="text-[14px] font-bold text-primary tracking-wide">Transcribing...</span>
                </div>
              )}

              <div className="absolute right-2 bottom-2 flex items-center gap-2">
                <button 
                  onClick={recording ? stopRecording : startRecording}
                  disabled={loading || transcribing || documents.length === 0}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${recording ? 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-surface-soft text-charcoal hover:bg-hairline hover:text-ink-deep'}`}
                  title={recording ? "Stop recording" : "Record voice"}
                >
                  <Microphone weight={recording ? "fill" : "duotone"} size={20} />
                </button>
                <button 
                  id="chat-send-btn"
                  onClick={handleSend}
                  disabled={!input.trim() || documents.length === 0 || loading || transcribing}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${!input.trim() || documents.length === 0 || loading || transcribing ? 'bg-hairline text-slate' : 'bg-primary text-white hover:bg-primary-deep hover:scale-105 active:scale-95 shadow-sm'}`}
                >
                  {loading ? <CircleNotch weight="bold" className="animate-spin" size={20} /> : <PaperPlaneRight weight="fill" size={20} />}
                </button>
              </div>
            </div>
            <div className="text-center mt-3 text-[11px] font-medium text-slate">
              AI can make mistakes. Always double check generated answers against the source document.
            </div>
          </div>
        </motion.div>

        {/* Citations Pane - Conditional */}
        <AnimatePresence>
          {selectedCitation && (
            <motion.div 
              initial={{ opacity: 0, x: 20, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 340 }}
              exit={{ opacity: 0, x: 20, width: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="bg-canvas rounded-[2.5rem] border border-hairline-soft shadow-diffusion flex flex-col overflow-hidden relative"
            >
              <div className="p-6 border-b border-hairline-soft flex items-center justify-between bg-surface-soft">
                <h3 className="font-bold text-[15px] text-ink-deep flex items-center gap-2 uppercase tracking-wide">
                  <FileText weight="bold" className="text-primary" /> Source Citation
                </h3>
                <button 
                  onClick={() => setSelectedCitation(null)}
                  className="text-slate hover:text-ink-deep p-1 rounded-full hover:bg-hairline-soft transition-colors"
                >
                  <CaretRight weight="bold" size={20} />
                </button>
              </div>
              <div className="p-6 flex-1 overflow-y-auto">
                <div className="text-[12px] font-bold text-primary bg-primary-soft px-3 py-1.5 rounded-full inline-block mb-4">
                  Match Relevance: {selectedCitation.similarity ? Math.min(100, Math.max(0, (selectedCitation.similarity - 0.5) * 200)).toFixed(0) : 100}%
                </div>
                <div className="p-5 bg-surface-soft rounded-2xl text-[14px] leading-relaxed text-ink-deep font-medium border border-primary/30 bg-primary/5 dark:bg-yellow-500/10 dark:border-yellow-500/30 break-words whitespace-pre-wrap">
                  "{selectedCitation.text}"
                </div>
                {selectedCitation.document && (
                   <div className="mt-6 pt-4 border-t border-hairline-soft flex items-center gap-2">
                     <FileText size={16} className="text-slate" />
                     <span className="text-[13px] text-charcoal font-semibold truncate">
                       {selectedCitation.document}
                     </span>
                   </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
      </div>
    </RagLayout>
  );
}
