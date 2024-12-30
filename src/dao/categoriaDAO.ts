import { Categoria, CategoriaCreate, CategoriaCreateSchema } from '../interface/eschemas';
import ProductoDAO from '../dao/productoDAO';
import prisma from '../prisma';
import Result from '../utils/Result';

export default class CategoriaDAO {
	public static async insertCategory(data: CategoriaCreate) {
		try {
			const validatedData = CategoriaCreateSchema.parse(data);

			const { nombre, descripcion, tienda_id } = validatedData;

			const countCategories = await prisma.categorias.count({
				where: {
					nombre: { equals: nombre, mode: 'insensitive' },
					descripcion: { equals: descripcion, mode: 'insensitive' },
					tienda_id: tienda_id,
				},
			});

			if (countCategories > 0) {
				return Result.fail('La categoría ya existe');
			}

			const newCategory = await prisma.categorias.create({
				data: {
					nombre,
					descripcion,
					tienda_id,
				},
			});
			return Result.success(newCategory);
		} catch (error) {
			return Result.fail(`No se puede crear la categoría, ${error}`);
		}
	}

	public static async fetchCategories(tienda_id: string) {
		try {
			const categories = await prisma.categorias.findMany({
				where: {
					tienda_id,
				},
				select: {
					id: true,
					nombre: true,
					descripcion: true,
				}
			})
			return Result.success(categories);
		} catch (error) {
			return Result.fail(`No se puede obtener las categorías, ${error}`);
		}
	}

	public static async filterCategoryIdByStore(tienda_id: string, id_categoria: string) {
		try {
			const category = await prisma.categorias.findFirst({
				where: {
					id: id_categoria,
					tienda_id: tienda_id,
				},
				select: {
					id: true,
					nombre: true,
					descripcion: true,
				},
			});

			if (!category) {
				return Result.fail('No se encontró la categoría');
			}

			const productsResult = await ProductoDAO.fetchProducts(tienda_id, id_categoria);

			if (!productsResult.isSuccess) {
				return Result.fail(productsResult.getError());
			}

			const categoryWithProducts = {
				...category,
				productos: productsResult.getValue(),
			};

			return Result.success(categoryWithProducts);
		} catch (error) {
			return Result.fail(`No se puede obtener la categoría, ${error}`);
		}
	}

	public static async updateCategory(fieldsToUpdate: Partial<Categoria>, tienda_id: string, id_categoria: string) {
		try {
			if (Object.keys(fieldsToUpdate).length === 0) {
				return Result.fail('No hay campos para actualizar');
			}

			const updatedCategory = await prisma.categorias.updateMany({
				where: {
					id: id_categoria,
					tienda_id: tienda_id,
				},
				data: fieldsToUpdate,
			});

			if (updatedCategory.count === 0) {
				return Result.fail('No se encontró la categoria para actualizar');
			}

			return Result.success();
		} catch (error) {
			return Result.fail(`No se puede actualizar la categoría, ${error}`);
		}
	}

	public static async deleteCategory(tienda_id: string, id_categoria: string) {
		try {
			const deleteResult = await prisma.$transaction(async (tx) => {
				const products = await tx.productos.findMany({
					where: {
						categoria_id: id_categoria,
						tienda_id: tienda_id,
					},
					select: { id: true },
				});

				const productIds = products.map((p) => p.id);

				if (productIds.length > 0) {
					await tx.historial_stock.deleteMany({
						where: {
							producto_id: { in: productIds },
						},
					});
				}

				await tx.productos.deleteMany({
					where: {
						categoria_id: id_categoria,
						tienda_id: tienda_id,
					},
				});

				return await tx.categorias.deleteMany({
					where: {
						id: id_categoria,
						tienda_id: tienda_id,
					},
				});
			});

			if (deleteResult.count > 0) {
				return Result.success();
			} else {
				return Result.fail('No se encontró la categoría para eliminar');
			}
		} catch (error) {
			return Result.fail(`No se puede eliminar la categoría, ${error}`);
		}
	}
}
