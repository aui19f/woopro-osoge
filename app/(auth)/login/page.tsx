import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-point text-center mb-6">
          오소게 로그인
        </h1>
        <LoginForm />
      </div>
    </main>
  );
}
