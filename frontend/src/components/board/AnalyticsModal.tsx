import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { getBottlenecksReport, getProductivityReport } from "../../api/boardApi";

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: number;
}

interface BottleneckStat {
  columnTitle: string;
  averageTimeMs: number;
}

interface ProductivityStat {
  userId: number;
  username: string;
  completedTasks: number;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  isOpen,
  onClose,
  boardId,
}) => {
  const [bottlenecks, setBottlenecks] = useState<BottleneckStat[]>([]);
  const [productivity, setProductivity] = useState<ProductivityStat[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && boardId) {
      loadData();
    }
  }, [isOpen, boardId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [bottlenecksData, productivityData] = await Promise.all([
        getBottlenecksReport(boardId),
        getProductivityReport(boardId),
      ]);
      setBottlenecks(bottlenecksData);
      setProductivity(productivityData);
    } catch (error) {
      console.error("Failed to load analytics", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (ms: number) => {
    if (isNaN(ms) || ms < 0) return "N/A";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m`;
    return `${totalSeconds}s`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} placement="center" size="2xl" scrollBehavior="inside">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Board Analytics
            </ModalHeader>
            <ModalBody>
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Bottlenecks Table */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Average Time in Columns</h3>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                          <tr>
                            <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Column</th>
                            <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Average Time</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {bottlenecks.length > 0 ? (
                            bottlenecks.map((stat, idx) => (
                              <tr key={idx} className="bg-white dark:bg-gray-900">
                                <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{stat.columnTitle}</td>
                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{formatTime(stat.averageTimeMs)}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={2} className="px-4 py-8 text-center text-gray-500">No data available</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Productivity Table */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Productivity Ranking</h3>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                          <tr>
                            <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Rank</th>
                            <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">User</th>
                            <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">Completed Tasks</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {productivity.length > 0 ? (
                            productivity.map((stat, idx) => (
                              <tr key={stat.userId} className="bg-white dark:bg-gray-900">
                                <td className="px-4 py-3 text-gray-500 font-medium">#{idx + 1}</td>
                                <td className="px-4 py-3 text-gray-800 dark:text-gray-200 font-medium">{stat.username}</td>
                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                  <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 font-semibold">
                                    {stat.completedTasks}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={3} className="px-4 py-8 text-center text-gray-500">No data available</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
