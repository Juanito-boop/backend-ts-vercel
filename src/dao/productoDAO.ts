import { ProductoCreate, productoCreateSchema, ProductosFetched, ProductoUpdate } from '../interface/eschemas';
import prisma from '../prisma';
import Result from '../utils/Result';

export default class ProductoDAO {
	public static async insertProduct(data: ProductoCreate) {
		try {
			const validatedData = productoCreateSchema.parse(data);

			const { nombre, marca, precio_unitario, descripcion, stock, categoria_id, tienda_id } = validatedData;

			const countProducts = await prisma.productos.count({
				where: {
					nombre: { equals: nombre, mode: 'insensitive' },
					marca: { equals: marca, mode: 'insensitive' },
					precio_unitario: precio_unitario,
					descripcion: { equals: descripcion, mode: 'insensitive' },
					categoria_id: categoria_id,
					tienda_id: tienda_id,
				},
			});

			if (countProducts > 0) {
				return Result.fail('El producto ya existe');
			}

			const newProduct = await prisma.$transaction(async (tx) => {
				const createdProduct = await tx.productos.create({
					data: {
						nombre,
						marca,
						precio_unitario,
						descripcion,
						categoria_id,
						tienda_id,
					},
				});

				await tx.historial_stock.create({
					data: {
						producto_id: createdProduct.id,
						cantidad: stock.cantidad,
					},
				});

				return createdProduct.id;
			});

			return Result.success(newProduct);
		} catch (error) {
			return Result.fail(`No se puede crear el producto, ${error}`);
		}
	}

	public static async fetchProducts(tienda_id: string, categoria_id?: string) {
		try {
			const whereClause: any = { tienda_id };
			if (categoria_id) {
				whereClause.categoria_id = categoria_id;
			}

			const products = await prisma.productos.findMany({
				where: whereClause,
				select: {
					id: true,
					nombre: true,
					marca: true,
					precio_unitario: true,
					descripcion: true,
					historial_stock: {
						select: {
							cantidad: true,
							fecha_hora: true,
						},
					},
					categorias: {
						select: {
							id: true,
							nombre: true,
						},
					},
					tiendas: {
						select: {
							id: true,
							nombre: true,
						},
					},
				},
			});

			const mappedProducts: ProductosFetched[] = products.map((p) => {
				return {
					id: p.id,
					nombre: p.nombre,
					marca: p.marca,
					precio_unitario: p.precio_unitario.toNumber(),
					descripcion: p.descripcion,
					stock: p.historial_stock.map((stock) => ({
						cantidad: stock.cantidad,
						fecha_hora: stock.fecha_hora.toISOString(),
					})),
					categoria: {
						categoria_id: p.categorias.id,
						nombre: p.categorias.nombre,
					},
					tienda: {
						tienda_id: p.tiendas.id,
						tienda_nombre: p.tiendas.nombre,
					},
				};
			});

			return Result.success(mappedProducts);
		} catch (error) {
			return Result.fail(`No se puede obtener los productos, ${error}`);
		}
	}

	public static async filterProductById(tienda_id: string, id_producto: string) {
		try {
			const product = await prisma.productos.findUnique({
				where: {
					id: id_producto,
					tienda_id: tienda_id,
				},
				select: {
					id: true,
					nombre: true,
					marca: true,
					precio_unitario: true,
					descripcion: true,
					historial_stock: {
						select: {
							cantidad: true,
							fecha_hora: true,
						},
					},
					categorias: {
						select: {
							id: true,
							nombre: true,
						},
					},
					tiendas: {
						select: {
							id: true,
							nombre: true,
						},
					},
				},
			});

			if (!product) {
				return Result.fail('Producto no encontrado');
			}

			const mappedProduct: ProductosFetched = {
				id: product.id,
				nombre: product.nombre,
				marca: product.marca,
				precio_unitario: product.precio_unitario.toNumber(),
				descripcion: product.descripcion,
				stock: product.historial_stock.map((stock) => ({
					cantidad: stock.cantidad,
					fecha_hora: stock.fecha_hora.toISOString(),
				})),
				categoria: {
					categoria_id: product.categorias.id,
					nombre: product.categorias.nombre,
				},
				tienda: {
					tienda_id: product.tiendas.id,
					tienda_nombre: product.tiendas.nombre,
				},
			};

			return Result.success(mappedProduct);
		} catch (error) {
			return Result.fail(`No se puede obtener el producto, ${error}`);
		}
	}

	public static async updateProduct(fieldsToUpdate: Partial<ProductoUpdate>, id_producto: string, tienda_id: string) {
		try {
			if (Object.keys(fieldsToUpdate).length === 0) {
				return Result.fail('No hay campos válidos para actualizar');
			}

			const updateResult = await prisma.productos.updateMany({
				where: {
					id: id_producto,
					tienda_id: tienda_id,
				},
				data: fieldsToUpdate,
			});

			if (updateResult.count === 0) {
				return Result.fail('No se encontró el producto para actualizar');
			}

			return Result.success();
		} catch (error) {
			return Result.fail(`No se puede actualizar el producto, ${error}`);
		}
	}

	public static async productsCounter(tienda_id: string): Promise<Result<number>> {
		try {
			const countProducts = await prisma.productos.count({
				where: { tienda_id: { equals: tienda_id } },
			});
			return Result.success(countProducts);
		} catch (error) {
			return Result.fail(`No se puede contar los productos, ${error}`);
		}
	}

	public static async deleteProduct(tienda_id: string, id_producto: string): Promise<Result<void>> {
		try {
			const result = await prisma.$transaction(async (tx) => {
				await tx.historial_stock.deleteMany({
					where: {
						producto_id: id_producto,
					},
				});

				const deleteProductResult = await tx.productos.deleteMany({
					where: {
						id: id_producto,
						tienda_id: tienda_id,
					},
				});

				return deleteProductResult;
			});

			if (result.count > 0) {
				return Result.success();
			} else {
				return Result.fail('Producto no encontrado');
			}
		} catch (error) {
			return Result.fail(`No se puede eliminar el producto, ${error}`);
		}
	}
}
