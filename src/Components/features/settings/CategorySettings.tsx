import React, { useState } from 'react';
import Card from "../../common/Card";
import { useCategories } from '../../../hooks/useCategories';
import Button from "../../common/button/Button";
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { ColorPicker } from '../../common/ColorPicker';
import type { Category, CreateCategoryData } from '../../../types/models';

export const CategorySettings: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  
  const {
    categories,
    deleteCategory,
    updateCategory,
    createCategory
  } = useCategories();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && editingCategory && editingCategory.id) {
      updateCategory(editingCategory.id, editingCategory);
    } else if (editingCategory && editingCategory.name) {
      // Ensure we have the required fields for CreateCategoryData
      const newCategory: CreateCategoryData = {
        name: editingCategory.name,
        color: editingCategory.color || '#000000',
        icon: editingCategory.icon,
        parentId: editingCategory.parentId
      };
      createCategory(newCategory);
    }
    setIsEditing(false);
    setEditingCategory(null);
  };

  return (
    <Card>
      <Card.Header className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Spending Categories</h2>
        <Button
          variant="primary"
          onClick={() => {
            setIsEditing(false);
            setEditingCategory({
              name: '',
              color: '#000000',
              icon: 'default'
            });
          }}
          className="flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Category
        </Button>
      </Card.Header>
      <Card.Body>
        <div className="space-y-6">
          {editingCategory && (
            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category Name
                </label>
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({
                    ...editingCategory,
                    name: e.target.value
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category Color
                </label>
                <ColorPicker
                  color={editingCategory.color || '#000000'}
                  onChange={(color) => setEditingCategory({
                    ...editingCategory,
                    color
                  })}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsEditing(false);
                    setEditingCategory(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  {isEditing ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          )}

          <div className="grid gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="font-medium">{category.name}</span>
                </div>

                {category.isCustom && (
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setIsEditing(true);
                        setEditingCategory(category);
                      }}
                      className="p-2"
                    >
                      <PencilIcon className="h-5 w-5 text-gray-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => deleteCategory(category.id)}
                      className="p-2"
                    >
                      <TrashIcon className="h-5 w-5 text-red-500" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}; 