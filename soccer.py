import math
cx = 471
cy = 203
R = 150

def pentagon(x, y, r, rotation=0):
    pts = []
    for i in range(5):
        angle = math.radians(rotation - 90 + i * 72)
        pts.append(f"{round(x + r * math.cos(angle), 1)},{round(y + r * math.sin(angle), 1)}")
    return ' '.join(pts)

print(f'<polygon points="{pentagon(cx, cy, R)}" fill="#111111" opacity="0.1"/>')
for i in range(5):
    angle = math.radians(-90 + i * 72)
    px = cx + 2.8 * R * math.cos(angle)
    py = cy + 2.8 * R * math.sin(angle)
    print(f'<polygon points="{pentagon(px, py, R, 36)}" fill="#111111" opacity="0.1"/>')
