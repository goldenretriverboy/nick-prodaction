import type {
  CreateLeadResponseDto,
  EarningsTotalResponseDto,
  TariffDto,
  WorkDetailsResponseDto,
  WorkItemDto,
} from "@/shared/api/types";
import videoCover1 from "@/assets/IMG_0061.PNG";
import videoCover2 from "@/assets/IMG_0062.PNG";
import videoCover3 from "@/assets/IMG_0626.PNG";
import videoCover4 from "@/assets/IMG_0064.PNG";
import videoCover5 from "@/assets/IMG_0065.PNG";
import videoCover6 from "@/assets/IMG_0066.PNG";

export const mockEarningsTotal: EarningsTotalResponseDto = {
  total_usd: 1_842_000,
  reports_count: 438,
  updated_at: "2026-04-16T00:00:00.000Z",
};

export const mockWorks: WorkItemDto[] = [
  {
    id: "work-1",
    title: "Видео для личного блога #1",
    summary: "Контент для личного блога",
    result: "45 000 просмотров\n2 500 лайков\n2 000 репостов",
    link: "https://youtube.com/shorts/IrAGcc_SXjA?feature=share",
    preview_image: videoCover1,
    customer: "Личный блог",
  },
  {
    id: "work-2",
    title: "Видео для личного блога #2",
    summary: "Контент для личного блога",
    result: "После публикации найдено 3 заказа на подобное видео",
    link: "https://youtube.com/shorts/YaFTdYcAcLw?feature=share",
    preview_image: videoCover2,
    customer: "Личный блог",
  },
  {
    id: "work-3",
    title: "Видео для личного блога #3",
    summary: "Контент для личного блога",
    result: "5 млн просмотров\n80 000 лайков\n246 000 репостов",
    link: "https://youtube.com/shorts/uBSUvDz2oBI?si=9WG9FPzcygCr8g2r",
    preview_image: videoCover3,
    customer: "Личный блог",
  },
  {
    id: "work-4",
    title: "Видео для Bazis A #1",
    summary: "Рекламный контент для строительной компании",
    result: "45 обращений в строительную компанию\n1 продажа квартиры",
    link: "https://youtube.com/shorts/fYkjWpaV-iU?feature=share",
    preview_image: videoCover4,
    customer: "Bazis A",
  },
  {
    id: "work-5",
    title: "Видео для Bazis A #2",
    summary: "Рекламный контент для строительной компании",
    result: "25 обращений в строительную компанию",
    link: "https://youtube.com/shorts/JXl6auF88eE?feature=share",
    preview_image: videoCover5,
    customer: "Bazis A",
  },
  {
    id: "work-6",
    title: "Видео для Halyk Bank",
    summary: "Продуктовый презентационный ролик",
    result: "Успешная презентация продукта перед инвесторами банка",
    link: "https://youtube.com/shorts/Ih1-TV5PDeU?feature=share",
    preview_image: videoCover6,
    customer: "Halyk Bank",
  },
];

export const mockTariffs: TariffDto[] = [
  {
    id: "start",
    title: "БАЗОВЫЙ",
    audience: "",
    includes: [
      "РЕЖИССУРА/НАСМОТРЕННОСТЬ",
      "СОЗДАНИЕ ИИ-КОНТЕНТА",
      "БАЗА ПО МОНТАЖУ ВИДЕО",
      "ПЕРВЫЕ ШАГИ В ЗАРАБОТКЕ",
    ],
    format: "",
    price: "БЕСПЛАТНО",
  },
  {
    id: "pro",
    title: "ИНДИВИДУАЛЬНЫЙ",
    audience: "",
    includes: [
      "ОБРАТНАЯ СВЯЗЬ ЛИЧНО ОТ НИКИТЫ",
      "КАК НАХОДИТЬ И ЗАКРЫВАТЬ КЛИЕНТОВ",
      "РАЗВИТИЕ ЛИЧНОГО БРЕНДА",
      "КАК ДЕЛАТЬ ВИРУСНЫЕ ИДЕИ",
      "РАБОТА С ТОПОВЫМИ AI-ИНСТРУМЕНТАМИ",
      "ПРИОРИТЕТ В ПЛАТНЫХ ЗАКАЗАХ",
    ],
    format: "",
    price: "250,000 ₸",
    recommended: true,
  },
  {
    id: "team",
    title: "Team",
    audience: "Для командного запуска AI-практик",
    includes: [
      "Custom программа",
      "Синхронные воркшопы",
      "Шаблоны под ваш процесс",
    ],
    format: "По запросу",
    price: "Индивидуально",
  },
];

export const mockCreateLeadResponse: CreateLeadResponseDto = {
  id: "local-mock-lead",
  status: "accepted",
};

export const mockWorkDetailsById: Record<string, WorkDetailsResponseDto> =
  Object.fromEntries(
    mockWorks.map((work) => [
      work.id,
      {
        ...work,
        challenge: `Задача проекта: ${work.summary}.`,
        solution:
          "Решение: запуск MVP с фокусом на mobile-first UX, быстрый фидбек и итеративные улучшения.",
        outcome: `Результат: ${work.result}.`,
        tech_stack: ["React", "TypeScript", "Vite", "TanStack Query"],
        published_at: "2026-04-17",
      },
    ]),
  );
