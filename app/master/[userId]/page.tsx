import { logoutAction } from "@/app/master/reception/actions";

export default function MyPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-6">
      <h1 className="text-xl font-semibold text-slate-800">마이페이지</h1>
      <form action={logoutAction}>
        <button
          type="submit"
          className="px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 active:bg-red-700 transition-colors"
        >
          로그아웃
        </button>
      </form>
    </div>
  );
}
