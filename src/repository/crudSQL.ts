export const SQL_CATEGORIAS = {
	createCategory: `
		INSERT INTO categorias (nombre, descripcion, tienda_id) 
		VALUES ($1, $2, $3) 
		RETURNING id`,
	checkCategoryExists: `
		SELECT 1 
		FROM categorias 
		WHERE tienda_id = $1 
			AND id = $2`,
	getCategoriesByStoreId: `
		SELECT 
			id, 
			nombre, 
			descripcion
		FROM categorias
		WHERE tienda_id = $1`,
	getCategoriesByStoreAndId: `
		SELECT 
			id, 
			nombre, 
			descripcion, 
			tienda_id 
		FROM categorias 
		WHERE tienda_id = $1 
			AND id = $2`,
	isCategoryDuplicate: `
		SELECT 
			COUNT(*) > 0 AS exists 
		FROM categorias 
		WHERE lower(nombre) = lower($1) 
			AND lower(descripcion) = lower($2) 
			AND tienda_id = $3;`,
	deleteCategory: `
		DELETE FROM categorias e 
		WHERE e.id = $1`,
	getProductsByStock: `
		SELECT 
			c.nombre, 
			p.nombre, 
			p.marca 
		FROM categorias c 
		JOIN productos p 
			ON c.id = p.id 
		WHERE p.stock = $1`,
};

export const SQL_PRODUCTOS = {
	countProducts: `
		SELECT COUNT(*) 
		FROM productos 
		WHERE tienda_id = $1`,
	getProductsByStoreId: `
    SELECT 
			p.id, p.nombre, p.marca, p.precio_unitario, p.descripcion, p.stock, c.id AS categoria_id, c.nombre AS categoria_nombre, t.id AS tienda_id, t.nombre AS tienda_nombre
    FROM productos p
    JOIN categorias c ON c.id = p.categoria_id
    JOIN tiendas t ON t.id = p.tienda_id
    WHERE p.tienda_id = $1`,
	CREAR: `
		INSERT INTO productos (nombre, marca, precio_unitario, descripcion, stock, categoria_id, tienda_id) 
		VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id;`,
	checkProductExists: `
		SELECT * FROM productos WHERE tienda_id = $1 AND id = $2`,
	isProductDuplicate: `
		SELECT EXISTS (
    SELECT 1 
    FROM productos 
    WHERE lower(nombre) = lower($1) 
      AND lower(marca) = lower($2) 
      AND precio_unitario = $3 
      AND lower(descripcion) = lower($4) 
      AND stock = $5 
      AND categoria_id = $6 
      AND tienda_id = $7
) AS exists;`,
	ELIMINAR: `DELETE FROM productos WHERE id = $1`,
	ACTUALIZAR: `
    UPDATE productos 
    SET nombre = $1, 
        marca = $2, 
        precio_unitario = $3, 
        descripcion = $4, 
        stock = $5, 
        categoria_id = $6, 
        tienda_id = $7 
    WHERE id = $8 AND tienda_id = $9`,
	VARIEDAD: `SELECT c.nombre, COUNT(DISTINCT p.id_producto) AS num_productos FROM categorias c JOIN productos p ON c.id_categoria = p.id_categoria GROUP BY c.nombre;`,
	DATE_SQL: `SELECT f.fecha_venta, SUM(f.cantidad_producto) FROM facturas f WHERE f.fecha_venta BETWEEN $1 AND $2 GROUP BY f.fecha_venta`,
	LISTARPORID: `SELECT * FROM productos WHERE tienda_id = $1`,
	checkProductExistsID: `SELECT 1 FROM productos WHERE id_producto = $1`
};

export const SQL_TIENDAS = {
	createStore: `
		INSERT INTO tiendas (nombre, direccion, telefono, propietario) 
		VALUES ($1, $2, $3, $4) 
		RETURNING id`,
	checkStoreExists: `
		SELECT 1 
		FROM tiendas 
		WHERE tienda_id = $1`,
	isStoreDuplicate: `SELECT COUNT(*) > 0 AS exists FROM tiendas WHERE lower(nombre_tienda) = lower($1) and lower(direccion_tienda) = lower($2) and lower(telefono_tienda) = lower($3) and lower(propietario_tienda) = lower($4)`,
	getStores: `SELECT tienda_id, nombre_tienda, direccion_tienda, telefono_tienda FROM tiendas`,
	getStoreById: "SELECT tienda_id, nombre_tienda, direccion_tienda, telefono_tienda FROM tiendas WHERE tienda_id = $1",
	employeeCounter: `
		SELECT 
			t.id, 
			t.nombre, 
			COUNT(u.id)::integer as "# empleados" 
		FROM tiendas t 
		JOIN usuarios u 
			ON t.id = u.tienda_id 
		GROUP BY 
			t.id, 
			t.nombre 
		ORDER BY t.tienda_id ASC 
		LIMIT $1 OFFSET $2;`,
	countTotalRecords:"SELECT COUNT(*) FROM usuarios",
	deleteStore: "DELETE FROM tiendas WHERE tienda_id = $1",
}

export const SQL_TOKEN ={
	FETCH_USER_CREDENTIALS: `
		SELECT 
			u.username, 
			u.tienda_id, 
			u.rol 
		FROM usuarios u 
		WHERE u.username = $1 
			AND u.password = $2;`,
};

export const SQL_USUARIO = {
	getUserList: `SELECT id, username, password, tienda_id, rol FROM usuarios WHERE tienda_id = $1 ORDER BY rol ASC, id ASC`,
	getAllUsersWithStore: `SELECT u.id, u.rol, u.username, t.nombre_tienda AS tiendaFROM usuarios uJOIN tiendas t ON u.tienda_id = t.id;`,
	createUser: `INSERT INTO usuarios (username, password, tienda_id, rol)VALUES($1, $2, $3, $4)RETURNING id`,
	existUserInStore: `SELECT 1 FROM usuarios WHERE username = $1 AND tienda_id = $2`,
	isUserDuplicate: `SELECT COUNT(u.id) AS cantidad FROM usuarios uWHERE lower(u.username) = lower($1)	AND lower(u.password) = lower($2)	AND u.tienda_id = $3	AND u.rol = $4`,
	updateUser: `UPDATE usuarios SET username = $1, password = $2, tienda_id = $3, rol = $4WHERE id = $5`,
	roleUsersCount: `SELECT rol, COUNT(id) AS cantidadFROM usuariosGROUP BY rol;`,
	findUserByUsernameAndPassword: `SELECT id, username, password, tienda_id, rolFROM usuariosWHERE username = $1 AND password = $2;`,
	getUsersByStoreId: `SELECT u.id, u.rol, u.username, t.nombre_tienda AS tiendaFROM usuarios uJOIN tiendas t ON u.tienda_id = t.idWHERE u.tienda_id = $1`,
	findUserById: `SELECT id, username, password, tienda_id, rolFROM usuariosWHERE id = $1`,
	findUserByStoreAndId: `SELECT id, username, password, tienda_id, rolFROM usuariosWHERE id = $1 AND tienda_id = $2`,
	deleteUser: `DELETE FROM usuariosWHERE id = $1 AND tienda_id = $2`,
};