export type MetodoPago = 'Efectivo' | 'Nequi' | 'Llave';

export interface SandwichConfig {
  id: string;
  nombre: string;
  stock: number;
  precioVenta: number;
  costoUnitario: number;
}

export interface RegistroVenta {
  id: string;
  tipoSandwich: string;
  cantidad: number;
  metodoPago: MetodoPago;
  precioUnitario: number;
  costoUnitario: number;
  total: number;
  ganancia: number;
  timestamp: string; // ISO string
}

export type PantallaActiva = 'inicio' | 'registro' | 'ventas';
