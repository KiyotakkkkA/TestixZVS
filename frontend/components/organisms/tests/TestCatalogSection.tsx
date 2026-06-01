"use client";

import { Alert, Button, EmptyState } from "@kiyotakkkka/zvs-uikit-lib/ui";
import { Icon } from "@iconify/react";
import { Pagination } from "@/components/atoms";
import { TestCard } from "@/components/molecules/cards";
import { authStore, testsStore } from "@/stores";
import Image from "next/image";
import { reaction } from "mobx";
import { observer } from "mobx-react-lite";
import { TestsListFilter } from "../filters";
import { useEffect, useMemo, useState } from "react";

export const TestCatalogSection = observer(() => {
  const { filteredTests } = testsStore;
  const isAuthenticated = authStore.isAuthenticated;
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const total = filteredTests.length;
  const lastPage = Math.max(Math.ceil(total / perPage), 1);
  const paginationRange = useMemo(() => {
    if (total === 0) {
      return { from: null, to: null };
    }

    const from = (page - 1) * perPage + 1;
    const to = Math.min(page * perPage, total);

    return { from, to };
  }, [page, perPage, total]);

  useEffect(() => {
    return reaction(
      () => [testsStore.query, testsStore.sortBy, testsStore.sortDirection],
      () => setPage(1),
    );
  }, []);

  useEffect(() => {
    if (page > lastPage) {
      setPage(lastPage);
    }
  }, [lastPage, page]);

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
          {authStore.isUserHasPermission("tests.edit") && (
            <Button variant="primary" className="py-1.5 px-2 gap-2">
              <Icon icon="mdi:plus-circle-outline" width={22} height={22} />
              Создать тест
            </Button>
          )}
        </div>

        {filteredTests.length > 0 ? (
          <>
            <section className="rounded-lg border border-main-700 bg-main-800/45 p-2 sm:p-3">
              <Pagination
                page={page}
                perPage={perPage}
                total={total}
                lastPage={lastPage}
                from={paginationRange.from}
                to={paginationRange.to}
                onPageChange={setPage}
                onPerPageChange={(value) => {
                  setPerPage(value);
                  setPage(1);
                }}
              />
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredTests.map((test) => (
                <TestCard key={test.id} test={test} />
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
            description="Попробуйте изменить запрос, выбрать другую категорию или сбросить фильтры."
          />
        )}
      </div>
    </main>
  );
});
