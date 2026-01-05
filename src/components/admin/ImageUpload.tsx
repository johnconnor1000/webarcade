'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { optimizeImage } from '@/lib/image-optimizer'
import Image from 'next/image'

interface ImageUploadProps {
    currentImageUrl?: string | null
    onUploadComplete: (url: string) => void
    label?: string
}

export default function ImageUpload({ currentImageUrl, onUploadComplete, label }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [preview, setPreview] = useState<string | null>(currentImageUrl || null)
    const [error, setError] = useState<string | null>(null)

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setError(null)
            const file = event.target.files?.[0]
            if (!file) return

            setUploading(true)

            // 1. Verificar configuración
            if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
                throw new Error('Configuración de Supabase incompleta. Verifica las variables de entorno en Vercel.')
            }

            // 2. Optimizar imagen en el cliente (max 800px)
            const optimizedBlob = await optimizeImage(file)

            // Preview local inmediato
            const localPreview = URL.createObjectURL(optimizedBlob)
            setPreview(localPreview)

            // 3. Generar nombre de archivo único
            const fileExt = 'jpg'
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
            const filePath = `products/${fileName}`

            // 4. Subir a Supabase Storage
            const { error: uploadError, data } = await supabase.storage
                .from('product-images')
                .upload(filePath, optimizedBlob, {
                    contentType: 'image/jpeg',
                    upsert: true
                })

            if (uploadError) throw uploadError

            // 5. Obtener URL pública
            const { data: { publicUrl } } = supabase.storage
                .from('product-images')
                .getPublicUrl(filePath)

            onUploadComplete(publicUrl)
        } catch (err: any) {
            console.error('Error uploading:', err)
            // Error amigable para el usuario
            let message = 'Error al subir la imagen'
            if (err.message === 'Failed to fetch') {
                message = 'Error de conexión: Verifica que las variables NEXT_PUBLIC_SUPABASE_URL y KEY estén en Vercel.'
            } else if (err.message) {
                message = err.message
            }
            setError(message)
            setPreview(currentImageUrl || null)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="space-y-2">
            {label && <label className="block text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">{label}</label>}

            <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-lg bg-slate-950 border border-white/10 overflow-hidden flex-shrink-0">
                    {preview ? (
                        <Image
                            src={preview}
                            alt="Preview"
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-700">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6.75a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5-1.5v12.75a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            </svg>
                        </div>
                    )}
                    {uploading && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>

                <div className="flex-1">
                    <label className="cursor-pointer">
                        <span className="inline-block px-3 py-1.5 bg-slate-950 border border-white/10 rounded text-[10px] font-medium text-slate-300 hover:text-white hover:border-white/20 transition-all">
                            {uploading ? 'Subiendo...' : preview ? 'Cambiar Foto' : 'Subir Foto'}
                        </span>
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleUpload}
                            disabled={uploading}
                        />
                    </label>
                    {error && <p className="text-[10px] text-red-500 mt-1">{error}</p>}
                </div>
            </div>
        </div>
    )
}
