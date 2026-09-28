import { useState } from "react";
import { SplashScreen } from "@/components/SplashScreen";
import HomePage from "@/pages/HomePage";

// Точка входа на маршруте "/". Сначала показывает заставку
// (SplashScreen), после закрытия заставки открывает HomePage
// с колесом. Если на заставке был выбран пункт футера, его ключ
// передаётся в HomePage как initialFooterKey.
export default function SplashGate() {
  const [dismissed, setDismissed] = useState(false);
  const [pendingKey, setPendingKey] = useState<string | undefined>(undefined);

  if (!dismissed) {
    return (
      <SplashScreen
        onSelect={(key) => setPendingKey(key)}
        onDismiss={() => setDismissed(true)}
      />
    );
  }

  return <HomePage initialFooterKey={pendingKey} />;
}