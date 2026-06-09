import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@heroui/react';
import { Plus } from 'lucide-react';
import { Board } from '../../types/board';

export const BoardPage = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [board, setBoard] = useState<Board | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (boards.length === 0) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100 p-8 w-full max-w-md">
          <p className="text-gray-500 text-lg mb-6">You don't have any boards yet.</p>
          <Button color="primary" startContent={<Plus size={18} />}>
            Create your first board
          </Button>
        </div>
      </main>
    );
  }

  if (!board) {
    return (
      <div>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-gray-500">Board not found.</p>
        </main>
      </div>
    );
  }

  return (
    <div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      </main>
    </div>
  );
};
