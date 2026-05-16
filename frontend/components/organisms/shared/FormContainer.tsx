export const FormContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="max-w-md w-[calc(100%-2rem)] mx-auto p-6 bg-main-700/60 rounded-lg shadow-md">
      {children}
    </div>
  );
};
