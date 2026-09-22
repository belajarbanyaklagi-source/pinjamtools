import { supabase } from '@/lib/supabase'
import type { Tool, Borrow } from '@/lib/types'
import { mockTools, mockBorrows, mockUser } from '@/lib/mock-data'

export const supabaseService = {
  // ─── TOOLS ──────────────────────────────────────────────────
  async getTools(): Promise<Tool[]> {
    try {
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .order('name', { ascending: true })

      if (error || !data || data.length === 0) {
        console.warn('Using local tools fallback:', error?.message)
        return mockTools
      }

      return data.map((t: any) => ({
        id: t.id,
        name: t.name,
        brand: t.brand,
        code: t.code,
        imageUrl: t.image_url,
        category: t.category,
        qrCode: t.qr_code,
        totalStock: t.total_stock,
        availableStock: t.available_stock,
        isActive: t.is_active,
        description: t.description || '',
        specification: t.specification,
        size: t.size,
        weight: t.weight,
        condition: t.condition || 'baik',
        location: t.location || 'Gudang',
        rating: Number(t.rating) || 4.5,
        totalBorrowed: t.total_borrowed || 0,
        createdAt: t.created_at,
      }))
    } catch (e) {
      console.error('Error fetching tools from Supabase:', e)
      return mockTools
    }
  },

  async addTool(tool: Omit<Tool, 'id' | 'createdAt'>): Promise<Tool> {
    const newId = String(Date.now())
    const dbPayload = {
      id: newId,
      name: tool.name,
      brand: tool.brand,
      code: tool.code,
      image_url: tool.imageUrl,
      category: tool.category,
      qr_code: tool.qrCode || `TOOL-${tool.code}`,
      total_stock: tool.totalStock,
      available_stock: tool.availableStock,
      is_active: tool.isActive,
      description: tool.description,
      specification: tool.specification,
      size: tool.size,
      weight: tool.weight,
      condition: tool.condition,
      location: tool.location,
      rating: tool.rating || 4.5,
      total_borrowed: 0,
    }

    const { data, error } = await supabase.from('tools').insert([dbPayload]).select().single()
    if (error) {
      console.warn('Add tool fallback to local:', error.message)
      return { ...tool, id: newId, createdAt: new Date().toISOString() }
    }

    return {
      ...tool,
      id: data.id,
      createdAt: data.created_at,
    }
  },

  async deleteTool(id: string): Promise<boolean> {
    const { error } = await supabase.from('tools').delete().eq('id', id)
    if (error) {
      console.warn('Delete tool fallback:', error.message)
    }
    return true
  },

  // ─── BORROWS & APPROVAL FLOW ────────────────────────────────
  async getBorrows(): Promise<Borrow[]> {
    try {
      const { data, error } = await supabase
        .from('borrows')
        .select(`
          *,
          tools:tool_id (*)
        `)
        .order('created_at', { ascending: false })

      if (error || !data || data.length === 0) {
        return mockBorrows
      }

      return data.map((b: any) => {
        const toolData = b.tools || mockTools.find((t) => t.id === b.tool_id) || mockTools[0]
        return {
          id: b.id,
          userId: b.user_id || '1',
          userName: b.user_name || 'Peminjam',
          userEmail: b.user_email,
          toolId: b.tool_id,
          tool: {
            id: toolData.id,
            name: toolData.name,
            brand: toolData.brand,
            code: toolData.code,
            imageUrl: toolData.image_url || toolData.imageUrl,
            category: toolData.category,
            qrCode: toolData.qr_code || toolData.qrCode,
            totalStock: toolData.total_stock ?? toolData.totalStock ?? 1,
            availableStock: toolData.available_stock ?? toolData.availableStock ?? 1,
            isActive: toolData.is_active ?? true,
            description: toolData.description || '',
            condition: toolData.condition || 'baik',
            location: toolData.location || 'Gudang',
            rating: Number(toolData.rating) || 4.5,
            totalBorrowed: toolData.total_borrowed || 0,
            createdAt: toolData.created_at || new Date().toISOString(),
          },
          borrowCode: b.borrow_code || `PINJAM-${b.id.slice(0, 6).toUpperCase()}`,
          borrowDate: b.borrow_date,
          dueDate: b.due_date,
          returnDate: b.return_date,
          status: b.status,
          extensions: b.extensions || 0,
          fineAmount: Number(b.fine_amount) || 0,
          finePaid: false,
          notes: b.notes,
          proofPhotoUrl: b.proof_photo_url,
          approvedBy: b.approved_by,
          approvedAt: b.approved_at,
          createdAt: b.created_at,
        }
      })
    } catch (e) {
      console.error('Error fetching borrows:', e)
      return mockBorrows
    }
  },

  // 1. Peminjam initiates request -> Status: pending_approval
  async createBorrowRequest(tool: Tool, user = mockUser, notes?: string): Promise<Borrow> {
    const borrowCode = `PJ-${Math.floor(100000 + Math.random() * 900000)}`
    const today = new Date().toISOString().split('T')[0]!
    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]!

    const newBorrow: Borrow = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      userId: user.id,
      userName: user.fullName,
      userEmail: user.email,
      toolId: tool.id,
      tool,
      borrowCode,
      borrowDate: today,
      dueDate,
      returnDate: null,
      status: 'pending_approval',
      extensions: 0,
      fineAmount: 0,
      finePaid: false,
      notes,
      proofPhotoUrl: null,
      approvedBy: null,
      approvedAt: null,
      createdAt: new Date().toISOString(),
    }

    try {
      const { data, error } = await supabase.from('borrows').insert([
        {
          id: newBorrow.id,
          user_id: user.id && user.id.length === 36 ? user.id : null,
          user_name: user.fullName,
          user_email: user.email,
          tool_id: tool.id,
          borrow_code: borrowCode,
          borrow_date: today,
          due_date: dueDate,
          status: 'pending_approval',
          notes,
        },
      ]).select().single()

      if (!error && data) {
        newBorrow.id = data.id
      }
    } catch (err) {
      console.warn('Insert borrow online fallback:', err)
    }

    return newBorrow
  },

  // 2. Admin confirms request with proof photo taken -> Status: active
  async approveBorrowWithPhoto(
    borrowId: string,
    photoDataUrl: string,
    adminName = 'Admin Gudang'
  ): Promise<{ success: boolean; photoUrl: string }> {
    let finalPhotoUrl = photoDataUrl

    // Try to upload photo to Supabase storage bucket 'proof-photos'
    try {
      if (photoDataUrl.startsWith('data:image')) {
        const res = await fetch(photoDataUrl)
        const blob = await res.blob()
        const fileName = `proof-${borrowId}-${Date.now()}.jpg`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('proof-photos')
          .upload(fileName, blob, {
            contentType: 'image/jpeg',
            upsert: true,
          })

        if (!uploadError && uploadData) {
          const { data: publicUrlData } = supabase.storage
            .from('proof-photos')
            .getPublicUrl(fileName)
          finalPhotoUrl = publicUrlData.publicUrl
        }
      }
    } catch (uploadErr) {
      console.warn('Storage upload fallback (using base64):', uploadErr)
    }

    // Update database record
    try {
      const now = new Date().toISOString()
      const { error } = await supabase
        .from('borrows')
        .update({
          status: 'active',
          proof_photo_url: finalPhotoUrl,
          approved_by: adminName,
          approved_at: now,
        })
        .eq('id', borrowId)

      if (error) {
        console.warn('Update borrow online fallback:', error.message)
      }
    } catch (err) {
      console.warn('Approve online fallback:', err)
    }

    return { success: true, photoUrl: finalPhotoUrl }
  },

  // 3. Admin rejects request
  async rejectBorrow(borrowId: string, reason?: string): Promise<boolean> {
    try {
      await supabase
        .from('borrows')
        .update({
          status: 'rejected',
          notes: reason ? `Ditolak: ${reason}` : 'Ditolak oleh admin',
        })
        .eq('id', borrowId)
    } catch (e) {
      console.warn('Reject online fallback:', e)
    }
    return true
  },

  // 4. Return tool
  async returnTool(borrowId: string): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0]!
    try {
      await supabase
        .from('borrows')
        .update({
          status: 'returned',
          return_date: today,
        })
        .eq('id', borrowId)
    } catch (e) {
      console.warn('Return online fallback:', e)
    }
    return true
  },

  // ─── REALTIME LISTENER ──────────────────────────────────────
  subscribeToBorrows(onUpdate: (payload: any) => void) {
    const channel = supabase
      .channel('public:borrows')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'borrows' },
        (payload) => {
          onUpdate(payload)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  },
}
