import { useState, type FormEvent, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Card, Input, Button } from '../components/ui'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { ArrowLeft, Package, MapPin, DollarSign, FileText } from 'lucide-react'
import type { ProduceListing } from '../types'

const QUALITY_GRADES: { value: ProduceListing['quality_grade']; label: string }[] = [
  { value: 'A', label: 'Grade A - Premium Quality' },
  { value: 'B', label: 'Grade B - Standard Quality' },
  { value: 'C', label: 'Grade C - Fair Quality' },
  { value: 'D', label: 'Grade D - Basic Quality' },
]

export function CreateListing() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [categories, setCategories] = useState<{id: string, name: string}[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  void isLoadingCategories; void setIsLoadingCategories // reference to avoid unused warning

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
    } finally {
      setIsLoadingCategories(false)
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
  })

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return

    setError('')
    setIsSubmitting(true)

    try {
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
        status: 'active',
      })

      if (submitError) throw submitError

      navigate('/listings')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create listing')
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
            <h1 className="text-2xl font-bold text-stone-900">Create Listing</h1>
            <p className="text-stone-500">List your produce for sale</p>
          </div>
        </div>

        <Card padding="lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Product Name */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary-100 rounded-lg mt-1">
                <Package className="w-5 h-5 text-primary-700" />
              </div>
              <div className="flex-1">
                <Input
                  label="Product Name"
                  value={formData.product_name}
                  onChange={(e) =>
                    setFormData({ ...formData, product_name: e.target.value })
                  }
                  placeholder="e.g., Long Grain Rice, Honey Beans"
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
                  Category *
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData({ ...formData, category_id: e.target.value })
                  }
                  required
                  className="block w-full px-3 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
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
                    label="Price per kg (₦)"
                    type="number"
                    min="1"
                    value={formData.price_per_kg}
                    onChange={(e) =>
                      setFormData({ ...formData, price_per_kg: e.target.value })
                    }
                    placeholder="e.g., 500"
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
                    label="Available Quantity (kg)"
                    type="number"
                    min="1"
                    value={formData.available_quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, available_quantity: e.target.value })
                    }
                    placeholder="e.g., 1000"
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
                    label="Min Order (kg)"
                    type="number"
                    min="1"
                    value={formData.min_order_kg}
                    onChange={(e) =>
                      setFormData({ ...formData, min_order_kg: e.target.value })
                    }
                    placeholder="e.g., 5"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Quality Grade */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Quality Grade
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
                  label="Location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="e.g., Ibadan, Oyo State"
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
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Add details about your produce..."
                  rows={4}
                  className="block w-full px-3 py-2.5 border border-stone-300 rounded-lg text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                />
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
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                className="flex-1"
              >
                Create Listing
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  )
}
