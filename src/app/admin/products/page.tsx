import prisma from "@/lib/prisma";
import CreateProductForm from "./CreateProductForm";
import ProductItem from "./ProductItem";
import BulkPriceUpdate from "./BulkPriceUpdate";

export default async function AdminProductsPage() {
    const productsRaw = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
        include: { variants: true }
    });

    const categories = Array.from(new Set(productsRaw.map(p => p.category).filter(Boolean))) as string[];

    const products = productsRaw.map(product => ({
        ...product,
        basePrice: Number(product.basePrice),
        ledSurcharge: Number(product.ledSurcharge || 0),
        variants: product.variants.map(variant => ({
            ...variant,
            price: Number(variant.price)
        }))
    }));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Productos</h1>
                <BulkPriceUpdate categories={categories} />
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Product List */}
                <div className="lg:col-span-2 space-y-4">
                    {products.map((product) => (
                        <ProductItem key={product.id} product={product} />
                    ))}
                    {products.length === 0 && (
                        <div className="text-center py-10 text-slate-500">No hay productos registrados.</div>
                    )}
                </div>

                {/* Add Product Form */}
                <CreateProductForm />
            </div>
        </div>
    );
}
