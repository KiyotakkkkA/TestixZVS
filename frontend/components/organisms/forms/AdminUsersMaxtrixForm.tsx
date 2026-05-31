"use client";

import { InputCheckBox } from "@kiyotakkkka/zvs-uikit-lib/ui";
import { useState } from "react";

type AccessEntity = {
  key: string;
  label: string;
  description: string;
};

type AccessAspect = {
  key: string;
  label: string;
};

const accessEntities: AccessEntity[] = [
  {
    key: "tests",
    label: "Тесты",
    description: "Каталог, прохождение и управление тестами",
  },
];

const accessAspects: AccessAspect[] = [
  {
    key: "view",
    label: "Просмотр",
  },
  {
    key: "content",
    label: "Изменение содержимого",
  },
  {
    key: "access",
    label: "Изменение доступа",
  },
];

const createMatrixState = () => {
  return Object.fromEntries(
    accessEntities.map((entity) => [
      entity.key,
      Object.fromEntries(accessAspects.map((aspect) => [aspect.key, false])),
    ]),
  ) as Record<string, Record<string, boolean>>;
};

export const AdminUsersMaxtrixForm = () => {
  const [matrix, setMatrix] = useState(createMatrixState);

  const handleChange = (
    entityKey: string,
    aspectKey: string,
    checked: boolean,
  ) => {
    setMatrix((currentMatrix) => ({
      ...currentMatrix,
      [entityKey]: {
        ...currentMatrix[entityKey],
        [aspectKey]: checked,
      },
    }));
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-main-700 bg-main-900/60">
      <table className="min-w-180 w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-main-700 bg-main-800/80">
            <th className="w-64 px-4 py-3 text-xs font-bold uppercase tracking-wide text-main-300">
              Сущность
            </th>
            {accessAspects.map((aspect) => (
              <th
                key={aspect.key}
                className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-main-300"
              >
                {aspect.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {accessEntities.map((entity) => (
            <tr
              key={entity.key}
              className="border-b border-main-800 last:border-b-0"
            >
              <th className="px-4 py-4 align-top">
                <span className="block text-sm font-semibold text-main-50">
                  {entity.label}
                </span>
                <span className="mt-1 block text-xs leading-5 text-main-400">
                  {entity.description}
                </span>
              </th>
              {accessAspects.map((aspect) => (
                <td key={aspect.key} className="px-4 py-4 text-center">
                  <div className="inline-flex justify-center">
                    <InputCheckBox
                      checked={matrix[entity.key][aspect.key]}
                      onChange={(checked) =>
                        handleChange(entity.key, aspect.key, checked)
                      }
                      aria-label={`${entity.label}: ${aspect.label}`}
                    />
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
