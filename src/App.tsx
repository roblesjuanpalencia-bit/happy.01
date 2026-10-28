/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Home,
  Boxes,
  TrendingUp,
  ShoppingBag,
  Plus,
  Minus,
  Check,
  Trash2,
  Edit2,
  DollarSign,
  Banknote,
  Smartphone,
  Key,
  X,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { SandwichConfig, RegistroVenta, MetodoPago, PantallaActiva } from './types';
import { formatCOP, formatHora } from './utils/formatters';

const SANDWICHES_INICIALES: SandwichConfig[] = [
  {
    id: 'clasico-happy',
    nombre: 'Clásico Happy',
    stock: 12,
    precioVenta: 15000,
    costoUnitario: 9500,
  },
  {
    id: 'pollo-especial',
    nombre: 'Pollo Especial',
    stock: 10,
    precioVenta: 15000,
    costoUnitario: 9500,
  },
  {
    id: 'vegetariano',
    nombre: 'Vegetariano',
    stock: 8,
    precioVenta: 15000,
    costoUnitario: 9500,
  },
];

export default function App() {
  // Pestaña activa: 'inicio' | 'registro' | 'ventas'
  const [pantalla, setPantalla] = useState<PantallaActiva>('inicio');

  // Catálogo y Stock de sándwiches
  const [sandwiches, setSandwiches] = useState<SandwichConfig[]>(() => {
    try {
      const guardado = localStorage.getItem('happy_sandwiches_config');
      if (guardado) {
        const parsed = JSON.parse(guardado);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignored
    }
    return SANDWICHES_INICIALES;
  });

  // Historial de ventas
  const [ventas, setVentas] = useState<RegistroVenta[]>(() => {
    try {
      const guardado = localStorage.getItem('happy_ventas_registro');
      if (guardado) {
        const parsed = JSON.parse(guardado);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Ignored
    }
    return [];
  });

  // Modal para la venta en pantalla Inicio
  const [modalVentaAbierto, setModalVentaAbierto] = useState<boolean>(false);
  const [sandwichSeleccionadoId, setSandwichSeleccionadoId] = useState<string>('');
  const [cantidadVenta, setCantidadVenta] = useState<number>(1);
  const [metodoPagoVenta, setMetodoPagoVenta] = useState<MetodoPago>('Efectivo');
  const [mensajeAlerta, setMensajeAlerta] = useState<string | null>(null);

  // Estados para pantalla Registro (añadir / editar sándwich)
  const [modalEditarAbierto, setModalEditarAbierto] = useState<boolean>(false);
  const [sandwichEditando, setSandwichEditando] = useState<SandwichConfig | null>(null);
  const [nuevoNombre, setNuevoNombre] = useState<string>('');
  const [nuevoStock, setNuevoStock] = useState<number>(10);
  const [nuevoPrecio, setNuevoPrecio] = useState<number>(15000);
  const [nuevoCosto, setNuevoCosto] = useState<number>(9500);

  // Guardar en localStorage
  useEffect(() => {
    try {
      localStorage.setItem('happy_sandwiches_config', JSON.stringify(sandwiches));
    } catch (e) {
      console.error(e);
    }
  }, [sandwiches]);

  useEffect(() => {
    try {
      localStorage.setItem('happy_ventas_registro', JSON.stringify(ventas));
    } catch (e) {
      console.error(e);
    }
  }, [ventas]);

  // Selección inicial automática si no hay seleccionado
  useEffect(() => {
    if (sandwiches.length > 0 && !sandwichSeleccionadoId) {
      setSandwichSeleccionadoId(sandwiches[0].id);
    }
  }, [sandwiches, sandwichSeleccionadoId]);

  // Cálculos de Ganancias por Método de Pago
  const gananciaEfectivo = ventas
    .filter((v) => v.metodoPago === 'Efectivo')
    .reduce((acc, v) => acc + v.ganancia, 0);

  const gananciaNequi = ventas
    .filter((v) => v.metodoPago === 'Nequi')
    .reduce((acc, v) => acc + v.ganancia, 0);

  const gananciaLlave = ventas
    .filter((v) => v.metodoPago === 'Llave')
    .reduce((acc, v) => acc + v.ganancia, 0);

  const gananciaTotal = gananciaEfectivo + gananciaNequi + gananciaLlave;

  const totalVentasDinero = ventas.reduce((acc, v) => acc + v.total, 0);
  const totalUnidadesVendidas = ventas.reduce((acc, v) => acc + v.cantidad, 0);
  const stockTotalDisponible = sandwiches.reduce((acc, s) => acc + s.stock, 0);

  // Abrir modal de venta
  const abrirModalVenta = () => {
    if (sandwiches.length === 0) {
      alert('Debes agregar al menos un sándwich en la pantalla de Registro.');
      return;
    }
    setSandwichSeleccionadoId(sandwiches[0].id);
    setCantidadVenta(1);
    setMetodoPagoVenta('Efectivo');
    setModalVentaAbierto(true);
  };

  // Confirmar Venta
  const confirmarVenta = () => {
    const sw = sandwiches.find((s) => s.id === sandwichSeleccionadoId);
    if (!sw) return;

    if (cantidadVenta <= 0) {
      alert('Ingresa una cantidad válida mayor a 0');
      return;
    }

    const total = cantidadVenta * sw.precioVenta;
    const ganancia = cantidadVenta * (sw.precioVenta - sw.costoUnitario);

    // 1. Crear registro de venta
    const nuevaVenta: RegistroVenta = {
      id: `v-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      tipoSandwich: sw.nombre,
      cantidad: cantidadVenta,
      metodoPago: metodoPagoVenta,
      precioUnitario: sw.precioVenta,
      costoUnitario: sw.costoUnitario,
      total,
      ganancia,
      timestamp: new Date().toISOString(),
    };

    setVentas((prev) => [nuevaVenta, ...prev]);

    // 2. Descontar stock
    setSandwiches((prev) =>
      prev.map((s) =>
        s.id === sw.id ? { ...s, stock: Math.max(0, s.stock - cantidadVenta) } : s
      )
    );

    setModalVentaAbierto(false);
    setMensajeAlerta(`¡Venta registrada! ${cantidadVenta}x ${sw.nombre} por ${metodoPagoVenta}`);
    setTimeout(() => setMensajeAlerta(null), 3000);
  };

  // Eliminar venta (restaura el stock)
  const eliminarVenta = (id: string) => {
    const v = ventas.find((item) => item.id === id);
    if (!v) return;

    if (window.confirm(`¿Eliminar venta de ${v.cantidad}x ${v.tipoSandwich}? Se restaurará el stock.`)) {
      // Restaurar stock
      setSandwiches((prev) =>
        prev.map((s) =>
          s.nombre === v.tipoSandwich ? { ...s, stock: s.stock + v.cantidad } : s
        )
      );
      // Eliminar
      setVentas((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // Ajustar stock directamente desde pantalla de Registro
  const ajustarStock = (id: string, delta: number) => {
    setSandwiches((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, stock: Math.max(0, s.stock + delta) } : s
      )
    );
  };

  const setStockDirecto = (id: string, valor: number) => {
    setSandwiches((prev) =>
      prev.map((s) => (s.id === id ? { ...s, stock: Math.max(0, valor) } : s))
    );
  };

  // Guardar edición de un sándwich
  const guardarEdicionSandwich = () => {
    if (!sandwichEditando || !sandwichEditando.nombre.trim()) return;

    setSandwiches((prev) =>
      prev.map((s) => (s.id === sandwichEditando.id ? sandwichEditando : s))
    );
    setModalEditarAbierto(false);
    setSandwichEditando(null);
  };

  // Eliminar tipo de sándwich
  const eliminarTipoSandwich = (id: string) => {
    if (sandwiches.length <= 1) {
      alert('Debes mantener al menos un tipo de sándwich.');
      return;
    }
    if (window.confirm('¿Seguro que deseas eliminar este tipo de sándwich?')) {
      setSandwiches((prev) => prev.filter((s) => s.id !== id));
    }
  };

  // Crear nuevo sándwich
  const crearNuevoSandwich = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) return;

    const nuevo: SandwichConfig = {
      id: `sw-${Date.now()}`,
      nombre: nuevoNombre.trim(),
      stock: nuevoStock >= 0 ? nuevoStock : 0,
      precioVenta: nuevoPrecio > 0 ? nuevoPrecio : 15000,
      costoUnitario: nuevoCosto >= 0 ? nuevoCosto : 9500,
    };

    setSandwiches((prev) => [...prev, nuevo]);
    setNuevoNombre('');
    setNuevoStock(10);
    setNuevoPrecio(15000);
    setNuevoCosto(9500);
  };

  const sandwichActualVenta = sandwiches.find((s) => s.id === sandwichSeleccionadoId);
  const totalCobrarVenta = (sandwichActualVenta?.precioVenta || 15000) * cantidadVenta;

  return (
    <div className="min-h-screen bg-neutral-900 flex justify-center text-slate-900 font-sans antialiased">
      {/* Contenedor móvil centrado con tema rojo */}
      <div className="w-full max-w-md bg-white min-h-screen flex flex-col relative pb-20 shadow-2xl border-x border-red-100">
        {/* Cabecera Roja Vibrante */}
        <header className="bg-red-600 text-white px-5 py-4 sticky top-0 z-20 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl" role="img" aria-label="sandwich">🥪</span>
              <div>
                <h1 className="text-xl font-black tracking-tight leading-none">
                  HAPPY
                </h1>
                <span className="text-[11px] text-red-100 font-medium">
                  {pantalla === 'inicio' && 'Inicio · Panel Principal'}
                  {pantalla === 'registro' && 'Registro · Stock y Menú'}
                  {pantalla === 'ventas' && 'Ventas · Ganancias por Método'}
                </span>
              </div>
            </div>

            {/* Indicador de stock total */}
            <div className="bg-red-700/80 px-2.5 py-1 rounded-lg text-right border border-red-500/50">
              <span className="text-[10px] text-red-200 block uppercase font-bold leading-tight">Stock Total</span>
              <span className="text-sm font-black font-mono leading-tight">{stockTotalDisponible} un.</span>
            </div>
          </div>
        </header>

        {/* Notificación flotante de confirmación */}
        {mensajeAlerta && (
          <div className="mx-4 mt-3 p-3 bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg animate-fade-in z-20">
            <Check className="w-4 h-4 stroke-[3]" />
            <span className="flex-1">{mensajeAlerta}</span>
          </div>
        )}

        {/* ============================================================ */}
        {/* PANTALLA 1: INICIO */}
        {/* ============================================================ */}
        {pantalla === 'inicio' && (
          <div className="p-5 flex-1 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              {/* Resumen Superior */}
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                <div className="flex items-center justify-between text-xs font-bold text-red-800 uppercase tracking-wider mb-2">
                  <span>Balance del Turno</span>
                  <span className="font-mono text-slate-500">{ventas.length} ventas</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-xl border border-red-100 shadow-xs">
                    <span className="text-[11px] text-slate-500 block">Total Vendido</span>
                    <span className="text-lg font-black text-slate-900 font-mono tabular-nums">
                      {formatCOP(totalVentasDinero)}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-red-100 shadow-xs">
                    <span className="text-[11px] text-slate-500 block">Ganancia Acumulada</span>
                    <span className="text-lg font-black text-red-600 font-mono tabular-nums">
                      {formatCOP(gananciaTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Disponibilidad rápida de sándwiches */}
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Disponibles para venta
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {sandwiches.map((sw) => (
                    <div
                      key={sw.id}
                      className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-2xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 text-sm block">
                          {sw.nombre}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">
                          {formatCOP(sw.precioVenta)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-base font-black font-mono ${
                            sw.stock <= 2 ? 'text-red-600 font-bold' : 'text-slate-800'
                          }`}
                        >
                          {sw.stock} disponibles
                        </span>
                        {sw.stock <= 2 && (
                          <span className="text-[10px] text-red-600 block font-semibold">¡Poco stock!</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* GRAN BOTÓN PROTAGÓNICO: VENTA */}
            <div className="pt-4 pb-2">
              <button
                type="button"
                onClick={abrirModalVenta}
                className="w-full h-24 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white rounded-3xl font-black text-3xl shadow-xl shadow-red-600/35 flex items-center justify-center gap-3 transition-all border-2 border-red-500"
              >
                <ShoppingBag className="w-9 h-9 stroke-[2.5]" />
                <span>VENTA</span>
              </button>
              <p className="text-center text-xs text-slate-400 mt-2 font-medium">
                Toca para seleccionar sándwich y método (Efectivo, Nequi, Llave)
              </p>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* PANTALLA 2: REGISTRO (Stock y Catálogo de Sándwiches) */}
        {/* ============================================================ */}
        {pantalla === 'registro' && (
          <div className="p-5 flex-1 flex flex-col space-y-6">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Control de Stock e Inventario
              </h2>
              <p className="text-xs text-slate-500">
                Ingresa cuántos sándwiches tienes en existencia y modifica los tipos
              </p>
            </div>

            {/* Listado de Sándwiches con Controles de Stock */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-red-700 uppercase tracking-wider block">
                Sándwiches Actuales ({sandwiches.length})
              </span>

              {sandwiches.map((sw) => (
                <div
                  key={sw.id}
                  className="bg-white border-2 border-red-100 rounded-2xl p-4 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{sw.nombre}</h3>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="font-mono">Precio: {formatCOP(sw.precioVenta)}</span>
                        <span>·</span>
                        <span className="font-mono">Costo: {formatCOP(sw.costoUnitario)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSandwichEditando({ ...sw });
                          setModalEditarAbierto(true);
                        }}
                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Modificar tipo de sándwich o precios"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => eliminarTipoSandwich(sw.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar sándwich"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Modificador de Stock con botones grandes */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-600 uppercase">
                      Stock:
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => ajustarStock(sw.id, -1)}
                        className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-red-100 hover:text-red-700 text-slate-800 font-black text-lg flex items-center justify-center transition-colors active:scale-95"
                      >
                        <Minus className="w-4 h-4" />
                      </button>

                      <input
                        type="number"
                        min="0"
                        value={sw.stock}
                        onChange={(e) => {
                          const v = parseInt(e.target.value);
                          setStockDirecto(sw.id, isNaN(v) ? 0 : v);
                        }}
                        className="w-16 h-10 text-center font-black text-lg font-mono text-slate-900 border-2 border-slate-200 rounded-xl focus:border-red-600 focus:outline-none"
                      />

                      <button
                        type="button"
                        onClick={() => ajustarStock(sw.id, 1)}
                        className="w-10 h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-lg flex items-center justify-center transition-colors active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Botones de incremento rápido */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => ajustarStock(sw.id, 5)}
                        className="px-2 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-lg border border-red-200"
                      >
                        +5
                      </button>
                      <button
                        type="button"
                        onClick={() => ajustarStock(sw.id, 10)}
                        className="px-2 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-lg border border-red-200"
                      >
                        +10
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Formulario para Crear Nuevo Tipo de Sándwich */}
            <div className="bg-red-50/50 border-2 border-dashed border-red-200 rounded-2xl p-4 space-y-3">
              <span className="text-xs font-bold text-red-800 uppercase tracking-wider block">
                + Crear Nuevo Tipo de Sándwich
              </span>

              <form onSubmit={crearNuevoSandwich} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Nombre</label>
                  <input
                    type="text"
                    placeholder="Ej: Sándwich de Jamón Serrano"
                    value={nuevoNombre}
                    onChange={(e) => setNuevoNombre(e.target.value)}
                    required
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-red-600"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Stock Inicial</label>
                    <input
                      type="number"
                      min="0"
                      value={nuevoStock}
                      onChange={(e) => setNuevoStock(parseInt(e.target.value) || 0)}
                      className="w-full text-xs px-2 py-2 bg-white border border-slate-200 rounded-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Precio Venta</label>
                    <input
                      type="number"
                      min="0"
                      value={nuevoPrecio}
                      onChange={(e) => setNuevoPrecio(parseInt(e.target.value) || 0)}
                      className="w-full text-xs px-2 py-2 bg-white border border-slate-200 rounded-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Costo Unit.</label>
                    <input
                      type="number"
                      min="0"
                      value={nuevoCosto}
                      onChange={(e) => setNuevoCosto(parseInt(e.target.value) || 0)}
                      className="w-full text-xs px-2 py-2 bg-white border border-slate-200 rounded-xl font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Añadir al Menú</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* PANTALLA 3: VENTAS (Ganancias por Método de Pago & Historial) */}
        {/* ============================================================ */}
        {pantalla === 'ventas' && (
          <div className="p-5 flex-1 flex flex-col space-y-5">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Registro de Ventas y Ganancias
              </h2>
              <p className="text-xs text-slate-500">
                Colección de ganancias dividida por cada método de pago
              </p>
            </div>

            {/* COLECCIÓN DE GANANCIA POR CADA MÉTODO DE PAGO */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-red-700 uppercase tracking-wider block">
                Ganancia Neta por Método de Pago
              </span>

              {/* Tarjeta Ganancia Total Destacada */}
              <div className="bg-gradient-to-br from-red-600 to-red-700 text-white p-4 rounded-2xl shadow-md">
                <span className="text-[11px] text-red-100 uppercase font-bold tracking-wider block">
                  Ganancia Total Acumulada
                </span>
                <div className="text-3xl font-black font-mono tracking-tight mt-1 mb-1">
                  {formatCOP(gananciaTotal)}
                </div>
                <div className="text-xs text-red-100 flex items-center justify-between">
                  <span>Total Ventas: {formatCOP(totalVentasDinero)}</span>
                  <span>{totalUnidadesVendidas} sándwiches</span>
                </div>
              </div>

              {/* 3 Métodos Solicitados: Efectivo, Nequi, Llave */}
              <div className="grid grid-cols-1 gap-2.5">
                {/* 1. Efectivo */}
                <div className="bg-white border-2 border-emerald-100 rounded-2xl p-3.5 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">Efectivo</span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {ventas.filter((v) => v.metodoPago === 'Efectivo').length} ventas registradas
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-semibold">Ganancia</span>
                    <span className="text-lg font-black text-emerald-700 font-mono tabular-nums">
                      {formatCOP(gananciaEfectivo)}
                    </span>
                  </div>
                </div>

                {/* 2. Nequi */}
                <div className="bg-white border-2 border-purple-100 rounded-2xl p-3.5 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">Nequi</span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {ventas.filter((v) => v.metodoPago === 'Nequi').length} ventas registradas
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-semibold">Ganancia</span>
                    <span className="text-lg font-black text-purple-700 font-mono tabular-nums">
                      {formatCOP(gananciaNequi)}
                    </span>
                  </div>
                </div>

                {/* 3. Llave */}
                <div className="bg-white border-2 border-amber-100 rounded-2xl p-3.5 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                      <Key className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">Llave</span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {ventas.filter((v) => v.metodoPago === 'Llave').length} ventas registradas
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-semibold">Ganancia</span>
                    <span className="text-lg font-black text-amber-700 font-mono tabular-nums">
                      {formatCOP(gananciaLlave)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* HISTORIAL DETALLADO DE VENTAS */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Historial de Ventas ({ventas.length})
                </span>
                {ventas.length > 0 && (
                  <button
                    onClick={() => {
                      if (window.confirm('¿Deseas vaciar el historial de ventas?')) {
                        setVentas([]);
                        localStorage.removeItem('happy_ventas_registro');
                      }
                    }}
                    className="text-xs text-red-600 hover:text-red-800 font-bold"
                  >
                    Limpiar Historial
                  </button>
                )}
              </div>

              {ventas.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-red-200 rounded-2xl text-slate-400 text-xs bg-red-50/20">
                  No hay ventas registradas aún. Ve a Inicio y presiona el botón rojo VENTA.
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-0.5">
                  {ventas.map((v) => {
                    const badgeColor =
                      v.metodoPago === 'Efectivo'
                        ? 'text-emerald-700 bg-emerald-50'
                        : v.metodoPago === 'Nequi'
                        ? 'text-purple-700 bg-purple-50'
                        : 'text-amber-700 bg-amber-50';

                    return (
                      <div
                        key={v.id}
                        className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-sm text-slate-900 truncate">
                            {v.cantidad}x {v.tipoSandwich}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                            <span className={`px-1.5 py-0.5 rounded font-bold ${badgeColor}`}>
                              {v.metodoPago}
                            </span>
                            <span>·</span>
                            <span className="font-mono">{formatHora(v.timestamp)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-xs font-bold text-slate-900 font-mono">
                              {formatCOP(v.total)}
                            </div>
                            <div className="text-[11px] font-bold text-red-600 font-mono">
                              +{formatCOP(v.ganancia)}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => eliminarVenta(v.id)}
                            className="p-1.5 text-slate-300 hover:text-red-600 rounded-md transition-colors"
                            title="Eliminar venta y devolver al stock"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MENÚ DE MANERA HORIZONTAL EN LA PARTE DE ABAJO */}
        {/* ============================================================ */}
        <nav className="fixed bottom-0 max-w-md w-full bg-white border-t-2 border-red-200 z-30 shadow-lg px-2 py-1.5">
          <div className="grid grid-cols-3 gap-1">
            {/* Botón 1: Inicio */}
            <button
              type="button"
              onClick={() => setPantalla('inicio')}
              className={`flex flex-col items-center justify-center py-2 rounded-xl transition-all min-h-[50px] ${
                pantalla === 'inicio'
                  ? 'bg-red-50 text-red-600 font-black'
                  : 'text-slate-500 hover:text-red-600 font-medium'
              }`}
            >
              <Home className="w-5 h-5 mb-0.5" />
              <span className="text-xs tracking-tight">Inicio</span>
            </button>

            {/* Botón 2: Registro */}
            <button
              type="button"
              onClick={() => setPantalla('registro')}
              className={`flex flex-col items-center justify-center py-2 rounded-xl transition-all min-h-[50px] ${
                pantalla === 'registro'
                  ? 'bg-red-50 text-red-600 font-black'
                  : 'text-slate-500 hover:text-red-600 font-medium'
              }`}
            >
              <Boxes className="w-5 h-5 mb-0.5" />
              <span className="text-xs tracking-tight">Registro</span>
            </button>

            {/* Botón 3: Ventas */}
            <button
              type="button"
              onClick={() => setPantalla('ventas')}
              className={`flex flex-col items-center justify-center py-2 rounded-xl transition-all min-h-[50px] ${
                pantalla === 'ventas'
                  ? 'bg-red-50 text-red-600 font-black'
                  : 'text-slate-500 hover:text-red-600 font-medium'
              }`}
            >
              <TrendingUp className="w-5 h-5 mb-0.5" />
              <span className="text-xs tracking-tight">Ventas</span>
            </button>
          </div>
        </nav>

        {/* ============================================================ */}
        {/* MODAL DE VENTA (Seleccionar sándwich + método: Efectivo, Nequi, Llave) */}
        {/* ============================================================ */}
        {modalVentaAbierto && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
            <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl animate-slide-up space-y-5 max-h-[90vh] overflow-y-auto">
              {/* Header Modal */}
              <div className="flex items-center justify-between pb-3 border-b border-red-100">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 block">
                    Registrar Operación
                  </span>
                  <h3 className="text-2xl font-black text-slate-900">
                    Nueva Venta
                  </h3>
                </div>
                <button
                  onClick={() => setModalVentaAbierto(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-full bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 1. Tipo de Sándwich */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  1. Escoge el Sándwich:
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {sandwiches.map((sw) => {
                    const isSelected = sw.id === sandwichSeleccionadoId;
                    return (
                      <button
                        key={sw.id}
                        type="button"
                        onClick={() => setSandwichSeleccionadoId(sw.id)}
                        className={`w-full py-3 px-4 rounded-xl text-left transition-all flex items-center justify-between border ${
                          isSelected
                            ? 'bg-red-50 border-red-600 text-red-900 ring-2 ring-red-600/20'
                            : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <span className="font-bold text-sm block">🥪 {sw.nombre}</span>
                          <span className="text-xs text-slate-500 font-mono">
                            {formatCOP(sw.precioVenta)} · Stock: {sw.stock}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Cantidad */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    2. Cantidad:
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setCantidadVenta(num)}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors ${
                          cantidadVenta === num
                            ? 'bg-red-600 text-white border-red-600'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCantidadVenta((prev) => Math.max(1, prev - 1))}
                    className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-900 font-black text-xl flex items-center justify-center"
                  >
                    <Minus className="w-5 h-5" />
                  </button>

                  <input
                    type="number"
                    min="1"
                    value={cantidadVenta}
                    onChange={(e) => {
                      const v = parseInt(e.target.value);
                      setCantidadVenta(isNaN(v) || v < 1 ? 1 : v);
                    }}
                    className="flex-1 h-12 text-center text-2xl font-black font-mono border-2 border-slate-200 rounded-xl focus:border-red-600 focus:outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => setCantidadVenta((prev) => prev + 1)}
                    className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-900 font-black text-xl flex items-center justify-center"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* 3. Método de Pago: Efectivo, Nequi, Llave */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  3. Método de Pago:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {/* Opción 1: Efectivo */}
                  <button
                    type="button"
                    onClick={() => setMetodoPagoVenta('Efectivo')}
                    className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                      metodoPagoVenta === 'Efectivo'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-900 ring-2 ring-emerald-600/20 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Banknote className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs">Efectivo</span>
                  </button>

                  {/* Opción 2: Nequi */}
                  <button
                    type="button"
                    onClick={() => setMetodoPagoVenta('Nequi')}
                    className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                      metodoPagoVenta === 'Nequi'
                        ? 'bg-purple-50 border-purple-600 text-purple-900 ring-2 ring-purple-600/20 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-purple-600" />
                    <span className="text-xs">Nequi</span>
                  </button>

                  {/* Opción 3: Llave */}
                  <button
                    type="button"
                    onClick={() => setMetodoPagoVenta('Llave')}
                    className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                      metodoPagoVenta === 'Llave'
                        ? 'bg-amber-50 border-amber-600 text-amber-900 ring-2 ring-amber-600/20 font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Key className="w-5 h-5 text-amber-600" />
                    <span className="text-xs">Llave</span>
                  </button>
                </div>
              </div>

              {/* Botón de Confirmación con Total */}
              <button
                type="button"
                onClick={confirmarVenta}
                className="w-full h-16 rounded-2xl font-black text-lg text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Check className="w-6 h-6 stroke-[3]" />
                <span>Cobrar {formatCOP(totalCobrarVenta)}</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODAL EDITAR SÁNDWICH (Modificar tipo, precio y costo) */}
        {/* ============================================================ */}
        {modalEditarAbierto && sandwichEditando && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-base">Modificar Sándwich</h3>
                <button
                  onClick={() => setModalEditarAbierto(false)}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Nombre</label>
                  <input
                    type="text"
                    value={sandwichEditando.nombre}
                    onChange={(e) =>
                      setSandwichEditando({ ...sandwichEditando, nombre: e.target.value })
                    }
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Precio Venta</label>
                    <input
                      type="number"
                      value={sandwichEditando.precioVenta}
                      onChange={(e) =>
                        setSandwichEditando({
                          ...sandwichEditando,
                          precioVenta: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full text-xs px-2 py-2 border border-slate-200 rounded-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Costo Unit.</label>
                    <input
                      type="number"
                      value={sandwichEditando.costoUnitario}
                      onChange={(e) =>
                        setSandwichEditando({
                          ...sandwichEditando,
                          costoUnitario: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full text-xs px-2 py-2 border border-slate-200 rounded-xl font-mono"
                    />
                  </div>
                </div>

                <div className="text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded-lg font-mono">
                  Ganancia por unidad: {formatCOP(sandwichEditando.precioVenta - sandwichEditando.costoUnitario)}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalEditarAbierto(false)}
                  className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={guardarEdicionSandwich}
                  className="flex-1 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
