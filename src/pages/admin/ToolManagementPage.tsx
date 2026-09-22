import React, { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, QrCode, Wrench, Shield, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabaseService } from '@/services/supabaseService'
import type { Tool, ToolCategory } from '@/lib/types'
import { TOOL_CATEGORIES } from '@/lib/constants'
import { QRCodeSVG } from 'qrcode.react'
import { toast } from 'sonner'

export default function ToolManagementPage() {
  const [tools, setTools] = useState<Tool[]>([])
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTool, setEditingTool] = useState<Tool | null>(null)
  const [qrModalTool, setQrModalTool] = useState<Tool | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    brand: 'Tekiro',
    code: '',
    category: 'kunci_pas' as ToolCategory,
    size: '',
    totalStock: 2,
    location: 'Rak A1',
    description: '',
  })

  const loadTools = async () => {
    const data = await supabaseService.getTools()
    setTools(data)
  }

  useEffect(() => {
    loadTools()
  }, [])

  const handleOpenAdd = () => {
    setEditingTool(null)
    setFormData({
      name: '',
      brand: 'Tekiro',
      code: `KT-${Math.floor(100 + Math.random() * 900)}`,
      category: 'kunci_pas',
      size: '',
      totalStock: 2,
      location: 'Rak A1',
      description: '',
    })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (tool: Tool) => {
    setEditingTool(tool)
    setFormData({
      name: tool.name,
      brand: tool.brand,
      code: tool.code,
      category: tool.category,
      size: tool.size || '',
      totalStock: tool.totalStock,
      location: tool.location,
      description: tool.description || '',
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus alat "${name}"?`)) {
      await supabaseService.deleteTool(id)
      setTools((prev) => prev.filter((t) => t.id !== id))
      toast.success(`Alat ${name} berhasil dihapus.`)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.code) {
      toast.error('Nama dan Kode alat wajib diisi.')
      return
    }

    if (editingTool) {
      // Update local state
      const updated: Tool = {
        ...editingTool,
        ...formData,
        availableStock: formData.totalStock,
      }
      setTools((prev) => prev.map((t) => (t.id === editingTool.id ? updated : t)))
      toast.success(`Alat "${formData.name}" berhasil diperbarui.`)
    } else {
      // Add new
      const newTool: Omit<Tool, 'id' | 'createdAt'> = {
        ...formData,
        imageUrl: `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(formData.name)}&backgroundColor=0d9488`,
        qrCode: `TOOL-${formData.code}`,
        availableStock: formData.totalStock,
        isActive: true,
        condition: 'baik',
        rating: 4.8,
        totalBorrowed: 0,
      }
      const saved = await supabaseService.addTool(newTool)
      setTools((prev) => [saved, ...prev])
      toast.success(`Alat baru "${formData.name}" berhasil ditambahkan!`)
    }
    setIsModalOpen(false)
  }

  const filteredTools = tools.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.code.toLowerCase().includes(search.toLowerCase()) ||
      t.brand.toLowerCase().includes(search.toLowerCase())
    const matchCat = selectedCategory === 'all' || t.category === selectedCategory
    return matchSearch && matchCat
  })

  return (
    <div className="min-h-screen bg-gray-50 pb-24 pt-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold mb-1">
            <Shield className="w-3.5 h-3.5" />
            Mode Admin
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Alat</h1>
          <p className="text-xs text-gray-500">Kelola master data kunci, stok, dan label QR</p>
        </div>
        <Button
          onClick={handleOpenAdd}
          className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs py-2 px-3 shadow-md shadow-teal-600/20"
        >
          <Plus className="w-4 h-4 mr-1" />
          Tambah Alat
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari nama, kode (misal: KI-012), atau brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-9 pr-4 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-full shrink-0 font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-teal-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600'
            }`}
          >
            Semua ({tools.length})
          </button>
          {TOOL_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1.5 rounded-full shrink-0 font-medium transition-colors flex items-center gap-1 ${
                selectedCategory === cat.value
                  ? 'bg-teal-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tool List Table / Cards */}
      <div className="space-y-2.5">
        <div className="text-xs text-gray-500 font-semibold px-1">
          Menampilkan {filteredTools.length} alat kerja
        </div>

        {filteredTools.map((tool) => (
          <div
            key={tool.id}
            className="bg-white border border-gray-100 rounded-2xl p-3.5 shadow-sm flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 bg-teal-50 text-teal-700 rounded-xl flex items-center justify-center shrink-0 border border-teal-100 font-bold text-xs">
                <Wrench className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded">
                    {tool.code}
                  </span>
                  <span className="text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded font-semibold">
                    Stok: {tool.availableStock}/{tool.totalStock}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-gray-900 truncate mt-0.5">{tool.name}</h3>
                <p className="text-[11px] text-gray-500 truncate">
                  {tool.brand} • Lokasi: {tool.location}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setQrModalTool(tool)}
                className="p-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                title="Lihat QR Code"
              >
                <QrCode className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleOpenEdit(tool)}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit Alat"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(tool.id, tool.name)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Hapus Alat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add / Edit Tool */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-6 max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-lg font-bold text-gray-900">
                {editingTool ? 'Edit Alat Kerja' : 'Tambah Alat Kerja Baru'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Nama Alat</label>
                <input
                  type="text"
                  required
                  placeholder='Contoh: Kunci Inggris 12"'
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Brand</label>
                  <input
                    type="text"
                    required
                    placeholder="Tekiro / Stanley / Krisbow"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Kode Unik Alat</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: KI-012"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white"
                  >
                    {TOOL_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Total Stok</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.totalStock}
                    onChange={(e) =>
                      setFormData({ ...formData, totalStock: parseInt(e.target.value) || 1 })
                    }
                    className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Ukuran</label>
                  <input
                    type="text"
                    placeholder='Contoh: 12" (300mm)'
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Lokasi Penyimpanan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Rak A2"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan penggunaan..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-xl text-xs py-2.5"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs py-2.5"
                >
                  Simpan Alat
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal QR Code Display (for Printing / Sticking to Tool) */}
      {qrModalTool && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full text-center space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-gray-900">Label QR Code Alat</h3>
            <p className="text-xs text-gray-500">
              Cetak label ini dan tempelkan pada fisik alat kerja:
            </p>
            <div className="bg-white p-4 rounded-2xl border-2 border-teal-500 flex flex-col items-center justify-center mx-auto shadow-inner">
              <QRCodeSVG value={qrModalTool.qrCode} size={160} level="H" />
              <span className="font-mono font-bold text-xs mt-3 text-teal-800">
                {qrModalTool.code}
              </span>
              <span className="text-[11px] font-semibold text-gray-700 truncate max-w-[180px]">
                {qrModalTool.name}
              </span>
            </div>
            <Button
              onClick={() => setQrModalTool(null)}
              className="w-full bg-teal-600 text-white rounded-xl text-xs font-bold"
            >
              Selesai
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
