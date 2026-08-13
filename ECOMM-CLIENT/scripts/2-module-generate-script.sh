#!/bin/bash
# scripts/generate-module.sh - Create a new module

MODULE_NAME=$1

if [ -z "$MODULE_NAME" ]; then
    echo "Usage: ./scripts/generate-module.sh <module-name>"
    echo "Example: ./scripts/generate-module.sh orders"
    exit 1
fi

echo "📁 Generating module: $MODULE_NAME"

MODULE_DIR="src/modules/$MODULE_NAME"

# Create directory structure
mkdir -p "$MODULE_DIR/pages"
mkdir -p "$MODULE_DIR/components"
mkdir -p "$MODULE_DIR/services"
mkdir -p "$MODULE_DIR/store"
mkdir -p "$MODULE_DIR/types"

# Create root index.ts
cat > "$MODULE_DIR/index.ts" << EOF
export * from './pages';
export * from './components';
export * from './services';
export * from './store';
export * from './types';
EOF

# Create types and sub-directory index
cat > "$MODULE_DIR/types/${MODULE_NAME}Types.ts" << EOF
export interface ${MODULE_NAME^} {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
}

export interface Create${MODULE_NAME^}Data {
    name: string;
}

export interface Update${MODULE_NAME^}Data {
    name?: string;
}

export interface ${MODULE_NAME^}ListResponse {
    status: string;
    data: ${MODULE_NAME^}[];
    pagination?: {
        total: number;
        limit: number;
        offset: number;
        page: number;
        totalPages: number;
    };
}
EOF

cat > "$MODULE_DIR/types/index.ts" << EOF
export * from './${MODULE_NAME}Types';
EOF

# Create service and sub-directory index
cat > "$MODULE_DIR/services/${MODULE_NAME}Service.ts" << EOF
import { api } from '../../../core/api/client';
import { ${MODULE_NAME^}, Create${MODULE_NAME^}Data, Update${MODULE_NAME^}Data } from '../types/${MODULE_NAME}Types';

export const ${MODULE_NAME}Service = {
    list: () =>
        api.get<{ status: string; data: ${MODULE_NAME^}[] }>('/${MODULE_NAME}s'),

    getById: (id: string) =>
        api.get<{ status: string; data: ${MODULE_NAME^} }>('/${MODULE_NAME}s/' + id),

    create: (data: Create${MODULE_NAME^}Data) =>
        api.post<{ status: string; data: ${MODULE_NAME^} }>('/${MODULE_NAME}s', data),

    update: (id: string, data: Update${MODULE_NAME^}Data) =>
        api.patch<{ status: string; data: ${MODULE_NAME^} }>('/${MODULE_NAME}s/' + id, data),

    delete: (id: string) =>
        api.delete<{ status: string; message: string }>('/${MODULE_NAME}s/' + id)
};
EOF

cat > "$MODULE_DIR/services/index.ts" << EOF
export * from './${MODULE_NAME}Service';
EOF

# Create store and sub-directory index
cat > "$MODULE_DIR/store/${MODULE_NAME}Store.ts" << EOF
import { create } from 'zustand';
import { ${MODULE_NAME}Service } from '../services/${MODULE_NAME}Service';
import { ${MODULE_NAME^} } from '../types/${MODULE_NAME}Types';

interface ${MODULE_NAME^}State {
    items: ${MODULE_NAME^}[];
    isLoading: boolean;
    error: string | null;

    fetch: () => Promise<void>;
    create: (data: any) => Promise<void>;
    update: (id: string, data: any) => Promise<void>;
    delete: (id: string) => Promise<void>;
}

export const use${MODULE_NAME^}Store = create<${MODULE_NAME^}State>((set) => ({
    items: [],
    isLoading: false,
    error: null,

    fetch: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await ${MODULE_NAME}Service.list();
            set({ items: response.data.data, isLoading: false });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to fetch ${MODULE_NAME}s',
                isLoading: false
            });
        }
    },

    create: async (data: any) => {
        set({ isLoading: true, error: null });
        try {
            const response = await ${MODULE_NAME}Service.create(data);
            set((state) => ({
                items: [response.data.data, ...state.items],
                isLoading: false
            }));
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to create ${MODULE_NAME}',
                isLoading: false
            });
        }
    },

    update: async (id: string, data: any) => {
        set({ isLoading: true, error: null });
        try {
            const response = await ${MODULE_NAME}Service.update(id, data);
            set((state) => ({
                items: state.items.map((item) =>
                    item.id === id ? response.data.data : item
                ),
                isLoading: false
            }));
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to update ${MODULE_NAME}',
                isLoading: false
            });
        }
    },

    delete: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            await ${MODULE_NAME}Service.delete(id);
            set((state) => ({
                items: state.items.filter((item) => item.id !== id),
                isLoading: false
            }));
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to delete ${MODULE_NAME}',
                isLoading: false
            });
        }
    }
}));
EOF

cat > "$MODULE_DIR/store/index.ts" << EOF
export * from './${MODULE_NAME}Store';
EOF

# Create pages and sub-directory index
cat > "$MODULE_DIR/pages/${MODULE_NAME^}List.tsx" << EOF
import React, { useEffect } from 'react';
import { use${MODULE_NAME^}Store } from '../store/${MODULE_NAME}Store';

export const ${MODULE_NAME^}List: React.FC = () => {
    const { items, isLoading, error, fetch, delete: deleteItem } = use${MODULE_NAME^}Store();

    useEffect(() => {
        fetch();
    }, []);

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div className="text-red-600">{error}</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">${MODULE_NAME^}s</h1>
                <button className="btn-primary">Add ${MODULE_NAME^}</button>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created At
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {items.map((item) => (
                            <tr key={item.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {item.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                                    <button className="text-blue-600 hover:text-blue-800">
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => deleteItem(item.id)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
EOF

cat > "$MODULE_DIR/pages/index.ts" << EOF
export * from './${MODULE_NAME^}List';
EOF

# Create components and sub-directory index
cat > "$MODULE_DIR/components/${MODULE_NAME^}Card.tsx" << EOF
import React from 'react';
import { ${MODULE_NAME^} } from '../types/${MODULE_NAME}Types';

interface Props {
    item: ${MODULE_NAME^};
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
}

export const ${MODULE_NAME^}Card: React.FC<Props> = ({ item, onEdit, onDelete }) => {
    return (
        <div className="p-4 border rounded-lg shadow-sm bg-white">
            <h3 className="font-semibold text-lg">{item.name}</h3>
            <p className="text-sm text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</p>
            <div className="mt-4 flex space-x-2">
                {onEdit && (
                    <button onClick={() => onEdit(item.id)} className="text-blue-600 hover:text-blue-800 text-sm">
                        Edit
                    </button>
                )}
                {onDelete && (
                    <button onClick={() => onDelete(item.id)} className="text-red-600 hover:text-red-800 text-sm">
                        Delete
                    </button>
                )}
            </div>
        </div>
    );
};
EOF

cat > "$MODULE_DIR/components/index.ts" << EOF
export * from './${MODULE_NAME^}Card';
EOF

echo "✅ Module $MODULE_NAME generated successfully at $MODULE_DIR!"
