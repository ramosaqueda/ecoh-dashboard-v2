'use client'
import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Search, 
  FileSearch, 
  Mail, 
  Database, 
  Globe, 
  ClipboardList, 
  Phone, 
  Server, 
  AlertTriangle, 
  BarChart3, 
  FileText, 
  Eye, 
  Shield,
  ExternalLink,
  Filter,
  Loader2,
  Plus,
  Edit,
  Tags,
  ArrowUpDown,
  CarIcon
} from 'lucide-react';

interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  color?: string;
  icono?: string;
  activo: boolean;
  orden?: number;
}

interface Sitio {
  id: number;
  nombre: string;
  descripcion: string;
  url: string;
  icono: string;
  activo: boolean;
  orden?: number;
  categoriaId?: number;
  categoria?: Categoria;
  createdAt: string;
  updatedAt: string;
}

const LaunchpadECOH = () => {
  // Estados
  const [sitios, setSitios] = useState<Sitio[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('todas');
  const [ordenamiento, setOrdenamiento] = useState('orden');

  // Mapeo de iconos usando lucide-react
  const iconMap: { [key: string]: React.ComponentType<any> } = {
    'MapPin': MapPin,
    'Search': Search,
    'FileSearch': FileSearch,
    'Mail': Mail,
    'Database': Database,
    'Globe': Globe,
    'ClipboardList': ClipboardList,
    'Phone': Phone,
    'Server': Server,
    'AlertTriangle': AlertTriangle,
    'BarChart3': BarChart3,
    'FileText': FileText,
    'Eye': Eye,
    'Shield': Shield,
    // Mapeo para compatibilidad con nombres anteriores
    'FaMapMarkedAlt': MapPin,
    'FaSearch': Search,
    'FaFileSearch': FileSearch,
    'FaEnvelope': Mail,
    'FaDatabase': Database,
    'FaGlobe': Globe,
    'FaClipboardList': ClipboardList,
    'FaPhone': Phone,
    'FaServer': Server,
    'FaExclamationTriangle': AlertTriangle,
    'FaChartBar': BarChart3,
    'FaFileAlt': FileText,
    'FaEye': Eye,
    'FaShieldAlt': Shield
  };

  // Cargar categorías desde la API
  const fetchCategorias = async () => {
    try {
      const response = await fetch('/api/categorias');
      if (response.ok) {
        const { data } = await response.json();
        setCategorias(data);
      }
    } catch (err) {
      console.error('Error al cargar categorías:', err);
    }
  };

  // Cargar sitios desde API
  const fetchSitios = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      params.append('activo', 'true');
      if (categoriaSeleccionada !== 'todas') {
        // Buscar el ID de la categoría por nombre
        const categoria = categorias.find(c => c.nombre === categoriaSeleccionada);
        if (categoria) {
          params.append('categoria_id', categoria.id.toString());
        }
      }

      const response = await fetch(`/api/sitios?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar sitios');
      }

      const { data } = await response.json();
      setSitios(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error al cargar sitios:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  useEffect(() => {
    if (categorias.length > 0) {
      fetchSitios();
    }
  }, [categoriaSeleccionada, categorias]);

  // Obtener categorías únicas de los sitios cargados
  const categoriasConSitios = Array.from(
    new Set(
      sitios
        .filter(s => s.categoria)
        .map(s => s.categoria!.nombre)
    )
  );

  // Filtrar y ordenar sitios
  const sitiosFiltrados = sitios
    .filter(sitio => {
      const coincideBusqueda = sitio.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                              sitio.descripcion.toLowerCase().includes(busqueda.toLowerCase());
      
      let coincideTipo = filtro === 'todos';
      if (filtro === 'web') coincideTipo = sitio.url.startsWith('http');
      if (filtro === 'email') coincideTipo = sitio.url.startsWith('mailto:');
      if (filtro === 'javascript') coincideTipo = sitio.url.startsWith('javascript:');
      
      return coincideBusqueda && coincideTipo && sitio.activo;
    })
    .sort((a, b) => {
      switch (ordenamiento) {
        case 'nombre':
          return a.nombre.localeCompare(b.nombre);
        case 'categoria':
          const catA = a.categoria?.nombre || '';
          const catB = b.categoria?.nombre || '';
          return catA.localeCompare(catB);
        case 'orden':
        default:
          return (a.orden || 999) - (b.orden || 999);
      }
    });

  const handleClick = (sitio: Sitio) => {
    if (sitio.url.startsWith('http')) {
      window.open(sitio.url, '_blank');
    } else if (sitio.url.startsWith('mailto:')) {
      window.location.href = sitio.url;
    } else if (sitio.url.startsWith('javascript:')) {
      // Manejar funciones JavaScript de forma segura
      const functionName = sitio.url.replace('javascript:', '');
      if (functionName === 'ViewCarpetaDocumentos()') {
        alert('Función JavaScript: ViewCarpetaDocumentos()');
      }
    }
  };

  const getTipoFromUrl = (url: string) => {
    if (url.startsWith('mailto:')) return 'email';
    if (url.startsWith('javascript:')) return 'javascript';
    return 'web';
  };

  const getTipoColor = (url: string) => {
    const tipo = getTipoFromUrl(url);
    switch (tipo) {
      case 'web': return 'bg-blue-500';
      case 'email': return 'bg-green-500';
      case 'javascript': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoriaColor = (categoria?: Categoria) => {
    // Usar el color de la categoría desde la BD, o colores por defecto
    if (categoria?.color) {
      return `bg-[${categoria.color}]`;
    }
    
    // Colores por defecto si no hay color en la BD
    const coloresDefault: { [key: string]: string } = {
      'analisis': 'bg-red-500',
      'busqueda': 'bg-blue-500',
      'datos': 'bg-green-500',
      'investigacion': 'bg-purple-500',
      'contacto': 'bg-yellow-500',
      'registro': 'bg-indigo-500',
      'alertas': 'bg-orange-500',
      'estadisticas': 'bg-teal-500',
      'documentacion': 'bg-gray-500'
    };
    return coloresDefault[categoria?.nombre || ''] || 'bg-slate-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="text-white text-4xl animate-spin mx-auto mb-4" />
          <p className="text-slate-300">Cargando herramientas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Launch Pad</h1>
          <p className="text-slate-300 text-lg">
           Set de herramientas y sitios de interés
          </p>
      
          {error && (
            <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
              ⚠️ Error de conexión: {error}
            </div>
          )}
        </div>

        {/* Controles avanzados */}
        <div className="space-y-4 max-w-4xl mx-auto">
          {/* Búsqueda */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar herramientas..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* Filtros */}
            <div className="flex gap-2">
              <select
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="appearance-none bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos los tipos</option>
                <option value="web">Web</option>
                <option value="email">Email</option>
                <option value="javascript">Scripts</option>
              </select>

              <select
                value={categoriaSeleccionada}
                onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                className="appearance-none bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todas">Todas las categorías</option>
                {categorias
                  .filter(cat => cat.activo)
                  .sort((a, b) => (a.orden || 999) - (b.orden || 999))
                  .map(categoria => (
                    <option key={categoria.id} value={categoria.nombre}>
                      {categoria.nombre.charAt(0).toUpperCase() + categoria.nombre.slice(1)}
                    </option>
                  ))}
              </select>

              <select
                value={ordenamiento}
                onChange={(e) => setOrdenamiento(e.target.value)}
                className="appearance-none bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="orden">Por orden</option>
                <option value="nombre">Por nombre</option>
                <option value="categoria">Por categoría</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de herramientas */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {sitiosFiltrados.map((sitio) => {
            const IconComponent = iconMap[sitio.icono] || Globe;
            
            return (
              <div
                key={sitio.id}
                onClick={() => handleClick(sitio)}
                className="group relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:bg-slate-700/50 hover:border-slate-600 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20"
              >
                {/* Indicadores */}
                <div className="absolute top-3 right-3 flex gap-1">
                  <div 
                    className={`w-3 h-3 rounded-full ${getTipoColor(sitio.url)}`} 
                    title={getTipoFromUrl(sitio.url)}
                  ></div>
                  {sitio.categoria && (
                    <div 
                      className={`w-3 h-3 rounded-full ${getCategoriaColor(sitio.categoria)}`} 
                      title={sitio.categoria.nombre}
                      style={sitio.categoria.color ? { backgroundColor: sitio.categoria.color } : {}}
                    ></div>
                  )}
                </div>
                
                {/* Icono */}
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center group-hover:from-blue-600 group-hover:to-blue-700 transition-all duration-300">
                    <IconComponent className="text-white text-2xl" />
                  </div>
                </div>

                {/* Contenido */}
                <div className="text-center">
                  <h3 className="text-white font-semibold text-sm mb-2 leading-tight">
                    {sitio.nombre}
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed mb-3 h-12 overflow-hidden">
                    {sitio.descripcion}
                  </p>
                  
                  {/* Categoría */}
                  {sitio.categoria && (
                    <div className="mb-2">
                      <span 
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs text-white"
                        style={sitio.categoria.color ? 
                          { backgroundColor: sitio.categoria.color + '40', borderColor: sitio.categoria.color } : 
                          {}
                        }
                      >
                        <Tags className="mr-1 w-3 h-3" />
                        {sitio.categoria.nombre}
                      </span>
                    </div>
                  )}
                  
                  {/* Indicador de enlace */}
                  {getTipoFromUrl(sitio.url) === 'web' && (
                    <div className="flex justify-center">
                      <ExternalLink className="text-slate-500 w-4 h-4 group-hover:text-blue-400 transition-colors duration-300" />
                    </div>
                  )}
                </div>

                {/* Efecto de hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            );
          })}
        </div>

        {/* Mensaje si no hay resultados */}
        {sitiosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <div className="text-slate-400 text-lg mb-2">No se encontraron herramientas</div>
            <div className="text-slate-500 text-sm">Intenta con otros términos de búsqueda o filtros</div>
            <button
              onClick={() => {
                setBusqueda('');
                setFiltro('todos');
                setCategoriaSeleccionada('todas');
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        )}

        {/* Footer con estadísticas */}
        <div className="text-center mt-12 pt-8 border-t border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{sitiosFiltrados.length}</div>
              <div className="text-slate-400 text-sm">Herramientas mostradas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{sitios.length}</div>
              <div className="text-slate-400 text-sm">Total disponibles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{categorias.length}</div>
              <div className="text-slate-400 text-sm">Categorías</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaunchpadECOH;