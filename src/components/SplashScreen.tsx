import { useState, useEffect } from "react";
import logoImg from "@/assets/logo.png";

export function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setFadeOut(true), 1500);
    const timer2 = setTimeout(onFinish, 2000);
    return () => { clearTimeout(timer1); clearTimeout(timer2); };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${fadeOut ? "opacity-0" : "opacity-100"}`}
    >
      <img
        src={logoImg}
        alt="Schoolers"
        className="h-28 w-28 rounded-2xl object-contain animate-pulse"
      />
      <h1 className="mt-4 text-2xl font-bold text-foreground">Schoolers</h1>
      <p className="text-sm text-muted-foreground mt-1">School Management System</p>
      <div className="mt-6 h-1 w-40 overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-primary rounded-full animate-[loading_1.5s_ease-in-out]" />
      </div>
    </div>
  );
}
