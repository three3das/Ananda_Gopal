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


export default function App() {
  useEffect(() => {
    document.title = "Parents and children";
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <LanguageProvider>
          {/* ⚠️ ДОБАВЛЕНО: LanguageScriptProvider — общее состояние
              выбора языка алфавита + системы письменности (см.
              @/lib/languageScript). Обязательно ВНУТРИ LanguageProvider,
              поскольку сам использует useLanguage() для языка. Всё,
              что использует useLanguageScript() (HomePage, чипы на
              страницах тем, оверлей колеса ниже), должно быть его
              потомком — поэтому оборачиваем весь Switch + оверлей. */}
          <LanguageScriptProvider>
            <Switch>
              {/* ⚠️ ПРАВКА: сайт больше не требует регистрации/входа —
                  AuthProvider и обёртки RequireSubscription убраны со
                  всех маршрутов, весь сайт открыт для любого посетителя.
                  Маршруты /login, /register, /subscription удалены
                  вместе с системой авторизации. */}
              <Route path="/" component={SplashGate} />
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
              <Route path="/home" component={SplashGate} />
              <Route path="/payments" component={PaymentsPage} />
              <Route path="/svarupa-bhagavana" component={SvarupaBhagavanaPage} />
              {CATEGORIES.filter((cat) => cat.id !== "reading").map((cat) => (
                <Route key={cat.id} path={cat.path}>
                  {() => <CategoryPage category={cat} />}
                </Route>
              ))}
            </Switch>

            {/* ⚠️ ДОБАВЛЕНО: глобальный оверлей с колесом выбора
                языка/письменности — рендерится один раз здесь (а не
                на каждой странице отдельно), сам решает, показываться
                ли ему, через activeWheel из useLanguageScript(). */}
            <LanguageScriptWheelOverlay />
          </LanguageScriptProvider>

          <Toaster />
        </LanguageProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}