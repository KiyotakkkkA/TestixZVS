"use client";

import { Alert, Button, EmptyState } from "@kiyotakkkka/zvs-uikit-lib/ui";
import { Icon } from "@iconify/react";
import { TestCard } from "@/components/molecules/cards";
import { authStore, testsStore } from "@/stores";
import { observer } from "mobx-react-lite";
import { TestsListFilter } from "../filters";

export const TestCatalogSection = observer(() => {
  const { filteredTests } = testsStore;
  const isAuthenticated = authStore.isAuthenticated;

  return (
    <main className="min-h-[calc(100vh-58px)] bg-main-900 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="overflow-hidden rounded-lg border border-main-700/70 bg-main-800/45 p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
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
          </div>
          {!isAuthenticated && (
            <Alert variant="warning" className="mt-6">
              Вы не авторизованы! Некоторые тесты могут быть вам недоступны...
            </Alert>
          )}
        </section>

        <TestsListFilter />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-main-300">
            Найдено:{" "}
            <span className="font-semibold text-main-50">
              {filteredTests.length}
            </span>
          </p>
          <Button
            variant="danger"
            onClick={testsStore.resetFilters}
            className="px-3 py-1.5"
          >
            Сбросить фильтры
          </Button>
        </div>

        {filteredTests.length > 0 ? (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredTests.map((test) => (
              <TestCard key={test.id} test={test} />
            ))}
          </section>
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
