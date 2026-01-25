import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Task, priorityColors, statusColors, TaskStatus } from "../types/task";
import { getMyDayTasks, getTasks } from "../api/taskApi";
import { CalendarDays, Sun, X, Calendar as CalendarIcon } from "lucide-react";
import {
  DatePicker,
  DateValue,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Spinner,
  Checkbox,
  Chip,
} from "@heroui/react";
import { today, getLocalTimeZone, parseDate } from "@internationalized/date";

interface MyDayFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: [number, string | null][]) => Promise<void>;
  addMode: boolean;
}

export const MyDayTasksSelection: React.FC<MyDayFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  addMode,
}) => {
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [scheduleTasks, setScheduleTasks] = useState<Task[]>([]);
  const [idsToDate, setIdsToDate] = useState<[number, string | null][]>([]);
  const [initialData, setInitialData] = useState<string>("[]");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mode, setMode] = useState<"today" | "schedule">(
    addMode ? "today" : "schedule",
  );

  const currentTodayStr = useMemo(
    () => today(getLocalTimeZone()).toString(),
    [],
  );

  const loadAllTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const [resAllTasks, resMyDay] = await Promise.all([
        getTasks(),
        getMyDayTasks(),
      ]);

      const filterNotDone = (tasks: Task[]) =>
        tasks.filter((t) => t.status !== TaskStatus.DONE);

      const allNotDone = filterNotDone(resAllTasks);
      const myDayNotDone = filterNotDone(resMyDay);

      setTodayTasks(allNotDone);
      setScheduleTasks(myDayNotDone);

      const prefilled: [number, string | null][] = allNotDone
        .filter((t) => t.plannedFor)
        .map((t) => [t.id, t.plannedFor]);

      const sortedData = [...prefilled].sort((a, b) => a[0] - b[0]);
      setIdsToDate(sortedData);
      setInitialData(JSON.stringify(sortedData));
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setMode(addMode ? "today" : "schedule");
      loadAllTasks();
    }
  }, [isOpen, addMode, loadAllTasks]);

  const resetToInitial = useCallback(() => {
    setIdsToDate(JSON.parse(initialData));
  }, [initialData]);

  const hasChanges = useMemo(() => {
    const currentSorted = [...idsToDate].sort((a, b) => a[0] - b[0]);
    return JSON.stringify(currentSorted) !== initialData;
  }, [idsToDate, initialData]);

  const toggleTask = (toggledId: number) => {
    setIdsToDate((prev) => {
      const existingPair = prev.find(([id]) => id === toggledId);

      if (existingPair) {
        if (existingPair[1] === currentTodayStr) {
          return prev.map((pair) =>
            pair[0] === toggledId ? [toggledId, null] : pair,
          );
        } else {
          return prev.map((pair) =>
            pair[0] === toggledId ? [toggledId, currentTodayStr] : pair,
          );
        }
      } else {
        return [...prev, [toggledId, currentTodayStr]];
      }
    });
  };

  const updateTaskDate = (toggledId: number, dateValue: DateValue | null) => {
    const dateStr = dateValue ? dateValue.toString() : null;
    setIdsToDate((prev) => {
      const exists = prev.some(([id]) => id === toggledId);
      if (exists) {
        return prev.map((pair) =>
          pair[0] === toggledId ? [toggledId, dateStr] : pair,
        );
      }
      return [...prev, [toggledId, dateStr]];
    });
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onSubmit(idsToDate);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentTasks = mode === "today" ? todayTasks : scheduleTasks;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      placement="center"
      scrollBehavior="inside"
      size="2xl"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 border-b border-default-100">
              Manage your day
            </ModalHeader>
            <ModalBody className="p-0">
              <div className="flex p-4 pb-0">
                <div className="flex w-full bg-default-100 p-1 rounded-medium">
                  <Button
                    size="sm"
                    className={`flex-1 ${mode === "today" ? "bg-background shadow-sm text-primary" : "bg-transparent text-default-500"}`}
                    onPress={() => {
                      setMode("today");
                      resetToInitial();
                    }}
                    variant="light"
                  >
                    <Sun className="w-4 h-4 mr-2" /> Add for today
                  </Button>
                  <Button
                    size="sm"
                    className={`flex-1 ${mode === "schedule" ? "bg-background shadow-sm text-secondary" : "bg-transparent text-default-500"}`}
                    onPress={() => {
                      setMode("schedule");
                      resetToInitial();
                    }}
                    variant="light"
                  >
                    <CalendarDays className="w-4 h-4 mr-2" /> Plan for another
                    date
                  </Button>
                </div>
              </div>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Spinner size="lg" />
                </div>
              ) : (
                <div className="flex flex-col gap-2 p-4">
                  {currentTasks.map((task) => {
                    const taskDateEntry = idsToDate.find(([id]) => id === task.id);
                    const isChecked = taskDateEntry && taskDateEntry[1] === currentTodayStr;

                    return (
                      <div
                        key={task.id}
                        className={`flex items-center justify-between p-3 rounded-medium border transition-all cursor-pointer hover:bg-default-50 ${isChecked
                          ? "border-primary bg-primary-50/50"
                          : "border-default-200"
                          }`}
                        onClick={(e) => {
                          if (
                            (e.target as HTMLElement).closest(
                              ".datepicker-container",
                            )
                          )
                            return;
                          if (mode === "today") toggleTask(task.id);
                        }}
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-12 shrink-0 flex justify-center">
                            {mode === "today" ? (
                              <Checkbox
                                isSelected={!!isChecked}
                                onValueChange={() => toggleTask(task.id)}
                              />
                            ) : (
                              <div className="relative flex items-center justify-center datepicker-container">
                                <DatePicker
                                  aria-label="Pick date"
                                  variant="bordered"
                                  minValue={today(getLocalTimeZone())}
                                  value={
                                    idsToDate.find(([id]) => id === task.id)?.[1]
                                      ? parseDate(
                                        idsToDate.find(
                                          ([id]) => id === task.id,
                                        )![1] as string,
                                      )
                                      : null
                                  }
                                  onChange={(date) =>
                                    updateTaskDate(task.id, date)
                                  }
                                  className="w-[40px] **:data-[slot=input-wrapper]:px-0 **:data-[slot=input-wrapper]:border-none **:data-[slot=input-wrapper]:bg-transparent"
                                  showMonthAndYearPickers
                                  selectorIcon={
                                    <div className="flex items-center justify-center w-full h-full">
                                      <CalendarIcon
                                        className={`w-5 h-5 ${isChecked ? "text-secondary" : "text-default-400"}`}
                                      />
                                    </div>
                                  }
                                />
                                {idsToDate.find(
                                  ([id]) => id === task.id,
                                )?.[1] && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateTaskDate(task.id, null);
                                      }}
                                      className="absolute -top-1 -right-1 bg-danger text-white rounded-full p-0.5 z-10 border border-white shadow-sm"
                                    >
                                      <X className="w-2 h-2" />
                                    </button>
                                  )}
                              </div>
                            )}
                          </div>
                          <span className="font-medium text-foreground truncate select-none">
                            {task.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-4">
                          <Chip
                            size="sm"
                            variant="flat"
                            className={statusColors[task.status]}
                          >
                            {task.status.replace("_", " ")}
                          </Chip>
                          <Chip
                            size="sm"
                            variant="flat"
                            className={priorityColors[task.priority]}
                          >
                            {task.priority}
                          </Chip>
                          {idsToDate.some(([id]) => id === task.id) &&
                            mode === "schedule" && (
                              <Chip
                                size="sm"
                                variant="flat"
                                color={
                                  idsToDate.find(
                                    (item) => item[0] === task.id,
                                  )?.[1]
                                    ? "secondary"
                                    : "warning"
                                }
                                className="hidden sm:flex"
                              >
                                {idsToDate.find(
                                  (item) => item[0] === task.id,
                                )?.[1] || "No date"}
                              </Chip>
                            )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ModalBody>
            <ModalFooter className="border-t border-default-100">
              <Button variant="light" color="danger" onPress={onClose}>
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={handleConfirm}
                isDisabled={!hasChanges || isLoading}
                isLoading={isLoading}
              >
                Confirm
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
