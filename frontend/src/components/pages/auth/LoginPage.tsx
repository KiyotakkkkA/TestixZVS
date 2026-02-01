import { LoginForm } from "../../molecules/forms/auth";

export const LoginPage = () => {
    return (
        <div className="flex w-full justify-center items-center">
            <div className="w-full max-w-md">
                <LoginForm />
            </div>
        </div>
    );
};
