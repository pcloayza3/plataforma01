#!/usr/bin/env python3
"""
Genera los iconos oficiales de UnLethe a partir del diseño gráfico provisto por el usuario,
convirtiendo el fondo negro exterior en 100% transparente con bordes suaves antialiased.
"""
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
from collections import deque
import os

def create_transparent_icon(source_path):
    img = Image.open(source_path).convert("RGB")
    arr = np.array(img)
    H, W = arr.shape[:2]
    max_c = np.max(arr, axis=2)

    # Detección precisa de fondo exterior mediante flood-fill desde los bordes
    visited = np.zeros((H, W), dtype=bool)
    border_seeds = [
        (0, 0), (0, W-1), (H-1, 0), (H-1, W-1),
        (0, W//2), (H-1, W//2), (H//2, 0), (H//2, W-1)
    ]
    q = deque(border_seeds)
    for y, x in border_seeds:
        visited[y, x] = True

    while q:
        cy, cx = q.popleft()
        for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < H and 0 <= nx < W and not visited[ny, nx]:
                if max_c[ny, nx] < 58:  # Umbral de fondo negro/gris oscuro
                    visited[ny, nx] = True
                    q.append((ny, nx))

    # Máscara binaria del post-it
    fg_mask = (~visited).astype(np.uint8) * 255
    mask_img = Image.fromarray(fg_mask, "L")
    
    # Suavizado de bordes sub-pixel (Antialiasing)
    smooth_mask = mask_img.filter(ImageFilter.GaussianBlur(radius=1.2))

    # Imagen RGBA con fondo transparente
    out_img = img.copy()
    out_img.putalpha(smooth_mask)
    return out_img

def build_all_icons():
    source_img_path = "/Users/paul/.gemini/antigravity/brain/9ad17732-fb93-4b5c-aee0-9f3b1c89a485/.user_uploaded/media_1795225909840_2c8ded96.jpg"
    base_dir = os.path.abspath(os.path.dirname(__file__))

    full_transparent = create_transparent_icon(source_img_path)

    # 1. Guardar icon.png principal (512x512) transparente
    icon512 = full_transparent.resize((512, 512), Image.Resampling.LANCZOS)
    icon512_path = os.path.join(base_dir, "icon.png")
    icon512.save(icon512_path, "PNG")
    print(f"✓ Guardado icon.png transparente: {icon512_path}")

    # 2. Copiar a assets de Android e iOS
    targets = [
        os.path.join(base_dir, "android/app/src/main/assets/icon.png"),
        os.path.join(base_dir, "android/app/src/main/assets/www/icon.png"),
        os.path.join(base_dir, "ios/PostyLocal/www/icon.png")
    ]
    for target in targets:
        os.makedirs(os.path.dirname(target), exist_ok=True)
        icon512.save(target, "PNG")
        print(f"✓ Copiado asset: {target}")

    # 3. Android mipmaps
    android_res = os.path.join(base_dir, "android/app/src/main/res")
    sizes = {
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192
    }

    for folder, s in sizes.items():
        folder_path = os.path.join(android_res, folder)
        os.makedirs(folder_path, exist_ok=True)
        
        # Launcher estándar
        scaled = full_transparent.resize((s, s), Image.Resampling.LANCZOS)
        scaled.save(os.path.join(folder_path, "ic_launcher.png"), "PNG")
        
        # Launcher circular
        mask = Image.new("L", (s, s), 0)
        draw_mask = ImageDraw.Draw(mask)
        draw_mask.ellipse((0, 0, s - 1, s - 1), fill=255)
        
        round_img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
        round_img.paste(scaled, (0, 0), mask=mask)
        round_img.save(os.path.join(folder_path, "ic_launcher_round.png"), "PNG")
        print(f"✓ Generado Android {folder}: {s}x{s} transparente")

if __name__ == "__main__":
    build_all_icons()
