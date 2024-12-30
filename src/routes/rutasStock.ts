import { Router } from 'express';
import HistorialStockController from '@controllers/historialStockController';

class rutasHistorialStock {
	public rutasApi: Router;
	constructor() {
		this.rutasApi = Router();
		this.config();
	}
	public config() {
		this.rutas();
	}
	public rutas() {
		// /api/v1/public/historialstock
		this.rutasApi.post('/', HistorialStockController.bulkInsert);
	}
}

const misRutas = new rutasHistorialStock();
export default misRutas.rutasApi;