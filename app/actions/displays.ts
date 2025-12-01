'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from "@supabase/supabase-js";

export type DisplayConfig = {
  template?: string
  layout?: string
  prayerTimes?: any
  colors?: any
  masjidName?: string
  logoUrl?: string
  iqamahOffsets?: any
  colorTheme?: any
  backgroundType?: string
  backgroundColor?: string
  backgroundImage?: string[]
  slideshowDuration?: number
  announcements?: Array<{ text: string; duration: number }>
  showHijriDate?: boolean
  font?: string
}

export type DisplayData = {
  name: string
  template_type: string
  config?: DisplayConfig
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Helper function to map template_type to actual template name
function getTemplateFromType(templateType: string): string {
  const templateMap: Record<string, string> = {
    'masjid': 'masjid-classic',
    'hospital': 'hospital-modern',
    'corporate': 'corporate-dashboard',
  };
  
  return templateMap[templateType] || 'masjid-classic';
}

// Default configurations for each template
function getDefaultConfig(templateType: string): DisplayConfig {
  const template = getTemplateFromType(templateType);
  
  const defaults: Record<string, DisplayConfig> = {
    'masjid-classic': {
      template: 'masjid-classic',
      layout: 'horizontal',
      masjidName: 'Masjid Name',
      logoUrl: '',
      prayerTimes: {
        fajr: '05:30',
        dhuhr: '12:30',
        asr: '15:45',
        maghrib: '18:15',
        isha: '19:45',
      },
      iqamahOffsets: {
        fajr: 15,
        dhuhr: 10,
        asr: 10,
        maghrib: 5,
        isha: 10,
      },
      colorTheme: {
        primary: '#10b981',
        secondary: '#059669',
        text: '#ffffff',
        accent: '#fbbf24',
      },
      colors: {
        primary: '#10b981',
        secondary: '#059669',
        text: '#ffffff',
        accent: '#fbbf24',
      },
      backgroundType: 'solid',
      backgroundColor: '#1a1a1a',
      backgroundImage: [],
      slideshowDuration: 5,
      announcements: [],
      showHijriDate: true,
      font: 'Inter, sans-serif',
    },
    'hospital-modern': {
      template: 'hospital-modern',
      colorTheme: {
        primary: '#3b82f6',
        secondary: '#2563eb',
        text: '#ffffff',
        accent: '#60a5fa',
      },
      colors: {
        primary: '#3b82f6',
        secondary: '#2563eb',
        text: '#ffffff',
        accent: '#60a5fa',
      },
      backgroundType: 'solid',
      backgroundColor: '#1e293b',
    },
    'corporate-dashboard': {
      template: 'corporate-dashboard',
      colorTheme: {
        primary: '#8b5cf6',
        secondary: '#7c3aed',
        text: '#ffffff',
        accent: '#a78bfa',
      },
      colors: {
        primary: '#8b5cf6',
        secondary: '#7c3aed',
        text: '#ffffff',
        accent: '#a78bfa',
      },
      backgroundType: 'solid',
      backgroundColor: '#0f172a',
    },
  };
  
  return defaults[template] || defaults['masjid-classic'];
}

export async function createDisplay(data: DisplayData, userId: string) {
  const supabase = await createClient(supabaseUrl, supabaseAnonKey)
  
  const displayId = crypto.randomUUID()

  // Get default config for this template type
  const defaultConfig = getDefaultConfig(data.template_type);
  
  // Merge: defaults first, then any provided config, then ensure template is set
  const config = {
    ...defaultConfig,
    ...(data.config || {}),
    template: getTemplateFromType(data.template_type),
  }

  const { data: display, error } = await supabase
    .from('displays')
    .insert({
      id: displayId,
      name: data.name,
      template_type: data.template_type,
      config: config,
      user_id: userId, // ADD THIS LINE
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating display:', error)
    return { error: error.message, data: null }
  }

  revalidatePath('/displays')
  return { data: display, error: null }
}

export async function getDisplays(userId?: string) {
  const supabase = await createClient(supabaseUrl, supabaseAnonKey)

  let query = supabase
    .from('displays')
    .select('*')
    .order('created_at', { ascending: false })

  // Filter by user_id if provided
  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching displays:', error)
    return { data: [], error: error.message }
  }

  return { data, error: null }
}

export async function deleteDisplay(id: string) {
  const supabase = await createClient(supabaseUrl, supabaseAnonKey)
  
  const { error } = await supabase
    .from('displays')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting display:', error)
    return { error: error.message }
  }

  revalidatePath('/displays')
  return { error: null }
}

export async function getDisplayById(id: string) {
  const supabase = await createClient(supabaseUrl, supabaseAnonKey)

  const { data, error } = await supabase
    .from('displays')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching display:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function updateDisplay(id: string, data: Partial<DisplayData>) {
  const supabase = await createClient(supabaseUrl, supabaseAnonKey)
  
  const updateData: any = {}
  
  if (data.name) updateData.name = data.name
  if (data.template_type) updateData.template_type = data.template_type
  
  // If config is being updated, ensure template is included
  if (data.config) {
    updateData.config = {
      ...data.config,
      template: data.template_type 
        ? getTemplateFromType(data.template_type)
        : data.config.template, // Preserve existing template if not updating type
    }
  }

  const { error } = await supabase
    .from('displays')
    .update(updateData)
    .eq('id', id)

  if (error) {
    console.error('Error updating display:', error)
    return { error: error.message }
  }

  revalidatePath('/displays')
  revalidatePath(`/displays/${id}`)
  return { error: null }
}