import { Router } from 'express';

import UsuarioController from '../controllers/usuarioController';

class Rutas {
	public rutasApi: Router;

	constructor() {
		this.rutasApi = Router();
		this.config();
	}

	public config() {
		this.rutas();
	}
	public rutas() {
		// /api/v1/public/usuarios
		this.rutasApi.post('/', UsuarioController.insertUser);
		this.rutasApi.get('/:idTienda', UsuarioController.fetchUsers);
		this.rutasApi.get('/:idTienda/:idUsuario', UsuarioController.findUser);
		this.rutasApi.patch('/:idTienda/:idUsuario', UsuarioController.patchUser);
		this.rutasApi.delete('/:idTienda/:idUsuario', UsuarioController.deleteUser);
	}
}

const misRutas = new Rutas();
export default misRutas.rutasApi;
