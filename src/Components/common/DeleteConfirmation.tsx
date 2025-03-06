import React, { useState } from 'react';

interface DeleteConfirmationProps {
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  itemName: string;
}

export const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  onConfirm,
  onCancel,
  itemName
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
      <p className="mt-2 text-gray-600">
        Are you sure you want to delete {itemName}? This action can be undone from the recycle bin.
      </p>
      <div className="mt-4 flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
          disabled={isDeleting}
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700"
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
}; 