import { z } from 'zod';

export const RolEnum = z.enum(['Administrador', 'Cajero']);

export const TiendaSchema = z.object({
	id: z.string().uuid(),
	nombre: z.string(),
	direccion: z.string(),
	telefono: z.string(),
	propietario: z.string(),
});

export const CategoriaSchema = z.object({
	id: z.string().uuid(),
	nombre: z.string(),
	descripcion: z.string(),
	tienda_id: z.string().uuid(),
});

export const ProductoSchema = z.object({
	id: z.string().uuid(),
	nombre: z.string(),
	marca: z.string(),
	precio_unitario: z.number(),
	descripcion: z.string(),
	stock: z.object({
		cantidad: z.number(),
		fecha_hora: z.string(),
	}),
	categoria_id: z.string().uuid(),
	tienda_id: z.string().uuid(),
});

export const FetchedProductSchema = z.object({
	id: z.string().uuid(),
	nombre: z.string(),
	marca: z.string(),
	precio_unitario: z.number(),
	descripcion: z.string(),
	stock: z.array(z.object({
		cantidad: z.number(),
		fecha_hora: z.string(),
	})),
	categoria: z.object({
		categoria_id: z.string().uuid(),
		nombre: z.string(),
	}),
	tienda: z.object({
		tienda_id: z.string().uuid(),
		tienda_nombre: z.string(),
	}),
});

export const productoCreateSchema = ProductoSchema.extend({
	stock: ProductoSchema.shape.stock.omit({ fecha_hora: true }),
}).omit({ id: true });

export const ProductoUpdateSchema = ProductoSchema.omit({
	id: true,
	stock: true, // Esto asegura que `stock` no sea parte del esquema
});

export const ProveedorSchema = z.object({
	id: z.string().uuid(),
	nombre: z.string(),
	contacto: z.string(),
	telefono: z.string(),
	tienda_id: z.string().uuid(),
});

export const UsuarioSchema = z.object({
	id: z.string().uuid(),
	username: z.string(),
	password: z.string(),
	tienda_id: z.string().uuid(),
	rol: RolEnum,
});

export const TokenSchema = z.object({
	username: z.string(),
	password: z.string(),
});

export const TokenDataSchema = TokenSchema.omit({
	password: true,
}).extend({
	rol: RolEnum,
	tienda_id: z.string().uuid(),
	url: z.string(),
});

export const HistorialStockItemSchema = z.object({
	producto_id: z.string().uuid(),
	cantidad: z.number(),
});

export type Categoria = z.infer<typeof CategoriaSchema>;
export type DataToken = z.infer<typeof TokenDataSchema>;
export type Producto = z.infer<typeof ProductoSchema>;
export type ProductoUpdate = z.infer<typeof ProductoUpdateSchema>;
export type ProductosFetched = z.infer<typeof FetchedProductSchema>;
export type Proveedor = z.infer<typeof ProveedorSchema>;
export type Rol = z.infer<typeof RolEnum>;
export type Tienda = z.infer<typeof TiendaSchema>;
export type Token = z.infer<typeof TokenSchema>;
export type Usuario = z.infer<typeof UsuarioSchema>;
export type ProductoCreate = z.infer<typeof productoCreateSchema>;
export type HistorialStockItem = z.infer<typeof HistorialStockItemSchema>;