import { Button, Card } from "@kiyotakkkka/zvs-uikit-lib/ui";
import { Icon } from "@iconify/react";
import type { AvailableTest } from "@/stores";
import Link from "next/link";

type TestCardProps = {
  test: AvailableTest;
  canEdit?: boolean;
};

const TestInfoPill = ({ icon, label }: { icon: string; label: string }) => (
  <span className="inline-flex items-center gap-1.5 rounded bg-main-800/75 px-2.5 py-1 text-xs font-medium text-main-300 ring-1 ring-main-700/80">
    <Icon icon={icon} width={15} height={15} className="text-main-400" />
    {label}
  </span>
);

export const TestCard = ({ test, canEdit = false }: TestCardProps) => {
  const editHref =
    test.questionsCount > 0
      ? `/test/workbench/${test.id}?q=1`
      : `/test/workbench/${test.id}`;

  return (
    <Card className="group flex h-full flex-col border-main-700/80 bg-main-800/55 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-main-500/80 hover:bg-main-800/80">
      <Card.Header className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-main-700/80 text-main-100 ring-1 ring-main-600/80">
          <Icon icon={test.icon} width={25} height={25} />
        </div>
      </Card.Header>

      <Card.Content className="flex flex-1 flex-col">
        <div className="min-w-0 flex-1">
          <Card.Title className="mt-1 text-lg font-bold leading-tight text-main-50">
            {test.title}
          </Card.Title>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-main-300">
            {test.description}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <TestInfoPill
            icon="mdi:help-circle-outline"
            label={`${test.questionsCount} вопросов `}
          />
          <TestInfoPill
            icon="mdi:clock-outline"
            label={`${test.duration} мин`}
          />
          <TestInfoPill icon="mdi:star-outline" label={`# ${test.rating} #`} />
        </div>
      </Card.Content>

      <Card.Footer className="mt-auto flex items-center justify-between gap-3 border-t border-main-700/70">
        <span className="text-xs text-main-400">
          Прошли # {test.passedCount.toLocaleString("ru-RU")} #
        </span>
        <div className="flex gap-2">
          {canEdit && (
            <Link href={editHref}>
              <Button
                variant="secondary"
                className="px-3 py-1.5 text-sm font-semibold"
              >
                Редактировать
              </Button>
            </Link>
          )}
          <Button
            variant="primary"
            className="px-3 py-1.5 text-sm font-semibold"
          >
            Начать
          </Button>
        </div>
      </Card.Footer>
    </Card>
  );
};
