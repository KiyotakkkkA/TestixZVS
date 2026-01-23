import { Icon } from "@iconify/react";

import { Button } from "../../atoms";

export const E403 = () => {
  return (
    <div className="w-full flex items-center justify-center">
      <div className="w-full max-w-xl rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-2xl"><Icon icon='mdi:block-helper' /></div>
        <h1 className="text-2xl font-bold text-slate-800">Доступ запрещён</h1>
        <p className="mt-2 text-sm text-slate-500">
          У вас недостаточно прав для доступа к этой странице.
        </p>
        <div className="mt-5 flex justify-center">
          <Button to="/" primary className="px-5 py-2 text-sm">
            На главную
          </Button>
        </div>
      </div>
    </div>
  );
};
