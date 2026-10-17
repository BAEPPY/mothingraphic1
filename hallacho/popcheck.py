# Flags single-frame pops: frame-difference spikes 3x their neighbours.
import subprocess, sys
import numpy as np
w, h = 240, 135
raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', sys.argv[1], '-vf', f'scale={w}:{h},format=gray', '-f', 'rawvideo', '-'], capture_output=True).stdout
f = np.frombuffer(raw, np.uint8).reshape(-1, h, w).astype(np.float32)
d = np.abs(np.diff(f, axis=0)).mean(axis=(1, 2))
print('frames', len(f), 'max diff', d.max().round(2))
for i in range(1, len(d) - 1):
    n = max(d[i - 1], d[i + 1], 0.05)
    if d[i] > 3 * n and d[i] > 0.3:
        print(f'pop at frame {i + 1} ({(i + 1) / 60:.2f}s): {d[i]:.2f} vs neighbours {d[i-1]:.2f}, {d[i+1]:.2f}')
