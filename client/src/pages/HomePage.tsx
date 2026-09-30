import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { footerNav } from "@/lib/siteNav";
import { useHeaderNavItems } from "@/lib/headerWords";
import {
  useLanguageScript,
  FIRST_LETTER,
  ALPHABET_LABEL,
} from "@/lib/languageScript";
import Wheel12, { SECTOR_COUNT } from "@/components/Wheel12";
import { WheelHeader, WheelFooter, WheelPageShell } from "@/components/SiteHeaderFooter";

// ⚠️ ПРАВКА: списки языков/письменностей (languageOptions/scriptOptions),
// FIRST_LETTER/ALPHABET_LABEL, DEFAULT_LANGUAGE и оба колеса выбора
// (LanguagesWheelView/ScriptsWheelView) переехали в
// "@/lib/languageScript" + "@/components/LanguageScriptWheelOverlay" —
// это общий контекст, доступный с любой страницы сайта (не только
// отсюда), в соответствии с финальной схемой мастера выбора
// языка/письменности. Здесь остаётся только то, что относится к
// колесу ТЕМ (категории/игры) — это прямая ответственность этой
// страницы.
//
// Заставка (SplashScreen) здесь НЕ рендерится: ею управляет
// SplashGate.tsx на уровне маршрута "/". HomePage получает
// необязательный проп initialFooterKey — ключ кнопки, которую выбрали
// на заставке — и при монтировании выполняет тот же handleFooterClick,
// что и обычный клик по футеру, так что переходы гарантированно
// совпадают.

// Текст кнопки "Желаю поддержать проект", разбитый вручную на 3
// строки — иначе не помещается в круг.
const CHARITY_LABEL_LINES = ["Желаю", "поддержать", "проект"];

// Текст кнопки "Узнать нужное слово", разбитый вручную на 3 строки.
const DICTIONARY_LABEL_LINES = ["Узнать", "нужное", "слово"];

// ⚠️ ИЗМЕНЕНО: колесо кнопки "Свойства сайта". Сектор №1 освобождён
// ("Узнать нужное слово" переехало на колесо "Предмет изучения").
// Остался только сектор №12 (последний) — "Желаю поддержать проект";
// остальные пустые.
const DICTIONARY_LABELS: string[][] = Array.from(
  { length: SECTOR_COUNT },
  (_, i) => (i === SECTOR_COUNT - 1 ? CHARITY_LABEL_LINES : [])
);

// Кликабелен только последний сектор (пожертвование).
const DICTIONARY_CLICKABLE_INDICES = [SECTOR_COUNT - 1];

function splitLabelIntoLines(label: string): string[] {
  const words = label.split(" ");
  const lines: string[] = [];
  for (let i = 0; i < words.length; i += 2) {
    lines.push(words.slice(i, i + 2).join(" "));
  }
  return lines;
}

const CATEGORY_ITEMS: string[] = [
  "Игры",
  "Природа",
  "Кулинария",
  "Культура",
  "Образование",
  "Наука",
  "Творчество",
  "Медицина",
  "Обычаи",
  "Религия",
  "Традиция",
  "Йога",
];

const CATEGORY_CLICKABLE_INDICES = [0];

const CATEGORY_WHEEL_LABELS: string[][] = Array.from(
  { length: SECTOR_COUNT },
  (_, i) => (i < CATEGORY_ITEMS.length ? splitLabelIntoLines(CATEGORY_ITEMS[i]) : [])
);

// ─── Колёса, открывающиеся по кнопкам хедера ───────────────────────────────
// Каждое — по аналогии с CATEGORY_WHEEL_LABELS: заполнены только первые
// N секторов, остальные (до 12) — пустые.

// "Самбандха" — 5 секторов
const SAMBANDHA_ITEMS: string[] = [
  "Ишвара",
  "Джива",
  "Пракрити",
  "Кала",
  "Карма",
];

const SAMBANDHA_WHEEL_LABELS: string[][] = Array.from(
  { length: SECTOR_COUNT },
  (_, i) => (i < SAMBANDHA_ITEMS.length ? splitLabelIntoLines(SAMBANDHA_ITEMS[i]) : [])
);

// "Абхидхея" — 9 секторов (девять видов бхакти)
const ABHIDHEYA_ITEMS: string[] = [
  "Шраванам",
  "Киртанам",
  "Смаранам",
  "Пада-севанам",
  "Арчанам",
  "Ванданам",
  "Дасьям",
  "Сакхьям",
  "Атма-ниведанам",
];

// Пада-севанам и Атма-ниведанам размещаются на трёх строках: часть до
// дефиса, отдельно сам дефис по центру, часть после дефиса.
function splitHyphenatedIntoThreeLines(label: string): string[] {
  const [prefix, suffix] = label.split("-");
  return [prefix, "-", suffix];
}

const ABHIDHEYA_WHEEL_LABELS: string[][] = Array.from(
  { length: SECTOR_COUNT },
  (_, i) => {
    if (i >= ABHIDHEYA_ITEMS.length) return [];
    const item = ABHIDHEYA_ITEMS[i];
    return item.includes("-")
      ? splitHyphenatedIntoThreeLines(item)
      : splitLabelIntoLines(item);
  }
);

// "Прайоджана" — 5 секторов (пять рас)
const PRAYOJANA_ITEMS: string[] = [
  "Шанта",
  "Дасья",
  "Сакхья",
  "Ватсалья",
  "Мадхурья",
];

const PRAYOJANA_WHEEL_LABELS: string[][] = Array.from(
  { length: SECTOR_COUNT },
  (_, i) => (i < PRAYOJANA_ITEMS.length ? splitLabelIntoLines(PRAYOJANA_ITEMS[i]) : [])
);

// ⚠️ ИЗМЕНЕНО: колесо "Предмет изучения" (кнопка "all-data" в футере).
// Заполнен только сектор №1 — "Узнать нужное слово" (перенесён сюда с
// колеса "Свойства сайта"); остальные 11 секторов пустые.
const GUIDE_WHEEL_LABELS: string[][] = Array.from(
  { length: SECTOR_COUNT },
  (_, i) => (i === 0 ? DICTIONARY_LABEL_LINES : [])
);

// Пока "Узнать нужное слово" без действия — ни один сектор не кликабелен.
const GUIDE_CLICKABLE_INDICES: number[] = [];

type GameType =
  | "alphabet-placeholder"
  | "picture-match"
  | "spell-word"
  | "syllables"
  | "sentence-game"
  | "audio-picture"
  | "audio-sentence";

function getGamesForLanguage(
  language: string
): { type: GameType; icon: string; label: string }[] {
  const alphabetIcon = FIRST_LETTER[language] ?? "A";
  const alphabetLabel = ALPHABET_LABEL[language] ?? "Alphabet";
  return [
    { type: "alphabet-placeholder", icon: alphabetIcon, label: alphabetLabel },
    { type: "picture-match", icon: "🖼️", label: "Картинки" },
    { type: "spell-word", icon: "✏️", label: "Слово" },
    { type: "syllables", icon: "🧱", label: "Слоги" },
    { type: "sentence-game", icon: "📝", label: "Предложение" },
    { type: "audio-picture", icon: "🔊", label: "Аудио-картинка" },
    { type: "audio-sentence", icon: "🎧", label: "Аудио-фраза" },
  ];
}

function getGameWheelLabels(games: { icon: string; label: string }[]): string[][] {
  return Array.from({ length: SECTOR_COUNT }, (_, i) =>
    i < games.length ? [games[i].icon, games[i].label] : []
  );
}

type ViewState =
  | "main"
  | "games"
  | "dictionary"
  | "sambandha"
  | "abhidheya"
  | "prayojana"
  | "guide"
  | "guide-info"
  | "home";

interface HomePageProps {
  // Ключ кнопки, выбранной на заставке SplashGate (см. комментарий
  // выше файла) — "all-data" | "your-page" | "site-page" | "languages".
  // Необязательный: при обычном заходе (не через заставку) не
  // передаётся, и HomePage ведёт себя как раньше.
  initialFooterKey?: string;
}

export default function IshvaraPage({ initialFooterKey }: HomePageProps = {}) {
  // Язык и система письменности берутся из общего контекста
  // (проксирует useLanguage() из "@/lib/i18n" — тот же язык, что видит
  // весь остальной сайт). Подписи кнопок хедера зависят от обоих
  // значений — см. useHeaderNavItems().
  const { language, script } = useLanguageScript();
  const headerItems = useHeaderNavItems(language, script);

  const [activeNav, setActiveNav] = useState<string>("sambandha");
  const [activeFooterNav, setActiveFooterNav] = useState<string>(
    footerNav[0].key
  );

  const [, setLocation] = useLocation();
  const games = useMemo(() => getGamesForLanguage(language), [language]);
  const gameWheelLabels = useMemo(() => getGameWheelLabels(games), [games]);

  // "main" — колесо тем (категорий), "games" — колесо с 7 играми,
  // "dictionary" — колесо "Свойства сайта" (сектор 12 — "Желаю
  // поддержать проект"), "sambandha"/"abhidheya"/"prayojana" — колёса
  // из трёх кнопок хедера, "guide" — колесо "Предмет изучения"
  // (сектор 1 — "Узнать нужное слово"), "home" — колесо "Домашняя
  // страница" (категории), "guide-info" — экран пояснения про
  // пожертвование, открывается 12-м сектором колеса "Свойства сайта".
  const [view, setView] = useState<ViewState>("main");

  const handleSelectCategory = (index: number) => {
    if (index === 0) {
      setView("games");
    }
  };

  const handleGameSectorClick = (index: number) => {
    const game = games[index];
    if (game) {
      setLocation(`/game?game=${game.type}`);
    }
  };

  // Клик по сектору колеса "Свойства сайта": только последний (12-й) —
  // "Желаю поддержать проект".
  const handleDictionarySectorClick = (index: number) => {
    if (index === SECTOR_COUNT - 1) {
      setView("guide-info");
    }
  };

  // Клик по кнопкам хедера: каждая из трёх открывает своё колесо.
  const handleHeaderClick = (key: string) => {
    setActiveNav(key);
    if (key === "sambandha") {
      setView("sambandha");
    } else if (key === "abhidheya") {
      setView("abhidheya");
    } else if (key === "prayojana") {
      setView("prayojana");
    }
  };

  // Ключи нижнего футера (см. footerNav в siteNav.ts) → ключи, которые
  // понимает логика ниже (те же, что использует заставка SplashScreen).
  const FOOTER_KEY_ALIASES: Record<string, string> = {
    stable: "all-data", // "Предмет изучения"
    home: "your-page", // "Домашняя страница"
    dynamic: "site-page", // "Свойства сайта"
  };

  const handleFooterClick = (rawKey: string) => {
    setActiveFooterNav(rawKey);
    const key = FOOTER_KEY_ALIASES[rawKey] ?? rawKey;
    if (key === "languages") {
      // Открытие/закрытие выпадашки теперь целиком внутри WheelFooter
      // (см. SiteHeaderFooter.tsx) — здесь ничего дополнительно делать
      // не нужно, onSelect используется только для подсветки activeKey.
      return;
    } else if (key === "site-page") {
      setView("dictionary");
    } else if (key === "all-data") {
      // ⚠️ ИСПРАВЛЕНО: раньше здесь не было действия, и под кнопкой
      // "Предмет изучения" оставалось колесо категорий. Теперь
      // открывается своё колесо "Предмет изучения".
      setView("guide");
    } else if (key === "your-page") {
      // Колесо "Домашняя страница" (категории: Игры, Природа, ...).
      setView("home");
    }
  };

  // Если HomePage смонтирована с initialFooterKey (то есть
  // пользователь только что выбрал одну из 4 кнопок на заставке
  // SplashGate) — выполняем ровно то же действие, что и обычный клик
  // по соответствующей кнопке футера. Срабатывает один раз при
  // монтировании.
  useEffect(() => {
    if (initialFooterKey) {
      handleFooterClick(initialFooterKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const footerItems = footerNav;

  // "← Назад" на любом колесе, кроме колеса тем ("main"), обычно
  // возвращает на колесо тем (домашний экран). Единственное
  // исключение — экран "guide-info": оттуда возврат ведёт на колесо
  // "Свойства сайта" ("dictionary"), откуда он был открыт.
  const handleBack = () => {
    if (view === "guide-info") {
      setView("dictionary");
    } else {
      setView("main");
    }
  };

  return (
    <WheelPageShell
      header={
        <WheelHeader items={headerItems} activeKey={activeNav} onSelect={handleHeaderClick} />
      }
      footer={
        <WheelFooter
          items={footerItems}
          activeKey={activeFooterNav}
          onSelect={handleFooterClick}
        />
      }
    >
      {view !== "main" && (
        <div className="flex-shrink-0 relative w-full flex justify-center items-center">
          <button
            onClick={handleBack}
            className="absolute left-6 px-4 py-2 rounded-full border-2 font-bold text-base transition bg-white"
            style={{ color: "#FFD700", borderColor: "#FFD700" }}
          >
            ← Назад
          </button>
        </div>
      )}

      <div className="flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden">
        {view === "main" && (
          <Wheel12
            labels={CATEGORY_WHEEL_LABELS}
            centerLabel="Игры"
            activeIndex={0}
            clickableIndices={CATEGORY_CLICKABLE_INDICES}
            onSectorClick={handleSelectCategory}
          />
        )}

        {view === "games" && (
          <Wheel12
            labels={gameWheelLabels}
            centerLabel="Игры"
            onSectorClick={handleGameSectorClick}
          />
        )}

        {view === "dictionary" && (
          <Wheel12
            labels={DICTIONARY_LABELS}
            centerLabel="Свойства сайта"
            clickableIndices={DICTIONARY_CLICKABLE_INDICES}
            onSectorClick={handleDictionarySectorClick}
          />
        )}

        {view === "sambandha" && (
          <Wheel12 labels={SAMBANDHA_WHEEL_LABELS} centerLabel="Самбандха" />
        )}

        {view === "abhidheya" && (
          <Wheel12 labels={ABHIDHEYA_WHEEL_LABELS} centerLabel="Абхидхея" />
        )}

        {view === "prayojana" && (
          <Wheel12 labels={PRAYOJANA_WHEEL_LABELS} centerLabel="Прайоджана" />
        )}

        {view === "guide" && (
          <Wheel12
            labels={GUIDE_WHEEL_LABELS}
            centerLabel="Предмет изучения"
            clickableIndices={GUIDE_CLICKABLE_INDICES}
          />
        )}

        {view === "home" && (
          <Wheel12
            labels={CATEGORY_WHEEL_LABELS}
            centerLabel="Домашняя страница"
            activeIndex={0}
            clickableIndices={CATEGORY_CLICKABLE_INDICES}
            onSectorClick={handleSelectCategory}
          />
        )}

        {view === "guide-info" && (
          <div className="flex flex-col items-center justify-center gap-6 max-w-lg text-center px-4">
            <p className="text-lg" style={{ color: "#FFD700" }}>
              Примите благодарность за поддержку служения сайта
            </p>
            <button
              onClick={() => setLocation("/payments")}
              className="px-6 py-3 rounded-full border-2 font-bold text-base transition bg-white"
              style={{ color: "#FFD700", borderColor: "#FFD700" }}
            >
              Перейти к оплате
            </button>
          </div>
        )}
      </div>
    </WheelPageShell>
  );
}