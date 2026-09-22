import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronLeft, SlidersHorizontal, Wrench, Star } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { mockTools } from '@/lib/mock-data';
import { TOOL_CATEGORIES } from '@/lib/constants';

export default function CatalogPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  
  const [activeTab, setActiveTab] = useState('Semua');
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = ['Semua', 'Tersedia', 'Populer'];

  let filteredTools = mockTools.filter(tool => {
    if (activeCategory !== 'all' && tool.category !== activeCategory) return false;
    if (searchQuery && !tool.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    if (activeTab === 'Tersedia') return tool.availableStock > 0;
    if (activeTab === 'Populer') return (tool.rating || 0) >= 4.5;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white pt-12 pb-4 shadow-sm sticky top-0 z-20">
        <div className="px-4 flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Katalog Alat</h1>
        </div>

        <div className="px-4 flex gap-3 mb-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder="Cari alat berdasarkan nama..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-100 py-2.5 pl-10 pr-4 rounded-xl text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
          </div>
          <button className="p-2.5 bg-gray-100 rounded-xl text-gray-700 hover:bg-gray-200 transition-colors shrink-0">
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-4 flex gap-6 border-b border-gray-100">
          {tabs.map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium relative transition-colors ${activeTab === tab ? 'text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* Categories Chips */}
        <div className="flex overflow-x-auto gap-2 px-4 py-4 hide-scrollbar">
          <button 
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${activeCategory === 'all' ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
          >
            🌟 Semua Kategori
          </button>
          {TOOL_CATEGORIES.map(cat => (
            <button 
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border flex items-center gap-1.5 ${activeCategory === cat.value ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
            >
              <span>{cat.icon}</span> {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {filteredTools.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Alat tidak ditemukan</h3>
            <p className="text-sm text-gray-500 max-w-[250px]">Coba ubah kata kunci pencarian atau filter kategori lainnya.</p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 md:grid-cols-3 gap-4"
          >
            {filteredTools.map((tool, idx) => (
              <motion.div 
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => navigate(`/katalog/${tool.id}`)}
                className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex flex-col active:scale-95 transition-transform cursor-pointer"
              >
                <div className="w-full aspect-square bg-gradient-to-br from-teal-50 to-gray-50 rounded-xl mb-3 flex items-center justify-center relative p-2 overflow-hidden border border-gray-50">
                  {tool.imageUrl ? (
                    <img src={tool.imageUrl} alt={tool.name} className="w-full h-full object-contain mix-blend-multiply" />
                  ) : (
                    <Wrench className="w-12 h-12 text-teal-600/30" />
                  )}
                  {tool.rating && (
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-bold text-gray-800 flex items-center gap-0.5 shadow-sm">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {tool.rating}
                    </div>
                  )}
                </div>
                
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-tight mb-1">{tool.name}</h3>
                <p className="text-xs text-gray-500 truncate mt-auto mb-2.5">{tool.brand}</p>
                
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                  <span className={`text-[10px] font-semibold px-2 py-1 rounded-md ${tool.availableStock > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {tool.availableStock > 0 ? 'Tersedia' : 'Stok Habis'}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
