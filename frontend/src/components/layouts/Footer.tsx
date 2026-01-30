import { Link } from "react-router-dom";

export const Footer = () => {
    return (
        <footer className="mt-6 border-t border-slate-200/70 bg-white/90 rounded-t-[60px]">
            <div className="flex flex-col gap-2 mx-auto max-w-5xl px-4 py-8 md:px-6 items-center sm:items-end text-center sm:text-right">
                <Link
                    to="/"
                    className="text-slate-500 hover:text-indigo-600 text-sm font-medium hover:underline"
                >
                    Главная
                </Link>
                <Link
                    to="/team"
                    className="text-slate-500 hover:text-indigo-600 text-sm font-medium hover:underline"
                >
                    Команда проекта
                </Link>
            </div>
        </footer>
    );
};
