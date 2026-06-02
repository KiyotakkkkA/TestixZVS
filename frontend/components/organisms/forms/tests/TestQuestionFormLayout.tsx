"use client";

import { Button } from "@kiyotakkkka/zvs-uikit-lib/ui";
import { Icon } from "@iconify/react";
import type { ReactNode } from "react";

type TestQuestionFormLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
  onAdd: () => void;
  addLabel: string;
};

export const TestQuestionFormLayout = ({
  title,
  description,
  children,
  onAdd,
  addLabel,
}: TestQuestionFormLayoutProps) => {
  return (
    <section className="border-t border-main-700/70 pt-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-extrabold text-main-50">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-main-400">
            {description}
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          className="gap-2 px-3 py-1.5"
          onClick={onAdd}
        >
          <Icon icon="mdi:plus" width={18} height={18} />
          {addLabel}
        </Button>
      </div>
      <div className="mt-4 grid gap-2">{children}</div>
    </section>
  );
};
