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
«бум», которым кончалась каждая серия. Звук: two-pass loudnorm до −14 LUFS.

  python3 scripts/make-film.py            # → deliverables/papa-vakhta-film-vse-chasti.mp4
"""
import json
import os
import subprocess
import sys

FPS = 30
D = 'deliverables/'
# (файл, первый кадр, кадр после последнего) — кадры исходного видео серии
PARTS = [
    ('papa-vakhta-s-ozvuchkoy.mp4', 0, 2191),      # 1: вступление … «Кто пишет, парень?»
    ('papa-vakhta-2-s-ozvuchkoy.mp4', 409, 1873),  # 2: «Утром ты садишься напротив…» … «И свет телефона.»
    ('papa-vakhta-3-s-ozvuchkoy.mp4', 437, 1806),  # 3: «Ты жмёшь „видеовызов“…» … «стоял за дверью?»
    ('papa-vakhta-4-s-ozvuchkoy.mp4', 480, 1561),  # 4: «Три часа ночи…» … «Ты чего не спишь, парень?»
    ('papa-vakhta-5-s-ozvuchkoy.mp4', 539, 2397),  # 5: «Ты не оборачиваешься…» … «В папином.»
    ('papa-vakhta-6-s-ozvuchkoy.mp4', 455, 2527),  # 6: «Ты натягиваешь куртку…» … «не успеваешь даже встать.»
    ('papa-vakhta-7-s-ozvuchkoy.mp4', 469, None),  # 7: «В последнюю секунду…» … «КОНЕЦ»
]
HOLD = 0.7        # пауза между частями: стоп-кадр уходит в чёрное
FADE_OUT = 0.45   # из них — затемнение
FADE_IN = 0.2     # новая часть проявляется из чёрного
BOOM_GAIN = 0.4   # «бум» на стыке (в сериях был ~0.5 от файла)
OUT_RAW = 'out/papa-vakhta-film.mkv'
OUT = D + 'papa-vakhta-film-vse-chasti.mp4'


def frames(path):
    r = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-count_packets', '-show_entries',
                        'stream=nb_read_packets', '-of', 'csv=p=0', path], capture_output=True, text=True, check=True)
    return int(r.stdout.strip().split(',')[0])


def main():
    parts = [(D + f, a, b if b is not None else frames(D + f)) for f, a, b in PARTS]
    for p, _, _ in parts:
        if not os.path.exists(p):
            sys.exit(f'нет файла {p}')
    n = len(parts)
    fl, seams, t = [], [], 0.0
    for i, (_, a, b) in enumerate(parts):
        dur = (b - a) / FPS
        v = f'[{i}:v]trim=start_frame={a}:end_frame={b},setpts=PTS-STARTPTS,setsar=1'
        au = (f'[{i}:a]atrim=start={a / FPS:.6f}:end={b / FPS:.6f},asetpts=PTS-STARTPTS,'
              f'aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo')
        if i > 0:
            v += f',fade=t=in:st=0:d={FADE_IN}'
            au += ',afade=t=in:st=0:d=0.04'
        if i < n - 1:
            v += f',tpad=stop_mode=clone:stop_duration={HOLD},fade=t=out:st={dur:.4f}:d={FADE_OUT}'
            au += f',afade=t=out:st={dur - 0.1:.4f}:d=0.1,apad=pad_dur={HOLD}'
            seams.append(t + dur)
            t += dur + HOLD
        else:
            t += dur
        fl.append(v + f',format=yuv420p[v{i}]')
        fl.append(au + f'[a{i}]')
    fl.append(''.join(f'[v{i}][a{i}]' for i in range(n)) + f'concat=n={n}:v=1:a=1[v][main]')
    # chapter stinger: the same boom that ended every episode, faded out early so it doesn't sit on the next line
    fl.append(f'[{n}:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,volume={BOOM_GAIN},'
              f'afade=t=out:st=0.5:d=0.4,atrim=end=0.9,asplit={len(seams)}' + ''.join(f'[b{k}]' for k in range(len(seams))))
    for k, s in enumerate(seams):
        ms = round(s * 1000)
        fl.append(f'[b{k}]adelay={ms}|{ms}[bd{k}]')
    fl.append('[main]' + ''.join(f'[bd{k}]' for k in range(len(seams))) +
              f'amix=inputs={len(seams) + 1}:normalize=0:duration=first[a]')
    cmd = ['ffmpeg', '-v', 'error', '-y']
    for p, _, _ in parts:
        cmd += ['-i', p]
    cmd += ['-i', 'public/sfx/boom.wav', '-filter_complex', ';'.join(fl), '-map', '[v]', '-map', '[a]',
            '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', str(FPS),
            '-c:a', 'pcm_s24le', OUT_RAW]
    print(f'склейка: {n} частей, {t:.2f} с, стыки на ' + ', '.join(f'{s:.2f}' for s in seams))
    subprocess.run(cmd, check=True)

    # two-pass loudnorm (−14 LUFS, TP −1.5)
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', OUT_RAW, '-vn', '-af',
                        'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'],
                       capture_output=True, text=True, check=True)
    m = json.loads(r.stderr[r.stderr.rindex('{'):r.stderr.rindex('}') + 1])
    af = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
          f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', OUT_RAW, '-c:v', 'copy', '-af', af, '-ar', '48000',
                    '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', OUT], check=True)
    print('готово:', OUT)


if __name__ == '__main__':
    main()
