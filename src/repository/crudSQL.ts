export const SQL_CATEGORIAS = {
	createCategory: `
		INSERT INTO categorias (nombre, descripcion, tienda_id)
		VALUES ($1, $2, $3)
		RETURNING id;
	`,

	checkCategoryExists: `
		SELECT 1
		FROM categorias
		WHERE tienda_id = $1
			AND id = $2;
	`,

	getCategoriesByStoreId: `
		SELECT
			id,
			nombre,
			descripcion
		FROM categorias
		WHERE tienda_id = $1;
	`,

	getCategoriesByStoreAndId: `
		SELECT
			id,
			nombre,
			descripcion,
			tienda_id
		FROM categorias
		WHERE tienda_id = $1
			AND id = $2;
	`,

	isCategoryDuplicate: `
		SELECT
			COUNT(*) > 0 AS exists
		FROM categorias
		WHERE lower(nombre) = lower($1)
			AND lower(descripcion) = lower($2)
			AND tienda_id = $3;
	`,

	deleteCategory: `
		DELETE FROM categorias
		WHERE id = $1;
	`,

	getProductsByStock: `
		SELECT 
			c.nombre AS categoria_nombre, 
			p.nombre AS producto_nombre, 
			p.marca AS producto_marca
		FROM categorias c
		JOIN productos p ON c.id = p.categoria_id
		WHERE p.stock = $1;
	`,
};

export const SQL_TIENDAS = {
	createStore: `
		INSERT INTO tiendas (nombre, direccion, telefono, propietario)
		VALUES ($1, $2, $3, $4)
		RETURNING id;
	`,

	// Cambiamos 'tienda_id' a 'id', acorde al schema
	checkStoreExists: `
		SELECT 1
		FROM tiendas
		WHERE id = $1;
	`,

	// Cambiamos los nombres de columnas a las actuales (nombre, direccion, telefono, propietario)
	isStoreDuplicate: `
		SELECT COUNT(*) > 0 AS exists
		FROM tiendas
		WHERE lower(nombre) = lower($1)
			AND lower(direccion) = lower($2)
			AND lower(telefono) = lower($3)
			AND lower(propietario) = lower($4);
	`,

	// Columnas actuales en tiendas: id, nombre, direccion, telefono, propietario
	getStores: `
		SELECT id, nombre, direccion, telefono, propietario
		FROM tiendas;
	`,

	getStoreById: `
		SELECT id, nombre, direccion, telefono, propietario
		FROM tiendas
		WHERE id = $1;
	`,

	// Ajustamos el ORDER BY y las columnas para reflejar las columnas actuales de tiendas
	employeeCounter: `
		SELECT
			t.id,
			t.nombre,
			COUNT(u.id)::integer AS "# empleados"
		FROM tiendas t
		JOIN usuarios u ON t.id = u.tienda_id
		GROUP BY t.id, t.nombre
		ORDER BY t.id ASC
		LIMIT $1 OFFSET $2;
	`,

	countTotalRecords: `
		SELECT COUNT(*) FROM usuarios;
	`,

	deleteStore: `
		DELETE FROM tiendas
		WHERE id = $1;
	`,
};

export const SQL_USUARIO = {
	getUserList: `
		SELECT u.id, u.username, u.rol AS tienda
		FROM usuarios u
		JOIN tiendas t ON u.tienda_id = t.id
		WHERE u.tienda_id = $1
		ORDER BY u.rol ASC, u.username ASC;
	`,

	getAllUsersWithStore: `
		SELECT u.id, u.username, u.rol, t.nombre AS tienda
		FROM usuarios u
		JOIN tiendas t ON u.tienda_id = t.id;
	`,

	createUser: `
		INSERT INTO usuarios (username, password, tienda_id, rol)
		VALUES($1, $2, $3, $4)
		RETURNING id;
	`,

	existUserInStore: `
		SELECT 1
		FROM usuarios
		WHERE username = $1
			AND tienda_id = $2;
	`,

	isUserDuplicate: `
		SELECT COUNT(u.id) AS cantidad
		FROM usuarios u
		WHERE lower(u.username) = lower($1)
			AND lower(u.password) = lower($2)
			AND u.tienda_id = $3
			AND u.rol = $4;
	`,

	updateUser: `
		UPDATE usuarios
		SET username = $1,
				password = $2,
				tienda_id = $3,
				rol = $4
		WHERE id = $5;
	`,

	roleUsersCount: `
		SELECT rol, COUNT(id) AS cantidad
		FROM usuarios
		GROUP BY rol;
	`,

	findUserByUsernameAndPassword: `
		SELECT id, username, password, tienda_id, rol
		FROM usuarios
		WHERE username = $1
			AND password = $2;
	`,

	getUsersByStoreId: `
		SELECT u.id, u.rol, u.username, t.nombre_tienda AS tienda
		FROM usuarios u
		JOIN tiendas t ON u.tienda_id = t.id
		WHERE u.tienda_id = $1;
	`,

	findUserById: `
		SELECT id, username, password, tienda_id, rol
		FROM usuarios
		WHERE id = $1;
	`,

	findUserByStoreAndId: `
		SELECT id, username, password, tienda_id, rol
		FROM usuarios
		WHERE id = $1
			AND tienda_id = $2;
	`,

	deleteUser: `
		DELETE FROM usuarios
		WHERE id = $1
			AND tienda_id = $2;
	`,
};
