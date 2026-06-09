import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Chip } from '@heroui/react';
import { Plus, Users, Share2, User as UserIcon } from 'lucide-react';
import { Board } from '../../types/board';
import { getBoard, getBoards, createBoard, moveTask, addBoardMember } from '../../api/boardApi';
import { BoardFormModal } from '../../components/board/BoardFormModal';
import { SelectTaskModal } from '../../components/board/SelectTaskModal';
import { ShareBoardModal } from '../../components/board/ShareBoardModal';
import { useAuth } from '../../contexts/AuthContextType';

export const BoardPage = () => {
  const { user } = useAuth();
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [board, setBoard] = useState<Board | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSelectTaskModalOpen, setIsSelectTaskModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedColumnForTask, setSelectedColumnForTask] = useState<number | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const handleShareBoard = async (username: string) => {
    if (!board) return;
    try {
      await addBoardMember(board.id, username);
      setNotification(`Board shared with ${username}`);
      setTimeout(() => setNotification(null), 3000);
    } catch (error: any) {
      console.error("Failed to share board:", error);
      setNotification(error.response?.data?.message || "Failed to share board");
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleCreateBoard = async (title: string, description: string) => {
    try {
      const newBoard = await createBoard(title, description);
      setBoards([newBoard, ...boards]);
    } catch (error) {
      console.error("Failed to create board:", error);
    }
  };

  const handleAddExistingTask = async (taskId: number) => {
    if (!board || selectedColumnForTask === null) return;
    try {
      await moveTask(board.id, taskId, selectedColumnForTask);
      const updatedBoard = await getBoard(board.id);
      setBoard(updatedBoard);
    } catch (error) {
      console.error("Failed to add task:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!boardId) {
          const userBoards = await getBoards();
          setBoards(userBoards);
        } else {
          const data = await getBoard(Number(boardId));
          setBoard(data);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [boardId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!boardId) {
    return (
      <>
        {boards.length === 0 ? (
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100 p-8 w-full max-w-md dark:bg-gray-800 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-6">You don't have any boards yet.</p>
              <Button color="primary" startContent={<Plus size={18} />} onPress={() => setIsCreateModalOpen(true)}>
                Create your first board
              </Button>
            </div>
          </main>
        ) : (
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Your Boards</h1>
              <Button color="primary" startContent={<Plus size={18} />} onPress={() => setIsCreateModalOpen(true)}>
                New Board
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {boards.map((b) => (
                <div
                  key={b.id}
                  onClick={() => navigate(`/board/${b.id}`)}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-primary/50 transition-all cursor-pointer flex flex-col group"
                >
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white group-hover:text-primary transition-colors">{b.title}</h3>
                    {user?.id === b.ownerId && b.members && b.members.length > 0 && (
                      <Chip
                        startContent={<Share2 size={12} />}
                        size="sm"
                        variant="flat"
                        color="secondary"
                      >
                        Shared
                      </Chip>
                    )}
                    {user?.id !== b.ownerId && b.owner && (
                      <Chip
                        startContent={<UserIcon size={12} />}
                        size="sm"
                        variant="flat"
                        color="warning"
                      >
                        Shared by {b.owner.username}
                      </Chip>
                    )}
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 flex-1 line-clamp-2">
                    {b.description || "No description provided."}
                  </p>
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 text-sm text-gray-400 flex justify-between items-center">
                    <span>Created {new Date(b.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </main>
        )}

        <BoardFormModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateBoard}
        />
      </>
    );
  }

  if (!board) {
    navigate("/board");
    return null;
  }

  return (
    <div className="flex flex-col bg-gray-50/30 dark:bg-gray-900/10 min-h-screen relative">
      {notification && (
        <div className="fixed bottom-6 right-6 bg-red-100 text-red-700 px-6 py-3 rounded-lg shadow-xl border border-red-200 flex items-center z-50 animate-in slide-in-from-bottom-5">
          <span className="font-medium">{notification}</span>
        </div>
      )}

      <header className="px-8 py-6 border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm flex justify-between items-start">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {board.title}
            </h1>
            {user?.id === board.ownerId && board.members && board.members.length > 0 && (
              <Chip
                startContent={<Share2 size={14} />}
                size="sm"
                variant="flat"
                color="secondary"
              >
                Shared
              </Chip>
            )}
            {user?.id !== board.ownerId && board.owner && (
              <Chip
                startContent={<UserIcon size={14} />}
                size="sm"
                variant="flat"
                color="warning"
              >
                Shared by {board.owner.username}
              </Chip>
            )}
          </div>
          {board.description && (
            <p className="text-gray-500 mt-1">{board.description}</p>
          )}
        </div>
        {user?.id === board.ownerId && (
          <Button 
            color="primary" 
            variant="flat" 
            startContent={<Users size={18} />} 
            onPress={() => setIsShareModalOpen(true)}
          >
            Share
          </Button>
        )}
      </header>

      <main className="flex-1 overflow-x-auto p-8">
        <div className="flex gap-6 h-full items-start">
          {[...(board.columns || [])].sort((a, b) => a.order - b.order).map((column) => (
            <div
              key={column.id}
              className="min-w-[340px] w-[340px] bg-gray-100/80 dark:bg-gray-800/50 rounded-2xl flex flex-col max-h-full border border-gray-200/50 dark:border-gray-700/50 shadow-sm"
            >
              <div className="p-4 flex items-center justify-between border-b border-gray-200/50 dark:border-gray-700/50 bg-white/40 dark:bg-gray-800/40 rounded-t-2xl">
                <h3 className="font-semibold text-gray-700 dark:text-gray-200">
                  {column.title}
                </h3>
                <div className={`text-sm font-medium px-2.5 py-1 rounded-md ${(column.tasks?.length || 0) > column.wipLimit
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-white text-gray-600 dark:bg-gray-700 dark:text-gray-300 shadow-sm'
                  }`}>
                  [{column.tasks?.length || 0}/{column.wipLimit}]
                </div>
              </div>
              <div className="p-4 flex-1 overflow-y-auto space-y-4">
                {column.tasks?.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => navigate(`/task/${task.id}`)}
                    className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group active:cursor-grabbing"
                  >
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-primary transition-colors text-sm">
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                        {task.description}
                      </p>
                    )}
                  </div>
                ))}
                {(!column.tasks || column.tasks.length === 0) && (
                  <div className="text-center p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-gray-400 pointer-events-none">
                    No tasks
                  </div>
                )}
                <div className="pt-2 pb-1">
                  <Button
                    variant="light"
                    color="primary"
                    className="w-full justify-start text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                    startContent={<Plus size={18} />}
                    isDisabled={column.wipLimit > 0 && (column.tasks?.length || 0) >= column.wipLimit}
                    onPress={() => {
                      setSelectedColumnForTask(column.id);
                      setIsSelectTaskModalOpen(true);
                    }}
                  >
                    Add existing task
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {board && (
        <SelectTaskModal
          isOpen={isSelectTaskModalOpen}
          onClose={() => setIsSelectTaskModalOpen(false)}
          onSelect={handleAddExistingTask}
          currentBoardId={board.id}
        />
      )}

      {board && (
        <ShareBoardModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          onSubmit={handleShareBoard}
        />
      )}
    </div>
  );
};

