import prisma from "@/lib/prisma";
import CreateProductForm from "./CreateProductForm";
import ProductItem from "./ProductItem";

export default async function AdminProductsPage() {
    const productsRaw = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
        include: { variants: true }
    });

    const products = productsRaw.map(product => ({
        ...product,
        variants: product.variants.map(variant => ({
            ...variant,
            price: Number(variant.price)
        }))
    }));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Productos</h1>
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
