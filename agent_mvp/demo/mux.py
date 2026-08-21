"""Mux Playwright webm + edge-tts mp3 into a 3–5 minute MP4."""
from pathlib import Path
import subprocess
import json
import sys

import imageio_ffmpeg

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "out"
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()


def probe_duration(path: Path) -> float:
    ffprobe = FFMPEG.replace("ffmpeg", "ffprobe")
    cmd = [
        FFMPEG,
        "-i",
        str(path),
        "-f",
        "null",
        "-",
    ]
    # ffmpeg prints duration on stderr
    p = subprocess.run(cmd, capture_output=True, text=True)
    text = (p.stderr or "") + (p.stdout or "")
    # Duration: 00:04:12.33
    import re

    m = re.search(r"Duration: (\d+):(\d+):(\d+\.\d+)", text)
    if not m:
        raise SystemExit(f"Could not read duration of {path}\n{text[-800:]}")
    h, mn, s = int(m.group(1)), int(m.group(2)), float(m.group(3))
    return h * 3600 + mn * 60 + s


def main():
    audio = OUT / "narration.mp3"
    videos = sorted(OUT.glob("*.webm"), key=lambda p: p.stat().st_mtime, reverse=True)
    if not audio.exists():
        raise SystemExit("missing narration.mp3")
    if not videos:
        raise SystemExit("missing playwright webm")
    video = videos[0]
    dest = OUT / "research-scout-demo.mp4"

    vd = probe_duration(video)
    ad = probe_duration(audio)
    print(f"video {vd:.1f}s  audio {ad:.1f}s  ffmpeg {FFMPEG}")

    # Loop or pad video to audio length; keep audio as the clock (3–5 min target)
    filter_complex = (
        f"[0:v]tpad=stop_mode=clone:stop_duration={max(0, ad - vd):.3f}[v]"
        if ad > vd
        else "[0:v]setpts=PTS-STARTPTS[v]"
    )
    cmd = [
        FFMPEG,
        "-y",
        "-i",
        str(video),
        "-i",
        str(audio),
        "-filter_complex",
        filter_complex,
        "-map",
        "[v]",
        "-map",
        "1:a",
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-shortest",
        "-movflags",
        "+faststart",
        str(dest),
    ]
    print(" ".join(cmd))
    subprocess.check_call(cmd)
    print("WROTE", dest, dest.stat().st_size)


if __name__ == "__main__":
    main()
