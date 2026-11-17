#!/usr/bin/env python3
"""«Папа вернулся с вахты» — все 7 частей одним фильмом (длинное видео).

Берёт готовые серии из deliverables/ (то, что уже выложено) и склеивает их:
  * часть 1 — с самого начала (это и есть завязка фильма);
  * части 2–7 — без повторного вступления, пересказа «в прошлой части»,
    титула «ЧАСТЬ N» и строки «Вы выбрали: …» (начало — первый кадр новой
    сцены, где уже нет субтитра от «Вы выбрали»);
  * части 1–6 — без экрана выбора с отсчётом «три, два, один»
    (обрезка ровно на первом кадре финальной вспышки);
  * часть 7 — до конца, с финальной карточкой «КОНЕЦ».
Между частями — короткое затемнение (последний кадр уходит в чёрное) и тот же
«бум», которым кончалась каждая серия. Каждая часть начинается ровно с целой
секунды — тайм-коды глав для описания на YouTube печатаются и пишутся в
deliverables/papa-vakhta-film-glavy.txt. Звук: two-pass loudnorm до −14 LUFS.

  python3 scripts/make-film.py            # → deliverables/papa-vakhta-film-vse-chasti.mp4
"""
import json
import os
import subprocess
import sys

FPS = 30
D = 'deliverables/'
# (файл, первый кадр, кадр после последнего, глава) — кадры исходного видео серии
PARTS = [
    ('papa-vakhta-s-ozvuchkoy.mp4', 0, 2191, 'Он или не он?'),          # вступление … «Кто пишет, парень?»
    ('papa-vakhta-2-s-ozvuchkoy.mp4', 409, 1873, 'Контрольный вопрос'),  # «Утром ты садишься напротив…» … «И свет телефона.»
    ('papa-vakhta-3-s-ozvuchkoy.mp4', 437, 1806, 'Видеозвонок'),         # «Ты жмёшь „видеовызов“…» … «стоял за дверью?»
    ('papa-vakhta-4-s-ozvuchkoy.mp4', 480, 1561, 'Спальня'),             # «Три часа ночи…» … «Ты чего не спишь, парень?»
    ('papa-vakhta-5-s-ozvuchkoy.mp4', 539, 2397, 'Лунатик'),             # «Ты не оборачиваешься…» … «В папином.»
    ('papa-vakhta-6-s-ozvuchkoy.mp4', 455, 2527, 'Гараж'),               # «Ты натягиваешь куртку…» … «не успеваешь даже встать.»
    ('papa-vakhta-7-s-ozvuchkoy.mp4', 469, None, 'Финал'),               # «В последнюю секунду…» … «КОНЕЦ»
]
MIN_HOLD = 18     # пауза между частями, кадров (минимум): стоп-кадр уходит в чёрное;
                  # она дотягивается до целой секунды, чтобы каждая часть начиналась ровно на M:SS (главы YouTube)
FADE_OUT = 0.45   # затемнение
FADE_IN = 0.2     # новая часть проявляется из чёрного
BOOM_GAIN = 0.4   # «бум» на стыке (в сериях был ~0.5 от файла)
# лёгкий файл (≈50 МБ): плоская анимация хорошо жмётся, YouTube/TikTok всё равно перекодируют
X264 = ['-c:v', 'libx264', '-preset', 'slow', '-tune', 'animation', '-crf', '25', '-pix_fmt', 'yuv420p']
OUT_RAW = 'out/papa-vakhta-film.mkv'
OUT = D + 'papa-vakhta-film-vse-chasti.mp4'
OUT_CHAPTERS = D + 'papa-vakhta-film-glavy.txt'


def frames(path):
    r = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-count_packets', '-show_entries',
                        'stream=nb_read_packets', '-of', 'csv=p=0', path], capture_output=True, text=True, check=True)
    return int(r.stdout.strip().split(',')[0])


def main():
    parts = [(D + f, a, b if b is not None else frames(D + f), name) for f, a, b, name in PARTS]
    for p, *_ in parts:
        if not os.path.exists(p):
            sys.exit(f'нет файла {p}')
    n = len(parts)
    fl, seams, starts, t = [], [], [], 0  # t — в кадрах фильма
    for i, (_, a, b, _) in enumerate(parts):
        starts.append(t)
        dur = b - a
        v = f'[{i}:v]trim=start_frame={a}:end_frame={b},setpts=PTS-STARTPTS,setsar=1'
        au = (f'[{i}:a]atrim=start={a / FPS:.6f}:end={b / FPS:.6f},asetpts=PTS-STARTPTS,'
              f'aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo')
        if i > 0:
            v += f',fade=t=in:st=0:d={FADE_IN}'
            au += ',afade=t=in:st=0:d=0.04'
        if i < n - 1:
            end = t + dur
            hold = -(-(end + MIN_HOLD) // FPS) * FPS - end  # следующая часть — с целой секунды
            v += f',tpad=stop_mode=clone:stop_duration={hold / FPS:.4f},fade=t=out:st={dur / FPS:.4f}:d={FADE_OUT}'
            au += f',afade=t=out:st={dur / FPS - 0.1:.4f}:d=0.1,apad=pad_dur={hold / FPS:.4f}'
            seams.append((end, hold))
            t = end + hold
        else:
            t += dur
        fl.append(v + f',format=yuv420p[v{i}]')
        fl.append(au + f'[a{i}]')
    fl.append(''.join(f'[v{i}][a{i}]' for i in range(n)) + f'concat=n={n}:v=1:a=1[v][main]')
    # chapter stinger: the same boom that ended every episode; it rings through the black and fades as the next part starts
    fl.append(f'[{n}:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,volume={BOOM_GAIN},'
              f'asplit={len(seams)}' + ''.join(f'[b{k}]' for k in range(len(seams))))
    for k, (end, hold) in enumerate(seams):
        ms = round(end / FPS * 1000)
        ln = hold / FPS + 0.15
        fl.append(f'[b{k}]afade=t=out:st=0.5:d={ln - 0.5:.3f},atrim=end={ln:.3f},adelay={ms}|{ms}[bd{k}]')
    fl.append('[main]' + ''.join(f'[bd{k}]' for k in range(len(seams))) +
              f'amix=inputs={len(seams) + 1}:normalize=0:duration=first[a]')
    cmd = ['ffmpeg', '-v', 'error', '-y']
    for p, *_ in parts:
        cmd += ['-i', p]
    cmd += ['-i', 'public/sfx/boom.wav', '-filter_complex', ';'.join(fl), '-map', '[v]', '-map', '[a]',
            *X264, '-r', str(FPS), '-c:a', 'pcm_s24le', OUT_RAW]
    chapters = '\n'.join(f'{s // FPS // 60}:{s // FPS % 60:02d} Часть {i + 1} — {name}'
                         for i, (s, (*_, name)) in enumerate(zip(starts, parts)))
    print(f'склейка: {n} частей, {t / FPS:.2f} с; паузы ' + ', '.join(f'{h / FPS:.2f}' for _, h in seams))
    print(chapters)
    subprocess.run(cmd, check=True)

    # two-pass loudnorm (−14 LUFS, TP −1.5)
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', OUT_RAW, '-vn', '-af',
                        'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'],
                       capture_output=True, text=True, check=True)
    m = json.loads(r.stderr[r.stderr.rindex('{'):r.stderr.rindex('}') + 1])
    af = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
          f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', OUT_RAW, '-c:v', 'copy', '-af', af, '-ar', '48000',
                    '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', OUT], check=True)
    with open(OUT_CHAPTERS, 'w') as fh:
        fh.write(chapters + '\n')
    print('готово:', OUT, f'({os.path.getsize(OUT) / 1e6:.1f} МБ), главы — {OUT_CHAPTERS}')


if __name__ == '__main__':
    main()
