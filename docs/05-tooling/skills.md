# Skills в проекте

Каталог локально установленных skills для этого репозитория.

## Где лежат skills

- Проектные: `.agents/skills/`.
- Дополнительные симлинки для других агентов (создаются CLI автоматически): `.junie/skills/`.

## Установленные skills

| Skill | Путь | Для чего использовать |
| --- | --- | --- |
| `vercel-react-best-practices` | `.agents/skills/vercel-react-best-practices/SKILL.md` | React performance, data-fetching, bundle optimization |
| `feature-sliced-design` | `.agents/skills/feature-sliced-design/SKILL.md` | Архитектура FSD, границы слоев, public API |
| `ui-design-system` | `.agents/skills/ui-design-system/SKILL.md` | Дизайн-система, токены, консистентность UI |
| `tailwind-css-patterns` | `.agents/skills/tailwind-css-patterns/SKILL.md` | Tailwind шаблоны, responsive layout, utility-практики |
| `owasp-security-check` | `.agents/skills/owasp-security-check/SKILL.md` | Security review по OWASP Top 10 |
| `testing-expert` | `.agents/skills/testing-expert/SKILL.md` | Стратегия тестирования, Vitest/Playwright/Testing Library |

## Команды для обновления

```bash
npx skills check
npx skills update
```

## Примечания

- Установка выполнялась в локальный проект (без `-g`).
- Некоторые найденные источники из `skills.sh` не содержат ожидаемого skill-id; в таких случаях использован ближайший рабочий аналог.
