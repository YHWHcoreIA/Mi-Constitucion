import React, { useState } from 'react';
import { constitutionData } from '../data/constitution.ts';
import type { Titulo, Capitulo, Seccion } from '../types.ts';
import { CloseIcon, SearchIcon, ChevronDownIcon } from './icons.tsx';

interface SidebarProps {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  onNavigate: (id: string) => void;
  onSearch: (query: string) => void;
  searchQuery: string;
  theme: string;
  toggleTheme: () => void;
  filterType: string;
  setFilterType: (type: string) => void;
  sortOrder: string;
  setSortOrder: (order: string) => void;
}

const NavItem: React.FC<{
  item: Titulo | Capitulo | Seccion;
  onNavigate: (id: string) => void;
  level: number;
}> = ({ item, onNavigate, level }) => {
  const [isExpanded, setIsExpanded] = useState(level === 0);
  const children = ('capitulos' in item && item.capitulos) || ('secciones' in item && item.secciones);
  const hasChildren = children && children.length > 0;

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };
  
  const handleNavigate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNavigate(item.id);
  };

  const paddingLeft = `${level * 1 + 1}rem`;

  return (
    <div>
      <div
        className="flex items-center justify-between p-2 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer rounded-md"
        style={{ paddingLeft }}
        onClick={hasChildren ? handleToggle : handleNavigate}
      >
        <span className="flex-1" onClick={handleNavigate}>{item.nombre}</span>
        {hasChildren && (
          <ChevronDownIcon
            className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
          />
        )}
      </div>
      {isExpanded && hasChildren && (
        <div>
          {children.map(child => (
            <NavItem key={child.id} item={child} onNavigate={onNavigate} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  setOpen,
  onNavigate,
  onSearch,
  searchQuery,
  theme,
  toggleTheme,
  filterType,
  setFilterType,
  sortOrder,
  setSortOrder,
}) => {
  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setOpen(false)}
      ></div>
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-lg p-4 z-40 transform transition-transform md:relative md:translate-x-0 md:w-80 md:shadow-none flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Navegación</h2>
          <button onClick={() => setOpen(false)} className="md:hidden">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Buscar artículo o palabra..."
            value={searchQuery}
            onChange={e => onSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="w-5 h-5 text-gray-400" />
          </div>
        </div>
        
        {searchQuery.length > 2 && (
            <div className="mb-4 p-2 border border-gray-200 dark:border-gray-700 rounded-md">
                <h3 className="font-semibold mb-2 text-sm">Opciones de Búsqueda</h3>
                <div className="flex flex-col gap-2">
                    <div>
                        <label htmlFor="filterType" className="text-xs text-gray-600 dark:text-gray-400">Filtrar por:</label>
                        <select id="filterType" value={filterType} onChange={e => setFilterType(e.target.value)} className="w-full text-sm p-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700">
                            <option value="all">Todos</option>
                            <option value="titulo">Solo en Títulos</option>
                            <option value="capitulo">Solo en Capítulos</option>
                            <option value="seccion">Solo en Secciones</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="sortOrder" className="text-xs text-gray-600 dark:text-gray-400">Ordenar por:</label>
                        <select id="sortOrder" value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="w-full text-sm p-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700">
                            <option value="relevance">Relevancia</option>
                            <option value="constitutional">Orden Constitucional</option>
                        </select>
                    </div>
                </div>
            </div>
        )}

        <nav className="flex-1 overflow-y-auto pr-2 -mr-2">
          <ul>
            {constitutionData.map(titulo => (
              <li key={titulo.id}>
                <NavItem item={titulo} onNavigate={onNavigate} level={0} />
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button onClick={toggleTheme} className="w-full text-left p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
                Cambiar a modo {theme === 'light' ? 'oscuro' : 'claro'}
            </button>
        </div>
      </aside>
    </>
  );
};
