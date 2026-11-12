# «Папа вернулся с вахты» — TikTok-анимация

Формат «Он или не он?»: 6 признаков, 16 кадров, 90 секунд, 1080×1920, 30 fps.
Только звуковые эффекты, без музыки и озвучки. Всё нарисовано кодом (Remotion + SVG), звуки синтезируются скриптом. Готовых ассетов нет.

## Запуск

```bash
npm install
npm run sfx        # сгенерировать звуки в public/sfx (уже лежат в репозитории)
npm run studio     # превью с таймлайном в браузере
npm run render     # итоговый файл: out/papa-vakhta.mp4
```

Быстрый просмотр отдельных кадров: `node scripts/stills.mjs out/sheet.png 100 500 900`.

## Где что менять

| Что | Файл |
|---|---|
| Длительности кадров, тексты признаков, время на часах, субтитры | `src/timeline.ts` |
| Персонажи (папа, мама, сын, эмоции, позы) | `src/components/Person.tsx` |
| Фоны (прихожая, кухня), реквизит | `src/components/Set.tsx` |
| Счётчик «ОН ИЛИ НЕ ОН?», плашки, субтитры, бейджи, реплики | `src/components/Overlays.tsx` |
| Сцены 1–16 | `src/scenes/` |
| Расстановка звуков | `src/SFX.tsx` |
| Синтез звуков | `scripts/make-sfx.mjs` |

## Озвучка (ElevenLabs)

Текст реплик, голоса и время появления: `src/voice-lines.json`.

```bash
npm run voice      # нужен ключ ElevenLabs с правом Text to Speech (ELEVENLABS_API_KEY или прокси)
npm run render
# громкость под TikTok (-14 LUFS):
ffmpeg -i out/papa-vakhta.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.5 -c:a aac -b:a 192k out/papa-vakhta-final.mp4
```

Скрипт кеширует реплики и перегенерирует только изменённые; субтитры подсвечивают слова по таймкодам из ElevenLabs.
