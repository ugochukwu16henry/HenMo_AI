import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(req: NextRequest) {
  const { id, userId } = await req.json()
  const { error } = await supabase.from('user_memory').delete().eq('id', id).eq('user_id', userId)
  return NextResponse.json({ success: !error })
}
