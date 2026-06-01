"use client";

import {
  Alert,
  Button,
  EmptyState,
  InputBig,
  InputSmall,
  Modal,
} from "@kiyotakkkka/zvs-uikit-lib/ui";
import { Icon } from "@iconify/react";
import { Pagination } from "@/components/atoms";
import { TestCard } from "@/components/molecules/cards";
import { authStore, testsStore } from "@/stores";
import Image from "next/image";
import { reaction } from "mobx";
import { observer } from "mobx-react-lite";
import { TestsListFilter } from "../filters";
import { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { endpoints } from "@/services/endpoints";
import { useToasts } from "@kiyotakkkka/zvs-uikit-lib/hooks";
import type { AvailableTest } from "@/stores";

type CreateTestRequest = {
  title: string;
  description: string;
  estimatedPassTime: number;
};

export const TestCatalogSection = observer(() => {
  const toasts = useToasts();
  const { filteredTests } = testsStore;
  const isAuthenticated = authStore.isAuthenticated;
  const canCreateTest = authStore.isUserHasPermission("tests.edit");
  const canEditAnyTest = authStore.isUserHasPermission("tests.master");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateConfirmModalOpen, setIsCreateConfirmModalOpen] =
    useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [estimatedPassTime, setEstimatedPassTime] = useState(20);

  const { execute: createTest, loading: isCreatingTest } = useApi<
    AvailableTest,
    CreateTestRequest
  >(endpoints.tests.create, "POST", {
    immediate: false,
    onSuccessFn: () => {
      toasts.success({
        title: "Готово!",
        description: "Тест создан.",
      });
    },
    onErrorFn: (error) => {
      toasts.danger({
        title: "Ошибка!",
        description: error,
      });
    },
  });

  useEffect(() => {
    return reaction(
      () => [
        testsStore.query,
        testsStore.sortBy,
        testsStore.sortDirection,
        testsStore.page,
        testsStore.perPage,
      ],
      () => {
        void testsStore.loadTests();
      },
      { fireImmediately: true },
    );
  }, []);

  const resetCreateForm = () => {
    setTitle("");
    setDescription("");
    setEstimatedPassTime(20);
  };

  const closeCreateModal = () => {
    setIsCreateConfirmModalOpen(false);
    setIsCreateModalOpen(false);
    resetCreateForm();
  };

  const handleCreateConfirm = async () => {
    const response = await createTest({
      title,
      description,
      estimatedPassTime,
    });

    if (!response.ok) {
      return;
    }

    closeCreateModal();
    void testsStore.loadTests();
  };

  const canEditTest = (test: AvailableTest) => {
    return canEditAnyTest || String(authStore.user?.id) === test.authorId;
  };

  return (
    <main className="min-h-[calc(100vh-58px)] bg-main-900 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="overflow-hidden rounded-lg border border-main-700/70 bg-main-800/45 p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 rounded bg-main-700/80 px-3 py-1 text-xs font-bold uppercase tracking-wide text-main-300">
                <Icon
                  icon="mdi:clipboard-check-outline"
                  width={16}
                  height={16}
                />
                Каталог тестов
              </p>
              <h1 className="mt-4 text-3xl font-extrabold leading-tight text-main-50 sm:text-4xl">
                Выберите тест и проверьте свои знания
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-main-300 sm:text-base">
                Быстрый поиск по темам, фильтрация по сложности и сортировка
                помогают сразу найти подходящую проверку навыков.
              </p>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div className="flex size-28 items-center justify-center rounded-lg border border-main-700 bg-main-900/35 p-4 shadow-inner sm:size-32 lg:size-36">
                <Image
                  src="/images/logo.svg"
                  width={112}
                  height={112}
                  alt="Logo"
                  className="h-full w-full object-contain opacity-90"
                  priority
                />
              </div>
            </div>
          </div>
          {!isAuthenticated && (
            <Alert variant="warning" className="mt-6">
              Вы не авторизованы! Некоторые тесты могут быть вам недоступны...
            </Alert>
          )}
        </section>

        <TestsListFilter />

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="danger"
            onClick={testsStore.resetFilters}
            className="px-3 py-1.5"
          >
            Сбросить фильтры
          </Button>
          {canCreateTest && (
            <Button
              variant="primary"
              className="py-1.5 px-2 gap-2"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Icon icon="mdi:plus-circle-outline" width={22} height={22} />
              Создать тест
            </Button>
          )}
        </div>

        {testsStore.loading ? (
          <div className="flex items-center justify-center gap-3 rounded-lg border border-main-700 bg-main-800/45 p-10 text-sm text-main-300">
            <Icon
              icon="mdi:loading"
              width={24}
              height={24}
              className="animate-spin"
            />
            Загружаем тесты...
          </div>
        ) : testsStore.error ? (
          <EmptyState
            icon={
              <Icon icon="mdi:alert-circle-outline" width={48} height={48} />
            }
            className="bg-main-800/35 p-10"
            title="Не удалось загрузить тесты"
            description={testsStore.error}
          />
        ) : filteredTests.length > 0 ? (
          <>
            <section className="rounded-lg border border-main-700 bg-main-800/45 p-2 sm:p-3">
              <Pagination
                page={testsStore.meta.currentPage}
                perPage={testsStore.meta.perPage}
                total={testsStore.meta.total}
                lastPage={testsStore.meta.lastPage}
                from={testsStore.meta.from}
                to={testsStore.meta.to}
                onPageChange={testsStore.setPage}
                onPerPageChange={testsStore.setPerPage}
              />
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredTests.map((test) => (
                <TestCard
                  key={test.id}
                  test={test}
                  canEdit={canEditTest(test)}
                />
              ))}
            </section>
          </>
        ) : (
          <EmptyState
            icon={
              <Icon icon="mdi:emoticon-sad-outline" width={48} height={48} />
            }
            className="bg-main-800/35 p-10"
            title="Тесты не найдены"
            description="Попробуйте изменить запрос или сбросить фильтры."
          />
        )}
      </div>

      <Modal
        open={isCreateModalOpen}
        onClose={closeCreateModal}
        className="w-[min(560px,calc(100vw-2rem))]"
      >
        <Modal.Header>Создание теста</Modal.Header>
        <Modal.Content className="p-5 space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-main-300">
              Название
            </span>
            <InputSmall
              required
              value={title}
              placeholder="Например: Основы TypeScript"
              classNames={{ wrapper: "w-full" }}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-main-300">
              Описание
            </span>
            <InputBig
              required
              value={description}
              placeholder="Кратко опишите тест..."
              onChange={(event) => setDescription(event.target.value)}
              className="w-full h-36 resize-none px-3 py-2 text-sm"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-main-300">
              Примерное время прохождения, минут
            </span>
            <InputSmall
              required
              min={1}
              max={1440}
              type="number"
              value={estimatedPassTime}
              classNames={{ wrapper: "w-full" }}
              onChange={(event) =>
                setEstimatedPassTime(Number(event.target.value))
              }
            />
          </label>

          <div className="flex justify-end gap-2 border-t border-main-700 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={closeCreateModal}
              className="px-3 py-1.5"
            >
              Отмена
            </Button>
            <Button
              variant="primary"
              className="px-3 py-1.5"
              onClick={() => setIsCreateConfirmModalOpen(true)}
            >
              Продолжить
            </Button>
          </div>
        </Modal.Content>
      </Modal>

      <Modal
        closeOnOverlayClick={false}
        open={isCreateConfirmModalOpen}
        onClose={() => setIsCreateConfirmModalOpen(false)}
        className="w-[min(460px,calc(100vw-2rem))]"
      >
        <Modal.Header>Подтвердите создание</Modal.Header>
        <Modal.Content className="space-y-3 text-sm text-main-300">
          <p>
            Создать тест{" "}
            <span className="font-semibold text-main-50">{title}</span>?
          </p>
        </Modal.Content>
        <Modal.Footer className="flex justify-end gap-2">
          <Button
            variant="secondary"
            onClick={() => setIsCreateConfirmModalOpen(false)}
            className="px-3 py-1.5"
            disabled={isCreatingTest}
          >
            Назад
          </Button>
          <Button
            variant={isCreatingTest ? "secondary" : "primary"}
            onClick={handleCreateConfirm}
            className="px-3 py-1.5"
            disabled={isCreatingTest}
          >
            {isCreatingTest ? "Создание..." : "Создать"}
          </Button>
        </Modal.Footer>
      </Modal>
    </main>
  );
});
