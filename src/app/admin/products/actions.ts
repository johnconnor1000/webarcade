'use server'

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createProduct(formData: FormData) {
    const name = formData.get('name') as string
    const category = formData.get('category') as string
    const subcategory = formData.get('subcategory') as string
    const basePrice = parseFloat(formData.get('basePrice') as string) || 0
    const ledSurcharge = parseFloat(formData.get('ledSurcharge') as string) || 0


    // Parse variants from form data (expected format: variant_name_0, variant_price_0, etc.)
    const variants = []
    let i = 0
    while (formData.has(`variant_name_${i}`)) {
        variants.push({
            name: formData.get(`variant_name_${i}`) as string,
            imageUrl: formData.get(`variant_image_${i}`) as string || null
        })
        i++
    }


    if (variants.length === 0) {
        // Fallback or error? For now allow, but UI should prevent.
    }

    await prisma.product.create({
        data: {
            name,
            category,
            subcategory,
            basePrice,
            ledSurcharge,
            description: "Descripción pendiente...",

            variants: {
                create: variants
            }
        }
    })

    revalidatePath('/admin/products')
}

export async function updateProduct(formData: FormData) {
    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const category = formData.get('category') as string
    const subcategory = formData.get('subcategory') as string
    const basePrice = parseFloat(formData.get('basePrice') as string) || 0
    const ledSurcharge = parseFloat(formData.get('ledSurcharge') as string) || 0


    // Parse variants from form data
    const variants = []
    let i = 0
    while (formData.has(`variant_name_${i}`)) {
        variants.push({
            id: formData.get(`variant_id_${i}`) as string || undefined,
            name: formData.get(`variant_name_${i}`) as string,
            imageUrl: formData.get(`variant_image_${i}`) as string || null
        })
        i++
    }


    // 1. Update basic info
    await prisma.product.update({
        where: { id },
        data: {
            name,
            category,
            subcategory,
            basePrice,
            ledSurcharge
        }

    })


    // 2. Handle variants
    const currentVariants = await prisma.productVariant.findMany({
        where: { productId: id }
    })

    const currentVariantIds = currentVariants.map(v => v.id)
    const submittedVariantIds = variants.filter(v => v.id).map(v => v.id as string)

    // Delete removed variants (careful: Prisma will fail if they are in orders)
    const variantsToDelete = currentVariantIds.filter(vid => !submittedVariantIds.includes(vid))

    for (const vid of variantsToDelete) {
        try {
            await prisma.productVariant.delete({ where: { id: vid } })
        } catch (error) {
            console.error(`Could not delete variant ${vid}, it's probably in use:`, error)
            // We could return an error to the UI here
        }
    }

    // Upsert (Update or Create) variants
    for (const v of variants) {
        if (v.id) {
            await prisma.productVariant.update({
                where: { id: v.id },
                data: {
                    name: v.name,
                    imageUrl: v.imageUrl
                }
            })

        } else {
            await prisma.productVariant.create({
                data: {
                    name: v.name,
                    imageUrl: v.imageUrl,
                    productId: id
                }

            })
        }
    }

    revalidatePath('/admin/products')
}

export async function deleteProduct(formData: FormData) {
    const id = formData.get('id') as string
    try {
        await prisma.product.delete({ where: { id } })
        revalidatePath('/admin/products')
        return { success: true }
    } catch (error) {
        console.error("Error deleting product:", error)
        return { success: false, error: "No se puede eliminar un producto que ya tiene pedidos asociados." }
    }
}

export async function bulkUpdatePrices(formData: FormData) {
    const category = formData.get('category') as string
    const percentage = parseFloat(formData.get('percentage') as string)

    if (!percentage || isNaN(percentage)) {
        throw new Error('Porcentaje inválido')
    }

    const multiplier = 1 + (percentage / 100)

    try {
        const products = await prisma.product.findMany({
            where: category && category !== 'ALL' ? { category } : {}
        })

        for (const product of products) {
            const newPrice = Number(product.basePrice) * multiplier
            await prisma.product.update({
                where: { id: product.id },
                data: { basePrice: newPrice }
            })
        }

        revalidatePath('/admin/products')
        return { success: true }
    } catch (error) {

        console.error("Error updating prices:", error)
        throw error
    }
}

