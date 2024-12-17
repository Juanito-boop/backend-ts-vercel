import { z } from 'zod';

export const RolEnum = z.enum(['admin', 'user']);

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
	stock: z.number().int(),
	categoria_id: z.string().uuid(),
	tienda_id: z.string().uuid(),
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

//
const CategoriaReducedSchema = z.object({
	categoria_id: z.string().uuid(),
	nombre: z.string(),
});

const TiendaReducedSchema = z.object({
	tienda_id: z.string().uuid(),
	tienda_nombre: z.string(),
});

export const ProductosFetchedSchema = ProductoSchema.omit({
	categoria_id: true,
	tienda_id: true,
}).extend({
	categoria: CategoriaReducedSchema,
	tienda: TiendaReducedSchema,
});
//

export const TokenSchema = z.object({
	username: z.string(),
	password: z.string(),
});

export const TokenDataSchema = TokenSchema.omit({
	password: true,
}).extend({
	rol: RolEnum,
	tienda_id: z.string().uuid(),
});

export type Categoria = z.infer<typeof CategoriaSchema>;
export type DataToken = z.infer<typeof TokenDataSchema>;
export type Producto = z.infer<typeof ProductoSchema>;
export type ProductosFetched = z.infer<typeof ProductosFetchedSchema>;
export type Proveedor = z.infer<typeof ProveedorSchema>;
export type Rol = z.infer<typeof RolEnum>;
export type Tienda = z.infer<typeof TiendaSchema>;
export type Token = z.infer<typeof TokenSchema>;
export type Usuario = z.infer<typeof UsuarioSchema>;
