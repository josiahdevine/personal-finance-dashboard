import React, { useEffect, useState } from 'react';
import { Card } from '../components/common/Card';
import { api } from '../services/api';

interface DeletedItem {
  id: string;
  type: string;
  name: string;
  deleted_at: string;
}

export const RecycleBin: React.FC = () => {
  const [items, setItems] = useState<DeletedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeletedItems();
  }, []);

  const loadDeletedItems = async () => {
    try {
      const response = await api.get('/api/recycle-bin');
      setItems(response.data);
    } catch (error) {
      console.error('Failed to load deleted items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id: string, type: string) => {
    try {
      await api.post(`/api/recycle-bin/${type}/${id}/restore`);
      await loadDeletedItems();
    } catch (error) {
      console.error('Failed to restore item:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Recycle Bin</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <Card.Body>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-500">
                      Deleted: {new Date(item.deleted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRestore(item.id, item.type)}
                    className="px-4 py-2 text-blue-600 hover:text-blue-700"
                  >
                    Restore
                  </button>
                </div>
              </Card.Body>
            </Card>
          ))}
          {items.length === 0 && (
            <p className="text-gray-500 text-center">No items in recycle bin</p>
          )}
        </div>
      )}
    </div>
  );
}; 