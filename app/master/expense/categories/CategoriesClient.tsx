"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Toast from "@/components/ui/components/Toast/Toast";
import { useToast } from "@/components/ui/hooks/useToast";
import {
  addCategory,
  addSubcategory,
  editCategory,
  editSubcategory,
  removeCategory,
  removeSubcategory,
  type CategoryActionState,
} from "../actions";

type Subcategory = { id: string; name: string; description: string | null; order: number };
type Category    = { id: string; name: string; order: number; subcategories: Subcategory[] };

type ModalState =
  | { type: "addCat" }
  | { type: "editCat";  cat: Category }
  | { type: "addSub";   cat: Category }
  | { type: "editSub";  sub: Subcategory; catId: string }
  | null;

export default function CategoriesClient({ initialCategories }: { initialCategories: Category[] }) {
  const router   = useRouter();
  const toast    = useToast(2000);
  const [modal,  setModal]  = useState<ModalState>(null);
  const [, startTransition] = useTransition();

  const refresh = () => startTransition(() => router.refresh());

  const closeModal = () => setModal(null);

  return (
    <>
      <div className="min-h-screen bg-slate-50 pb-24">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 bg-white border-b border-slate-100 sticky top-0 z-10">
          <Link
            href="/master/expense"
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-point transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 19l-7-7 7-7" />
            </svg>
            지출
          </Link>
          <p className="font-bold text-slate-800 text-lg">분류 관리</p>
          <button
            type="button"
            onClick={() => setModal({ type: "addCat" })}
            className="text-sm text-point font-semibold"
          >
            + 대분류
          </button>
        </div>

        <div className="px-4 mt-5 flex flex-col gap-4">
          {initialCategories.length === 0 && (
            <div className="text-center py-16 text-slate-400 text-sm">
              대분류가 없습니다.
            </div>
          )}

          {initialCategories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-2xl border border-slate-100">
              {/* 대분류 헤더 */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-50">
                <span className="font-bold text-slate-800">{cat.name}</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setModal({ type: "addSub", cat })}
                    className="text-xs text-blue-500 font-semibold"
                  >
                    + 중분류
                  </button>
                  <button
                    type="button"
                    onClick={() => setModal({ type: "editCat", cat })}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    수정
                  </button>
                  <DeleteCatButton
                    catId={cat.id}
                    onSuccess={() => { toast.show("삭제되었습니다"); refresh(); }}
                  />
                </div>
              </div>

              {/* 중분류 목록 */}
              {cat.subcategories.length === 0 ? (
                <div className="px-5 py-3 text-xs text-slate-300">중분류가 없습니다.</div>
              ) : (
                cat.subcategories.map((sub) => (
                  <div key={sub.id} className="flex items-start justify-between px-5 py-3 border-b border-slate-50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700">{sub.name}</p>
                      {sub.description && (
                        <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{sub.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-3 mt-0.5">
                      <button
                        type="button"
                        onClick={() => setModal({ type: "editSub", sub, catId: cat.id })}
                        className="text-xs text-slate-400 hover:text-slate-600"
                      >
                        수정
                      </button>
                      <DeleteSubButton
                        subId={sub.id}
                        onSuccess={() => { toast.show("삭제되었습니다"); refresh(); }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 모달 */}
      {modal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-end"
          onClick={closeModal}
        >
          <div
            className="w-full bg-white rounded-t-3xl px-5 pt-5 pb-10"
            onClick={(e) => e.stopPropagation()}
          >
            {modal.type === "addCat" && (
              <AddCatForm
                onSuccess={() => { toast.show("추가되었습니다"); refresh(); closeModal(); }}
                onCancel={closeModal}
              />
            )}
            {modal.type === "editCat" && (
              <EditCatForm
                cat={modal.cat}
                onSuccess={() => { toast.show("수정되었습니다"); refresh(); closeModal(); }}
                onCancel={closeModal}
              />
            )}
            {modal.type === "addSub" && (
              <AddSubForm
                cat={modal.cat}
                onSuccess={() => { toast.show("추가되었습니다"); refresh(); closeModal(); }}
                onCancel={closeModal}
              />
            )}
            {modal.type === "editSub" && (
              <EditSubForm
                sub={modal.sub}
                onSuccess={() => { toast.show("수정되었습니다"); refresh(); closeModal(); }}
                onCancel={closeModal}
              />
            )}
          </div>
        </div>
      )}

      <Toast message={toast.message} visible={toast.visible} />
    </>
  );
}

// ---- 폼 컴포넌트들 ----

function AddCatForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const [state, action, isPending] = useActionState<CategoryActionState, FormData>(addCategory, null);
  useEffect(() => { if (state?.status === 200) onSuccess(); }, [state, onSuccess]);
  return (
    <FormShell title="대분류 추가" action={action} isPending={isPending} onCancel={onCancel}>
      <NameInput />
    </FormShell>
  );
}

function EditCatForm({ cat, onSuccess, onCancel }: { cat: Category; onSuccess: () => void; onCancel: () => void }) {
  const [state, action, isPending] = useActionState<CategoryActionState, FormData>(editCategory, null);
  useEffect(() => { if (state?.status === 200) onSuccess(); }, [state, onSuccess]);
  return (
    <FormShell title="대분류 수정" action={action} isPending={isPending} onCancel={onCancel}>
      <input type="hidden" name="id" value={cat.id} />
      <NameInput defaultValue={cat.name} />
    </FormShell>
  );
}

function AddSubForm({ cat, onSuccess, onCancel }: { cat: Category; onSuccess: () => void; onCancel: () => void }) {
  const [state, action, isPending] = useActionState<CategoryActionState, FormData>(addSubcategory, null);
  useEffect(() => { if (state?.status === 200) onSuccess(); }, [state, onSuccess]);
  return (
    <FormShell title={`중분류 추가 (${cat.name})`} action={action} isPending={isPending} onCancel={onCancel}>
      <input type="hidden" name="categoryId" value={cat.id} />
      <NameInput />
      <DescInput />
    </FormShell>
  );
}

function EditSubForm({ sub, onSuccess, onCancel }: { sub: Subcategory; onSuccess: () => void; onCancel: () => void }) {
  const [state, action, isPending] = useActionState<CategoryActionState, FormData>(editSubcategory, null);
  useEffect(() => { if (state?.status === 200) onSuccess(); }, [state, onSuccess]);
  return (
    <FormShell title="중분류 수정" action={action} isPending={isPending} onCancel={onCancel}>
      <input type="hidden" name="id" value={sub.id} />
      <NameInput defaultValue={sub.name} />
      <DescInput defaultValue={sub.description ?? ""} />
    </FormShell>
  );
}

function DeleteCatButton({ catId, onSuccess }: { catId: string; onSuccess: () => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, isPending] = useActionState<CategoryActionState, FormData>(removeCategory, null);
  useEffect(() => { if (state?.status === 200) onSuccess(); }, [state, onSuccess]);
  return (
    <form ref={formRef} action={action}>
      <input type="hidden" name="id" value={catId} />
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (confirm("대분류를 삭제하면 하위 중분류도 모두 삭제됩니다. 계속하시겠어요?")) {
            formRef.current?.requestSubmit();
          }
        }}
        className="text-xs text-red-400 hover:text-red-600 disabled:opacity-40"
      >
        삭제
      </button>
    </form>
  );
}

function DeleteSubButton({ subId, onSuccess }: { subId: string; onSuccess: () => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, isPending] = useActionState<CategoryActionState, FormData>(removeSubcategory, null);
  useEffect(() => { if (state?.status === 200) onSuccess(); }, [state, onSuccess]);
  return (
    <form ref={formRef} action={action}>
      <input type="hidden" name="id" value={subId} />
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (confirm("중분류를 삭제하시겠어요?")) formRef.current?.requestSubmit();
        }}
        className="text-xs text-red-400 hover:text-red-600 disabled:opacity-40"
      >
        삭제
      </button>
    </form>
  );
}

// ---- 공통 폼 셸 ----

function FormShell({
  title, action, isPending, onCancel, children,
}: {
  title: string;
  action: (payload: FormData) => void;
  isPending: boolean;
  onCancel: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="font-bold text-slate-800">{title}</p>
        <button type="button" onClick={onCancel} className="text-slate-400 hover:text-slate-600">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      <form action={action} className="flex flex-col gap-3">
        {children}
        <button
          type="submit"
          disabled={isPending}
          className="w-full h-12 rounded-2xl bg-point text-white font-bold text-sm disabled:opacity-50 mt-1"
        >
          {isPending ? "저장 중..." : "저장"}
        </button>
        <button type="button" onClick={onCancel} className="w-full h-10 rounded-2xl bg-slate-100 text-slate-500 font-medium text-sm">
          취소
        </button>
      </form>
    </>
  );
}

function NameInput({ defaultValue }: { defaultValue?: string }) {
  return (
    <div>
      <label className="text-xs text-slate-400 block mb-1">이름</label>
      <input
        name="name"
        defaultValue={defaultValue}
        required
        placeholder="이름을 입력하세요"
        className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 focus:outline-none focus:border-blue-400"
      />
    </div>
  );
}

function DescInput({ defaultValue }: { defaultValue?: string }) {
  return (
    <div>
      <label className="text-xs text-slate-400 block mb-1">설명 (선택)</label>
      <textarea
        name="description"
        defaultValue={defaultValue}
        placeholder="도움말에 표시될 설명을 입력하세요"
        rows={2}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 resize-none focus:outline-none focus:border-blue-400 leading-relaxed"
      />
    </div>
  );
}
