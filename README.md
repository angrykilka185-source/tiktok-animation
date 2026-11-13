# «Папа вернулся с вахты» — TikTok-анимация (серия)

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

Один рассказчик на всё видео (как в референсе), модель `eleven_v3`. Текст, голос и время каждой реплики: `src/voice-lines.json`.
Разметка для субтитров: `*слово*` — красный, `«цитата»` — жёлтый; `whisper` — цитата шёпотом.

```bash
npm run voice -- --dry        # проверить тексты и тайминг без запросов (ничего не тратит)
npm run voice                 # сгенерировать новые/изменённые реплики
npm run voice -- --voice <id> # попробовать другой голос
npm run render
ffmpeg -i out/papa-vakhta.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.5 -c:a aac -b:a 192k out/papa-vakhta-final.mp4
```

Ключу ElevenLabs нужны права **Text to Speech**, а для выбора русского голоса из библиотеки ещё **Voices: Read/Write**.
Пока озвучки нет, субтитры идут по расчётному времени, поэтому видео можно смотреть как превью.

## Своя озвучка из ElevenLabs (готовый mp3)

Озвучку можно сделать вручную на сайте ElevenLabs по тексту из `src/voice-lines.json` и подставить в видео:

```bash
python3 scripts/fit-voiceover.py assets/voiceover.mp3   # режет на фразы, ставит каждую на свой кадр
npm run render
ffmpeg -i out/papa-vakhta.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.5 -c:a aac -b:a 192k out/papa-vakhta-final.mp4
```

Скрипт находит фразы по паузам, сопоставляет их с репликами, укорачивает длинные паузы,
слегка ускоряет весь голос (по умолчанию в 1.12 раза, `BASE_TEMPO=1.0` — без ускорения),
выравнивает громкость и пишет время каждого слова для субтитров.

## Часть 2 «Контрольный вопрос»

Код: `src/p2/` (тайминг, текст озвучки, сцены, звуки). Начало — те же кадры и тот же голос, что в первой части.

```bash
python3 scripts/fit-voiceover.py assets/voiceover-2.mp3 --part 2   # озвучка без первого абзаца
npx remotion render PapaVakhta2 out/papa-vakhta-2.mp4
```

## Часть 3 «Видеозвонок»

Код: `src/p3/`. Начало — как в частях 1–2 (тот же голос), затем пересказ части 2.

```bash
python3 scripts/fit-voiceover.py assets/voiceover-3.mp3 --part 3
npx remotion render PapaVakhta3 out/papa-vakhta-3.mp4
```

Во всех частях картинка подстраивается под голос (`src/*/edit.json`): кадр заканчивается, как только закончилась его фраза.

## Новый сериал «Голосовые из завтра», серия 1 «Не садись в лифт»

Код: `src/g1/` (тайминг, текст озвучки, сцены, звуки). Главный герой — новый персонаж `kind="teen"`
(чёрные торчащие волосы, круглые очки, красное худи, чёрный рюкзак), не сын из «Папы». Сверху вместо «Он или не он?» счётчик
«СБЫЛОСЬ: n/7» с галочками, таблички «СБЫЛОСЬ №n». Реплики с `"phone": true` в `voice-lines.json`
скрипт обрабатывает как голосовое из телефона (узкая полоса частот, лёгкий «цифровой» хруст),
а волна в пузыре голосового двигается по громкости этих реплик (`src/g1/env.json`).
Счётчик на 2 предсказания: лифт — ✓ (сбылось), мяч — «?» (под вопросом, поле `pending` в `src/g1/timeline.ts`).

Время каждого слова для субтитров меряется по самим кусочкам озвучки (`scripts/word_timing.py`):
фраза делится на отрезки речи по паузам, слова раскладываются по отрезкам с учётом того, как они
произносятся (числа читаются словами: «23:41» = «двадцать три сорок одна»). Пересчитать без повторной подгонки:
`python3 scripts/word_timing.py --part g1`.

```bash
python3 scripts/fit-voiceover.py assets/golosovye-1.mp3 --part g1
npx remotion render Golosovye1 out/golosovye-1.mp4
ffmpeg -i out/golosovye-1.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:a aac -b:a 192k deliverables/golosovye-1-s-ozvuchkoy.mp4
```

## «Голосовые из завтра», серия 2 «Мяч»

Код: `src/g2/` (детали телефона, спортзал и видения берутся из `src/g1/scenes.tsx`). Начало — короткий пересказ
серии 1 (замороженные кадры серии 1 в стиле VHS). Счётчик на 3: лифт ✓ (сразу), мяч «?» → ✓ когда падает лампа,
новое предсказание «?». Реплика с `"fx": "eerie"` (шёпот «Это не ты») делается ниже и с эхом, `"holdAfter"` даёт паузу после неё.

```bash
python3 scripts/fit-voiceover.py assets/golosovye-2.mp3 --part g2
npx remotion render Golosovye2 out/golosovye-2.mp4
ffmpeg -i out/golosovye-2.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:a aac -b:a 192k deliverables/golosovye-2-s-ozvuchkoy.mp4
```

## «Папа вернулся с вахты», часть 4 «Спальня»

Код: `src/p4/`. Начало — как в частях 1–3 (тот же голос из части 1), затем пересказ части 3 (кадры части 3 в стиле VHS).
Счётчик «ОН ИЛИ НЕ ОН?» на 15 клеток, 12 уже заполнены; признаки 13–15. Табличке можно задать высоту (`y` в `Sign`),
чтобы она не закрывала главное в кадре.

```bash
python3 scripts/fit-voiceover.py assets/voiceover-4.mp3 --part 4
npx remotion render PapaVakhta4 out/papa-vakhta-4.mp4
ffmpeg -i out/papa-vakhta-4.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:a aac -b:a 192k deliverables/papa-vakhta-4-s-ozvuchkoy.mp4
```

## «Папа вернулся с вахты», часть 5 «Лунатик» (≈1,5 минуты)

Код: `src/p5/` (переиспользует силуэт, тёмную спальню и коридор из `src/p4/`, комнату героя из `src/g1/`,
прихожую из `src/g2/`). Длина видео задаётся длиной текста: кадр кончается вместе со своей фразой,
поэтому для 1,5 минуты текст длиннее (≈ 970 букв без начала). Счётчик на 19 клеток (15 заполнены).

```bash
python3 scripts/fit-voiceover.py assets/voiceover-5.mp3 --part 5
npx remotion render PapaVakhta5 out/papa-vakhta-5.mp4
ffmpeg -i out/papa-vakhta-5.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:a aac -b:a 192k deliverables/papa-vakhta-5-s-ozvuchkoy.mp4
```

## «Папа вернулся с вахты», часть 6 «Гараж» (≈1,5 минуты)

Код: `src/p6/` (силуэт и спальня — из `src/p4/`, двор с гаражами и пересказ — из `src/p5/`). Новое: машины во дворе,
гараж №17 снаружи (ворота поднимаются), вид через щель под воротами, гараж изнутри, папин телефон с перепиской.
Счётчик на 21 клетку (19 заполнены).

```bash
python3 scripts/fit-voiceover.py assets/voiceover-6.mp3 --part 6
npx remotion render PapaVakhta6 out/papa-vakhta-6.mp4
ffmpeg -i out/papa-vakhta-6.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:a aac -b:a 192k deliverables/papa-vakhta-6-s-ozvuchkoy.mp4
```
