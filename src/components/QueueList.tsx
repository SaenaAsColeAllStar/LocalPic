import React, { useState } from 'react';
import { QueueItem } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2, Download, CheckCircle2, AlertCircle, Archive } from 'lucide-react';
import { formatBytes } from '../lib/image-utils';
import JSZip from 'jszip';

interface QueueListProps {
  queue: QueueItem[];
  onRemove: (id: string) => void;
  isConverting: boolean;
  onConvertAll: () => void;
  onClearAll: () => void;
}

export function QueueItemCard({ item, onRemove, isConverting }: { item: QueueItem, onRemove: () => void, isConverting: boolean }) {
  const displayName = item.customName ? `${item.customName} (from ${item.file.name})` : item.file.name;
  
  return (
    <div className="w-full h-20 border border-zinc-100 rounded-xl flex items-center p-3 gap-4 bg-zinc-50/50 shrink-0">
      <div className="w-14 h-14 bg-zinc-200 rounded-lg overflow-hidden shrink-0 border border-zinc-200">
         <img src={item.previewUrl} alt="preview" className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <p className="text-xs font-bold truncate text-zinc-800" title={displayName}>{displayName}</p>
        <div className="text-[10px] text-zinc-400 mt-1 flex items-center gap-2">
          <span>{formatBytes(item.file.size)}</span>
          {item.status === 'pending' && <span className="text-zinc-500">• Waiting</span>}
          {item.status === 'converting' && <span className="text-zinc-900 font-medium flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin"/> Processing</span>}
          {item.status === 'done' && <span className="text-green-600 font-medium flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Done ({item.result ? formatBytes(item.result.size) : ''})</span>}
          {item.status === 'error' && <span className="text-red-500 truncate flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {item.error}</span>}
        </div>
      </div>
      <div className="shrink-0 flex items-center gap-2">
         {item.status === 'done' && item.result && (
           <a 
             href={item.result.url} 
             download={item.result.name}
             className="w-8 h-8 rounded bg-zinc-900 text-white flex items-center justify-center hover:bg-zinc-800 transition-colors shadow-sm"
             title={`Download .${item.result.name.split('.').pop()}`}
           >
             <Download className="w-4 h-4" />
           </a>
         )}
         <button 
           disabled={isConverting}
           onClick={onRemove}
           title="Remove"
           className="w-8 h-8 rounded text-zinc-400 flex items-center justify-center hover:bg-zinc-200 hover:text-zinc-700 disabled:opacity-50 transition-colors"
         >
           <X className="w-4 h-4" />
         </button>
      </div>
    </div>
  );
}

export function QueueList({ queue, onRemove, isConverting, onConvertAll, onClearAll }: QueueListProps) {
  const [isZipping, setIsZipping] = useState(false);

  if (queue.length === 0) return null;

  const pendingCount = queue.filter(q => q.status === 'pending' || q.status === 'error').length;
  const doneCount = queue.filter(q => q.status === 'done').length;
  const isAllProcessed = queue.length > 0 && queue.every(q => q.status === 'done' || q.status === 'error') && doneCount > 0;

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      let hasFiles = false;

      queue.forEach(item => {
        if (item.status === 'done' && item.result) {
          const base64Data = item.result.url.split(',')[1];
          zip.file(item.result.name, base64Data, { base64: true });
          hasFiles = true;
        }
      });

      if (hasFiles) {
        const content = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'LocalPic_Batch.zip';
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Zipping failed", err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col shrink-0 min-h-0"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
           <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-tight">Export Queue</h4>
           <p className="text-xs text-zinc-500 mt-0.5">{queue.length} items • {doneCount} completed</p>
        </div>
        <div className="flex items-center gap-2">
           <button 
             onClick={onClearAll}
             disabled={isConverting || isZipping}
             className="px-3 py-1.5 text-xs font-bold text-zinc-500 bg-zinc-100 hover:bg-zinc-200 rounded-lg disabled:opacity-50 transition-colors"
           >
             Clear All
           </button>
           {isAllProcessed ? (
             <button
               onClick={handleDownloadZip}
               disabled={isZipping}
               className="px-4 py-1.5 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50 shadow-sm flex items-center gap-2 transition-all active:scale-95"
             >
               {isZipping ? <><Loader2 className="w-3 h-3 animate-spin"/> Zipping...</> : <><Archive className="w-3 h-3"/> Download All (.zip)</>}
             </button>
           ) : (
             <button
               onClick={onConvertAll}
               disabled={isConverting || pendingCount === 0}
               className="px-4 py-1.5 text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg disabled:opacity-50 shadow-sm flex items-center gap-2 transition-all active:scale-95"
             >
               {isConverting ? <><Loader2 className="w-3 h-3 animate-spin"/> Processing</> : 'Convert All'}
             </button>
           )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto min-h-0 pr-2 space-y-3 custom-scrollbar">
         <AnimatePresence mode="popLayout">
            {queue.map(item => (
              <motion.div
                 layout
                 key={item.id}
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0 }}
                 transition={{ duration: 0.2 }}
              >
                <QueueItemCard item={item} onRemove={() => onRemove(item.id)} isConverting={isConverting} />
              </motion.div>
            ))}
         </AnimatePresence>
      </div>
    </motion.div>
  );
}
