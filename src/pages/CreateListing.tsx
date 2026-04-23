import { useState, type ChangeEvent, type FormEvent, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Card, Input, Button } from '../components/ui'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { ArrowLeft, Package, MapPin, DollarSign, FileText, Image as ImageIcon, Upload } from 'lucide-react'
import type { ProduceListing } from '../types'
import { fallbackOnImageError, sanitizeImageUrl } from '../lib/image'
import {
  MAX_LISTING_IMAGE_SIZE_BYTES,
  uploadListingImage,
} from '../lib/listingImages'
import { useI18n } from '../i18n/useI18n'

const QUALITY_GRADES: { value: ProduceListing['quality_grade']; label: string }[] = [
  { value: 'A', label: 'Grade A - Premium Quality' },
  { value: 'B', label: 'Grade B - Standard Quality' },
  { value: 'C', label: 'Grade C - Fair Quality' },
  { value: 'D', label: 'Grade D - Basic Quality' },
]

export function CreateListing() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useI18n()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadError, setUploadError] = useState('')

  const [categories, setCategories] = useState<{id: string, name: string}[]>([])

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    try {
      const { data, error } = await supabase.from('categories').select('id, name').order('sort_order')
      if (error) throw error
      setCategories(data || [])
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  const [formData, setFormData] = useState({
    product_name: '',
    category_id: '',
    price_per_kg: '',
    available_quantity: '',
    min_order_kg: '5',
    quality_grade: 'B' as ProduceListing['quality_grade'],
    location: '',
    description: '',
    image_urls: '',
  })

  const imageUrls = formData.image_urls
    .split(/[\n,]/)
    .map((value) => sanitizeImageUrl(value))
    .filter((value): value is string => Boolean(value))
  const filePreviews = useMemo(
    () =>
      selectedFiles.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      })),
    [selectedFiles],
  )

  useEffect(() => {
    return () => {
      filePreviews.forEach((preview) => URL.revokeObjectURL(preview.url))
    }
  }, [filePreviews])

  function handleFileSelection(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const invalid = files.find(
      (file) => !file.type.startsWith('image/') || file.size > MAX_LISTING_IMAGE_SIZE_BYTES,
    )

    if (invalid) {
      setUploadError(
        invalid.size > MAX_LISTING_IMAGE_SIZE_BYTES
          ? 'Each image must be 5MB or smaller.'
          : 'Only image files can be uploaded.',
      )
      e.target.value = ''
      return
    }

    setUploadError('')
    setSelectedFiles((current) => [...current, ...files].slice(0, 6))
    e.target.value = ''
  }

  function removeSelectedFile(index: number) {
    setSelectedFiles((current) => current.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return

    setError('')
    setUploadError('')
    setIsSubmitting(true)

    try {
      const uploadedImages = await Promise.all(
        selectedFiles.map((file) => uploadListingImage(file, user.id)),
      )
      const mergedImages = [...imageUrls, ...uploadedImages]

      const { error: submitError } = await supabase.from('produce_listings').insert({
        seller_id: user.id,
        category_id: formData.category_id,
        product_name: formData.product_name,
        price_per_kg: parseFloat(formData.price_per_kg),
        available_quantity: parseFloat(formData.available_quantity),
        min_order_kg: parseFloat(formData.min_order_kg),
        quality_grade: formData.quality_grade,
        location: formData.location,
        description: formData.description || null,
        images: mergedImages.length ? mergedImages : null,
        status: 'active',
      })

      if (submitError) throw submitError

      navigate('/listings')
    } catch (err) {
      const message = err instanceof Error ? err.message : t('listing.create.errorDefault')
      if (
        message.toLowerCase().includes('storage') ||
        message.toLowerCase().includes('bucket') ||
        message.toLowerCase().includes('mime') ||
        message.toLowerCase().includes('object')
      ) {
        setUploadError(message)
      } else {
        setError(message)
      }
      setIsSubmitting(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-stone-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-stone-900">{t('listing.create.title')}</h1>
            <p className="text-stone-500">{t('listing.create.subtitle')}</p>
          </div>
        </div>

        <Card padding="lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
            {uploadError && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                {uploadError}
              </div>
            )}

            {/* Product Name */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary-100 rounded-lg mt-1">
                <Package className="w-5 h-5 text-primary-700" />
              </div>
              <div className="flex-1">
                <Input
                  label={t('listing.create.productNameLabel')}
                  value={formData.product_name}
                  onChange={(e) =>
                    setFormData({ ...formData, product_name: e.target.value })
                  }
                  placeholder={t('listing.create.productNamePlaceholder')}
                  required
                />
              </div>
            </div>

            {/* Category */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg mt-1">
                <Package className="w-5 h-5 text-indigo-700" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  {t('listing.create.categoryLabel')} *
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData({ ...formData, category_id: e.target.value })
                  }
                  required
                  className="block w-full px-3 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">{t('listing.create.categoryPlaceholder')}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price, Quantity, and Min Order */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-lg mt-1">
                  <DollarSign className="w-5 h-5 text-green-700" />
                </div>
                <div className="flex-1">
                  <Input
                    label={t('listing.create.priceLabel')}
                    type="number"
                    min="1"
                    value={formData.price_per_kg}
                    onChange={(e) =>
                      setFormData({ ...formData, price_per_kg: e.target.value })
                    }
                    placeholder={t('listing.create.pricePlaceholder')}
                    required
                  />
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg mt-1">
                  <Package className="w-5 h-5 text-blue-700" />
                </div>
                <div className="flex-1">
                  <Input
                    label={t('listing.create.availableQtyLabel')}
                    type="number"
                    min="1"
                    value={formData.available_quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, available_quantity: e.target.value })
                    }
                    placeholder={t('listing.create.availableQtyPlaceholder')}
                    required
                  />
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-100 rounded-lg mt-1">
                  <Package className="w-5 h-5 text-amber-700" />
                </div>
                <div className="flex-1">
                  <Input
                    label={t('listing.create.minOrderLabel')}
                    type="number"
                    min="1"
                    value={formData.min_order_kg}
                    onChange={(e) =>
                      setFormData({ ...formData, min_order_kg: e.target.value })
                    }
                    placeholder={t('listing.create.minOrderPlaceholder')}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Quality Grade */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                {t('listing.create.qualityGradeLabel')}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {QUALITY_GRADES.map((grade) => (
                  <button
                    key={grade.value}
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, quality_grade: grade.value })
                    }
                    className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                      formData.quality_grade === grade.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        formData.quality_grade === grade.value
                          ? 'border-primary-500'
                          : 'border-stone-300'
                      }`}
                    >
                      {formData.quality_grade === grade.value && (
                        <div className="w-2 h-2 rounded-full bg-primary-500" />
                      )}
                    </div>
                    <span className="text-sm font-medium">{grade.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-lg mt-1">
                <MapPin className="w-5 h-5 text-amber-700" />
              </div>
              <div className="flex-1">
                <Input
                  label={t('listing.create.locationLabel')}
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder={t('listing.create.locationPlaceholder')}
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 rounded-lg mt-1">
                <FileText className="w-5 h-5 text-purple-700" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  {t('listing.create.descriptionLabel')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder={t('listing.create.descriptionPlaceholder')}
                  rows={4}
                  className="block w-full px-3 py-2.5 border border-stone-300 rounded-lg text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                />
              </div>
            </div>

            {/* Product Images */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary-100 rounded-lg mt-1">
                <ImageIcon className="w-5 h-5 text-primary-700" />
              </div>
              <div className="flex-1 space-y-3">
                <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-4">
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-2 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                      <Upload className="w-5 h-5 text-primary-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-stone-900">
                        Upload product photos
                      </p>
                      <p className="text-xs text-stone-500">
                        JPG, PNG, or WebP up to 5MB each. You can add up to 6 images.
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelection}
                      className="hidden"
                    />
                    <span className="inline-flex items-center rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700">
                      Choose images
                    </span>
                  </label>
                </div>
                <Input
                  label="Product image URLs"
                  value={formData.image_urls}
                  onChange={(e) =>
                    setFormData({ ...formData, image_urls: e.target.value })
                  }
                  placeholder="Paste one or more image URLs, separated by commas or new lines"
                  helperText="These images will be shown on the marketplace, product page, cart, and orders. Unsplash photo-page links are converted automatically."
                />
                {(filePreviews.length > 0 || imageUrls.length > 0) && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {filePreviews.map((preview, index) => (
                      <div
                        key={`${preview.file.name}-${index}`}
                        className="relative aspect-square overflow-hidden rounded-xl border border-stone-200 bg-stone-50"
                      >
                        <img
                          src={preview.url}
                          alt={`Upload preview ${index + 1}`}
                          onError={fallbackOnImageError}
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeSelectedFile(index)}
                          className="absolute right-2 top-2 rounded-full bg-stone-900/75 px-2 py-1 text-xs font-medium text-white"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    {imageUrls.slice(0, 3).map((src, index) => (
                      <div
                        key={`${src}-${index}`}
                        className="aspect-square overflow-hidden rounded-xl border border-stone-200 bg-stone-50"
                      >
                        <img
                          src={src}
                          alt={`Preview ${index + 1}`}
                          onError={fallbackOnImageError}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
                {formData.image_urls.trim() && imageUrls.length === 0 && (
                  <p className="text-sm text-amber-700">
                    Add full `https://` image links so your products can show pictures across the app.
                  </p>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3 pt-4 border-t border-stone-100">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(-1)}
                className="flex-1"
              >
                {t('listing.create.cancel')}
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                className="flex-1"
              >
                  {t('listing.create.submit')}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  )
}
