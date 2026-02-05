import { Spinner } from "../../atoms";

interface DataInformalBlockProps {
    isLoading?: boolean;
    isError?: boolean;
    isEmpty?: boolean;

    loadingMessage?: string;
    errorMessage?: string;
    emptyMessage?: string;
}

export const DataInformalBlock = ({
    isLoading,
    isError,
    isEmpty,
    loadingMessage = "Загрузка данных...",
    errorMessage = "Произошла ошибка при загрузке данных.",
    emptyMessage = "Не найдено ни одной записи для текущих фильтров.",
}: DataInformalBlockProps) => {
    const classesBase =
        "w-full rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500";
    const classesError =
        "w-full rounded-lg border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700";

    const messagePriorityChecker = () => {
        if (isLoading)
            return (
                <span className="inline-flex items-center justify-center gap-2">
                    <Spinner className="h-5 w-5" />
                    {loadingMessage}
                </span>
            );
        if (isError) return errorMessage;
        if (isEmpty) return emptyMessage;
        return null;
    };

    const canBeVisible = Boolean(isLoading || isError || isEmpty);

    if (!canBeVisible) return null;

    return (
        <div className={isError ? classesError : classesBase}>
            {messagePriorityChecker()}
        </div>
    );
};
