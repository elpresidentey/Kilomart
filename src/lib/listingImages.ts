import { supabase } from './supabase'

export const LISTING_IMAGES_BUCKET =
  import.meta.env.VITE_SUPABASE_LISTING_IMAGES_BUCKET || 'listing-images'
export const MAX_LISTING_IMAGE_SIZE_BYTES = 5 * 1024 * 1024

function extensionFor(file: File): string {
  const fromName = file.name.split('.').pop()?.trim().toLowerCase()
  if (fromName) return fromName

  const fromType = file.type.split('/').pop()?.trim().toLowerCase()
  if (fromType === 'jpeg') return 'jpg'
  return fromType || 'bin'
}

export async function uploadListingImage(file: File, sellerId: string): Promise<string> {
  const ext = extensionFor(file)
  const filePath = `${sellerId}/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage.from(LISTING_IMAGES_BUCKET).upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || undefined,
  })

  if (error) throw error

  const { data } = supabase.storage.from(LISTING_IMAGES_BUCKET).getPublicUrl(filePath)
  if (!data?.publicUrl) {
    throw new Error('Image uploaded, but no public URL was returned.')
  }

  return data.publicUrl
}
