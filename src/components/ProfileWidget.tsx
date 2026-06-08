import React, { useState, useEffect, useRef } from 'react';
import { User, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function ProfileWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('Guest User');
  const [username, setUsername] = useState('@guest');
  
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedName = localStorage.getItem('localpic_name');
    const savedUsername = localStorage.getItem('localpic_username');
    if (savedName) setName(savedName);
    if (savedUsername) setUsername(savedUsername);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = () => {
    setEditName(name);
    setEditUsername(username);
    setIsOpen(!isOpen);
  };

  const handleSave = () => {
    setName(editName || 'Guest User');
    setUsername(editUsername || '@guest');
    localStorage.setItem('localpic_name', editName || 'Guest User');
    localStorage.setItem('localpic_username', editUsername || '@guest');
    setIsOpen(false);
  };

  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={handleOpen}
        className="flex items-center gap-2 hover:bg-zinc-100 p-1 md:pr-3 rounded-full transition-colors border border-transparent hover:border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-1"
      >
        <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center text-xs font-bold">
          {initials}
        </div>
        <div className="text-left hidden md:block">
          <p className="text-xs font-bold leading-none text-zinc-900">{name}</p>
          <p className="text-[10px] text-zinc-500 font-mono tracking-tight">{username}</p>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-64 bg-white border border-zinc-200 rounded-xl shadow-xl z-50 p-5"
          >
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zinc-100">
              <User className="w-4 h-4 text-zinc-400" />
              <h4 className="text-sm font-bold text-zinc-800">Edit Profile</h4>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Name</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                  placeholder="Your Name"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">Username</label>
                <input 
                  type="text" 
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-900 font-mono focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all"
                  placeholder="@username"
                />
              </div>
              
              <button 
                onClick={handleSave}
                className="w-full mt-2 bg-zinc-900 text-white rounded-lg px-4 py-2.5 text-sm font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors"
              >
                <Check className="w-4 h-4" />
                Save Profile
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
