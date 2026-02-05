import { RegisterForm } from "../../molecules/forms/auth";

export const RegisterPage = () => {
    return (
        <div className="flex w-full justify-center items-center">
            <div className="w-full max-w-md">
                <RegisterForm
                    title="Создайте учётную запись"
                    subtitle="Зарегистрируйтесь, чтобы продолжить"
                    onlyFields={false}
                />
            </div>
        </div>
    );
};
