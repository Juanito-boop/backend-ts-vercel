import cors						from "cors";
import { config }			from "dotenv";
import express				from "express";
import morgan					from "morgan";
import portfinder			from 'portfinder';

import seguridad			from "./middleware/Seguridad";

import rutasCategorias from "./routes/rutasCategorias";
import rutasProductos  from "./routes/rutasProductos";
import rutasTienda     from "./routes/rutasTienda";
import rutasUsuario    from "./routes/rutasUsuario";
import tokenRuta       from "./routes/TokenRuta";

export default class application {
	public app: express.Application;
	public port: number;
	v1: string = "/api/v1/public";

	constructor() {
		this.app = express();
		config({ path: "./.env" });
		this.port = parseInt(process.env.SERVER_PORT || "8082", 10);
		this.iniciarConfig();
		this.activarRutas();
		this.arrancar();
	}
	
	public iniciarConfig(): void {
		this.app.set("PORT", this.port);
		const corsOptions: cors.CorsOptions = {
			origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
			methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
			allowedHeaders: ["Content-Type", "Authorization"],
		};
		this.app.use(cors(corsOptions));
		this.app.use(morgan("dev"));
		this.app.use(express.json({ limit: "100mb" }));
		this.app.use(express.urlencoded({ extended: true }));
	}

	public activarRutas(): void {
		this.app.get("/", (req, res) => res.send("Express on Vercel"));
		this.app.use(`${this.v1}/categorias`, seguridad.revisar, rutasCategorias);
		this.app.use(`${this.v1}/productos`, seguridad.revisar, rutasProductos);
		this.app.use(`${this.v1}/tiendas`, seguridad.revisar, rutasTienda);
		this.app.use(`${this.v1}/token`, tokenRuta);
		this.app.use(`${this.v1}/usuarios`, seguridad.revisar, rutasUsuario);
	}

	public arrancar(): void {
		portfinder.basePort = this.port;
		portfinder
			.getPortPromise()
			.then((port) => {
				this.app.listen(port, () => {
					console.log(`Servidor corriendo en el puerto ${port}`);
				});
			})
			.catch((err) => {
				console.error("No se pudo encontrar un puerto disponible:", err);
				const fallbackPort = 8082;
				this.app.listen(fallbackPort, () => {
					console.log(`Servidor corriendo en el puerto ${fallbackPort} (fallback)`);
				});
			});
	}
}

new application();