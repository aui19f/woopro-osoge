import SignupForm from "@/app/(auth)/signup/SignupForm";
import Image from "next/image";

export default function Join() {
  return (
    <div className="grid h-screen w-full place-items-center">
      <div className="space-y-8 shadow-2xl w-5/6 rounded-lg px-4 py-8 border border-slate-100">
        <Image
          src="/images/osoge_main_01.png"
          className="mx-auto"
          width={80}
          height={80}
          alt="osoge-logo"
        />

        <SignupForm />
      </div>
    </div>
  );
}
