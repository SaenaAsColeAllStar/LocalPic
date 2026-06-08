import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dropzone } from './components/Dropzone';
import { QueueList } from './components/QueueList';
import { convertImage } from './lib/image-utils';
import { ProfileWidget } from './components/ProfileWidget';

export type QueueItem = {
  id: string;
  file: File;
  previewUrl: string;
  status: 'pending' | 'converting' | 'done' | 'error';
  result?: { url: string; name: string; size: number; originalSize: number };
  error?: string;
};

export default function App() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [convertedCount, setConvertedCount] = useState(0);
  const [outputFormat, setOutputFormat] = useState<'jpeg' | 'webp'>('jpeg');

  // cleanup URLs when leaving
  useEffect(() => {
    return () => {
      queue.forEach(item => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, []);

  const handleFilesSelect = (selectedFiles: File[]) => {
    setGlobalError(null);
    
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    const validFiles = selectedFiles.filter(f => validTypes.includes(f.type));
    
    if (validFiles.length < selectedFiles.length) {
      setGlobalError('Beberapa file diabaikan karena format tidak didukung.');
    }

    const newItems: QueueItem[] = validFiles.map(f => ({
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7),
      file: f,
      previewUrl: URL.createObjectURL(f),
      status: 'pending'
    }));

    setQueue(prev => [...prev, ...newItems]);
  };

  const handleConvertAll = async () => {
    const itemsToProcess = queue.filter(q => q.status === 'pending' || q.status === 'error');
    if (itemsToProcess.length === 0) return;

    setIsConverting(true);
    
    for (const item of itemsToProcess) {
      setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'converting' } : q));
      
      try {
        await new Promise(res => setTimeout(res, 200)); // micro interaction
        const converted = await convertImage(item.file, outputFormat);
        
        setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'done', result: converted } : q));
        setConvertedCount(prev => prev + 1);
      } catch (err: any) {
        setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'error', error: err.message } : q));
      }
    }
    
    setIsConverting(false);
  };

  const handleRemove = (id: string) => {
    setQueue(prev => {
      const removed = prev.find(q => q.id === id);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter(q => q.id !== id);
    });
  };

  const handleClearAll = () => {
    queue.forEach(item => URL.revokeObjectURL(item.previewUrl));
    setQueue([]);
    setGlobalError(null);
  };

  return (
    <div className="h-screen bg-zinc-50 text-zinc-950 font-sans flex flex-col overflow-hidden select-none">
      {/* Header Navigation */}
      <nav className="h-16 shrink-0 border-b border-zinc-200 flex items-center justify-between px-4 md:px-8 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-zinc-900 rounded flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white rotate-45"></div>
          </div>
          <h1 className="text-lg font-semibold tracking-tight">
            LocalPic <span className="text-zinc-400 font-normal underline decoration-zinc-200 underline-offset-4">Converter</span>
          </h1>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <div className="hidden md:flex items-center gap-2 text-xs font-medium text-zinc-500 bg-zinc-100 px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            Offline Processing Enabled
          </div>
          <ProfileWidget />
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto flex flex-col md:flex-row p-4 md:p-8 gap-8">
        {/* Sidebar Configuration */}
        <aside className="w-full md:w-72 flex flex-col gap-6 shrink-0">
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Export Settings</h2>
            <div className="p-4 bg-white border border-zinc-200 rounded-xl space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Output Format</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setOutputFormat('jpeg')}
                    className={`px-3 py-2 text-xs font-bold rounded shadow-sm transition-colors ${outputFormat === 'jpeg' ? 'bg-zinc-900 text-white' : 'bg-zinc-50 border border-zinc-200 text-zinc-400 hover:text-zinc-600'}`}
                  >
                    .JPEG
                  </button>
                  <button 
                    onClick={() => setOutputFormat('webp')}
                    className={`px-3 py-2 text-xs font-bold rounded shadow-sm transition-colors ${outputFormat === 'webp' ? 'bg-zinc-900 text-white' : 'bg-zinc-50 border border-zinc-200 text-zinc-400 hover:text-zinc-600'}`}
                  >
                    .WEBP
                  </button>
                </div>
              </div>
              <div className="space-y-3 pt-2">
                <div className="flex justify-between text-xs">
                  <label className="font-medium">Quality</label>
                  <span className="text-zinc-500">92%</span>
                </div>
                <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden flex">
                  <div className="w-[92%] bg-zinc-900 h-full"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Session Statistics</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-zinc-100 rounded-lg">
                <p className="text-2xl font-semibold">{convertedCount}</p>
                <p className="text-[10px] text-zinc-500 uppercase font-bold">Converted</p>
              </div>
              <div className="p-3 bg-zinc-100 rounded-lg">
                <p className="text-2xl font-semibold">&lt; 1s</p>
                <p className="text-[10px] text-zinc-500 uppercase font-bold">Latency</p>
              </div>
            </div>
          </div>

          <div className="mt-auto hidden md:block p-4 bg-zinc-900 rounded-xl text-white">
            <p className="text-xs font-medium opacity-80 leading-relaxed">
              All images are processed locally using your browser's Canvas API. No data ever leaves your device.
            </p>
          </div>
        </aside>

        {/* Conversion Canvas Area */}
        <div className="flex-1 flex flex-col gap-6 max-w-4xl min-h-0">
          
          <div className="shrink-0">
            <Dropzone onFilesSelect={handleFilesSelect} error={globalError} />
          </div>

          <QueueList 
            queue={queue}
            onRemove={handleRemove}
            isConverting={isConverting}
            onConvertAll={handleConvertAll}
            onClearAll={handleClearAll}
          />

          {/* Placeholder for empty state */}
          {queue.length === 0 && (
            <div className="h-48 shrink-0 bg-white border border-zinc-200 rounded-2xl p-6 hidden lg:block opacity-50 pointer-events-none">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-tight">Ready for Export</h4>
                <span className="text-[10px] bg-zinc-100 px-2 py-0.5 rounded text-zinc-600 font-mono">v1.0.2-stable</span>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 h-24 border border-zinc-100 rounded-lg flex items-center p-3 gap-4 bg-zinc-50/50">
                  <div className="w-16 h-16 bg-zinc-200 rounded-md overflow-hidden">
                     <div className="w-full h-full bg-gradient-to-br from-zinc-300 to-zinc-400"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold truncate">hero_banner_final.png</p>
                    <p className="text-[10px] text-zinc-400">2.4 MB • Waiting for trigger</p>
                  </div>
                </div>
                <div className="flex-1 h-24 border border-zinc-100 rounded-lg flex items-center p-3 gap-4 bg-zinc-50/50 opacity-40">
                  <div className="w-16 h-16 bg-zinc-200 rounded-md"></div>
                  <div className="flex-1">
                    <div className="h-2 bg-zinc-200 rounded w-24 mb-2"></div>
                    <div className="h-1.5 bg-zinc-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer Status Bar */}
      <footer className="h-10 shrink-0 border-t border-zinc-200 bg-white flex items-center px-4 md:px-8 text-[10px] text-zinc-400">
        <div className="flex-1 flex gap-4 md:gap-6 overflow-hidden whitespace-nowrap">
          <span>ENGINE: CANVAS_API_V2</span>
          <span>MIME_STRICT: ENABLED</span>
          <span className="hidden md:inline">MEMORY_USAGE: 42.4 MB</span>
        </div>
        <div className="hidden sm:flex text-zinc-500 font-medium">
          Created by ColeAllStar
        </div>
        <div className="flex gap-4 font-mono pl-4">
          <span className="text-zinc-600 hidden md:inline">SECURE_CONTEXT</span>
          <span className="text-green-600 font-bold uppercase">System Ready</span>
        </div>
      </footer>
    </div>
  );
}
