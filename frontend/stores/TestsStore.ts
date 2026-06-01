import { makeAutoObservable } from "mobx";

export type AvailableTest = {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: TestDifficulty;
  questionsCount: number;
  duration: number;
  rating: number;
  passedCount: number;
  createdAt: string;
  icon: string;
};

export type TestDifficulty = "easy" | "medium" | "hard";
export type SortOption = "questions" | "duration" | "rating";
export type SortDirection = "asc" | "desc";

type TestComparator = (
  firstTest: AvailableTest,
  secondTest: AvailableTest,
) => number;

const testComparators: Record<SortOption, TestComparator> = {
  questions: (firstTest, secondTest) =>
    firstTest.questionsCount - secondTest.questionsCount,
  duration: (firstTest, secondTest) => firstTest.duration - secondTest.duration,
  rating: (firstTest, secondTest) => firstTest.rating - secondTest.rating,
};

const testsSeed: AvailableTest[] = [
  {
    id: 1,
    title: "Основы JavaScript",
    description:
      "Проверьте знание типов данных, функций, областей видимости и базовых приемов работы с массивами.",
    category: "Frontend",
    difficulty: "easy",
    questionsCount: 18,
    duration: 20,
    rating: 4.8,
    passedCount: 1248,
    createdAt: "2026-05-20",
    icon: "mdi:language-javascript",
  },
  {
    id: 2,
    title: "React и состояние интерфейса",
    description:
      "Компоненты, хуки, контролируемые формы, мемоизация и типичные сценарии построения интерактивных экранов.",
    category: "Frontend",
    difficulty: "medium",
    questionsCount: 24,
    duration: 30,
    rating: 4.9,
    passedCount: 986,
    createdAt: "2026-05-26",
    icon: "mdi:react",
  },
  {
    id: 3,
    title: "SQL для аналитики",
    description:
      "JOIN, агрегаты, группировки, оконные функции и аккуратная работа с выборками из нескольких таблиц.",
    category: "Data",
    difficulty: "medium",
    questionsCount: 21,
    duration: 28,
    rating: 4.7,
    passedCount: 742,
    createdAt: "2026-04-18",
    icon: "mdi:database-search",
  },
  {
    id: 4,
    title: "Python: структуры данных",
    description:
      "Списки, словари, множества, генераторы и выбор подходящей структуры под задачу.",
    category: "Backend",
    difficulty: "easy",
    questionsCount: 16,
    duration: 18,
    rating: 4.6,
    passedCount: 1510,
    createdAt: "2026-03-29",
    icon: "mdi:language-python",
  },
  {
    id: 5,
    title: "Безопасность веб-приложений",
    description:
      "XSS, CSRF, управление токенами, права доступа и практики защиты пользовательских данных.",
    category: "Security",
    difficulty: "hard",
    questionsCount: 30,
    duration: 40,
    rating: 4.9,
    passedCount: 428,
    createdAt: "2026-05-12",
    icon: "mdi:shield-check",
  },
  {
    id: 6,
    title: "Алгоритмы: база",
    description:
      "Оценка сложности, сортировки, поиск, рекурсия и задачи на внимательное чтение условий.",
    category: "Computer Science",
    difficulty: "medium",
    questionsCount: 26,
    duration: 35,
    rating: 4.8,
    passedCount: 877,
    createdAt: "2026-05-02",
    icon: "mdi:graph-outline",
  },
];

export class TestsStore {
  tests = testsSeed;
  query = "";
  sortBy: SortOption = "questions";
  sortDirection: SortDirection = "desc";

  constructor() {
    makeAutoObservable(this);
  }

  get filteredTests() {
    const normalizedQuery = this.query.trim().toLowerCase();

    return this.tests
      .filter((test) => {
        const matchesQuery =
          !normalizedQuery ||
          test.title.toLowerCase().includes(normalizedQuery);

        return matchesQuery;
      })
      .sort((firstTest, secondTest) => {
        const sortOrder = this.sortDirection === "asc" ? 1 : -1;

        return testComparators[this.sortBy](firstTest, secondTest) * sortOrder;
      });
  }

  get averageRating() {
    const ratingSum = this.tests.reduce((sum, test) => sum + test.rating, 0);

    return (ratingSum / this.tests.length).toFixed(1);
  }

  setQuery = (query: string) => {
    this.query = query;
  };

  setSortBy = (sortBy: SortOption) => {
    this.sortBy = sortBy;
  };

  toggleSortDirection = () => {
    this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
  };

  resetFilters = () => {
    this.query = "";
    this.sortBy = "questions";
    this.sortDirection = "desc";
  };
}

export const testsStore = new TestsStore();
