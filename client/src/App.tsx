import { useEffect } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { LanguageProvider } from "@/lib/i18n";
import { LanguageScriptProvider } from "@/lib/languageScript";
import { LanguageScriptWheelOverlay } from "@/components/LanguageScriptWheelOverlay";
import { Toaster } from "@/components/ui/toaster";
import { ToastProvider } from "@/components/ui/toast";
import SplashGate from "@/pages/SplashGate";
import AdminPanel from "@/pages/admin";
import CategoryPage from "@/components/CategoryPage";
import ReadingPage from "@/pages/ReadingPage";
import AlphabetPage from "@/pages/AlphabetPage";
import NumbersPage from "@/pages/NumbersPage";
import NotesPage from "@/pages/NotesPage";
import ColorsPage from "@/pages/ColorsPage";
import ShapesPage from "@/pages/ShapesPage";
import LivingWorldPage from "@/pages/LivingWorldPage";
import ElementsPage from "@/pages/ElementsPage";
import PunctuationPage from "@/pages/PunctuationPage";
import SvarupaBhagavanaPage from "@/pages/SvarupaBhagavanaPage";
import GamePage from "@/pages/game";
import { CATEGORIES } from "@/lib/categories";
import PaymentsPage from "@/pages/PaymentsPage";

// ⚠️ УДАЛЕНО (этап 1): RequireSubscription, LoginPage, RegisterPage,
// SubscriptionPage и их маршруты /login, /register, /subscription.
// Все остальные маршруты теперь открыты без входа.

export default function App() {
  useEffect(() => {
    document.title = "Ananda Gopal";
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
          <LanguageProvider>
            <LanguageScriptProvider>
              <Switch>
                <Route path="/" component={SplashGate} />
                <Route path="/home" component={SplashGate} />
                <Route path="/admin" component={AdminPanel} />
                <Route path="/game" component={GamePage} />
                <Route path="/reading" component={ReadingPage} />
                <Route path="/alphabet" component={AlphabetPage} />
                <Route path="/numbers" component={NumbersPage} />
                <Route path="/notes" component={NotesPage} />
                <Route path="/colors" component={ColorsPage} />
                <Route path="/shapes" component={ShapesPage} />
                <Route path="/living-world" component={LivingWorldPage} />
                <Route path="/elements" component={ElementsPage} />
                <Route path="/punctuation" component={PunctuationPage} />
                <Route path="/payments" component={PaymentsPage} />
                <Route path="/svarupa-bhagavana" component={SvarupaBhagavanaPage} />
                {CATEGORIES.filter((cat) => cat.id !== "reading").map((cat) => (
                  <Route key={cat.id} path={cat.path}>
                    {() => <CategoryPage category={cat} />}
                  </Route>
                ))}
              </Switch>

              <LanguageScriptWheelOverlay />
            </LanguageScriptProvider>

            <Toaster />
          </LanguageProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}