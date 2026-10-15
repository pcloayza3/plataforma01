#!/usr/bin/env python3
"""
Genera el icono oficial de Nota Feliz (PostyLocal):
Un post-it amarillo con esquina doblada y una carita feliz dibujada a mano.
"""
from PIL import Image, ImageDraw
import os

def create_happy_postit_icon(size=512):
    # Imagen RGBA transparente
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    margin = int(size * 0.08)
    corner_fold = int(size * 0.18)
    
    # Sombra del post-it
    shadow_offset = int(size * 0.04)
    shadow_coords = [
        (margin + shadow_offset, margin + shadow_offset),
        (size - margin + shadow_offset, margin + shadow_offset),
        (size - margin + shadow_offset, size - margin - corner_fold + shadow_offset),
        (size - margin - corner_fold + shadow_offset, size - margin + shadow_offset),
        (margin + shadow_offset, size - margin + shadow_offset)
    ]
    draw.polygon(shadow_coords, fill=(0, 0, 0, 45))

    # Cuerpo del post-it (Amarillo vibrante pastel)
    postit_fill = (255, 224, 71, 255) # #FFE047
    body_coords = [
        (margin, margin),
        (size - margin, margin),
        (size - margin, size - margin - corner_fold),
        (size - margin - corner_fold, size - margin),
        (margin, size - margin)
    ]
    draw.polygon(body_coords, fill=postit_fill)

    # Borde sutil del post-it
    draw.polygon(body_coords, outline=(234, 179, 8, 255), width=max(2, int(size * 0.01)))

    # Esquina doblada (solapa inferior derecha)
    fold_color = (250, 204, 21, 255) # Tono un poco más oscuro
    fold_coords = [
        (size - margin, size - margin - corner_fold),
        (size - margin - corner_fold, size - margin - corner_fold),
        (size - margin - corner_fold, size - margin)
    ]
    draw.polygon(fold_coords, fill=fold_color, outline=(202, 138, 4, 255), width=max(2, int(size * 0.008)))

    # Carita feliz dibujada en el centro del post-it
    # Color de tinta marrón oscuro / negro suave
    ink_color = (45, 30, 10, 255)
    line_w = max(4, int(size * 0.045))

    center_x = size // 2 - int(size * 0.02)
    center_y = size // 2 - int(size * 0.02)

    # Ojos felices (dos arcos sonrientes ^ ^)
    eye_radius = int(size * 0.07)
    eye_offset_x = int(size * 0.13)
    eye_y = center_y - int(size * 0.06)

    # Ojo izquierdo (arco sonriente hacia arriba)
    left_eye_box = [center_x - eye_offset_x - eye_radius, eye_y - eye_radius, center_x - eye_offset_x + eye_radius, eye_y + eye_radius]
    draw.arc(left_eye_box, start=190, end=350, fill=ink_color, width=line_w)

    # Ojo derecho (arco sonriente hacia arriba)
    right_eye_box = [center_x + eye_offset_x - eye_radius, eye_y - eye_radius, center_x + eye_offset_x + eye_radius, eye_y + eye_radius]
    draw.arc(right_eye_box, start=190, end=350, fill=ink_color, width=line_w)

    # Sonrisa grande y feliz
    mouth_radius_x = int(size * 0.22)
    mouth_radius_y = int(size * 0.16)
    mouth_y = center_y + int(size * 0.04)
    mouth_box = [center_x - mouth_radius_x, mouth_y - mouth_radius_y, center_x + mouth_radius_x, mouth_y + mouth_radius_y]
    draw.arc(mouth_box, start=10, end=170, fill=ink_color, width=line_w)

    # Pequeños hoyuelos en los extremos de la sonrisa
    dimple_size = int(size * 0.025)
    # hoyuelo izq
    dimple_l = [center_x - mouth_radius_x - dimple_size, mouth_y - dimple_size, center_x - mouth_radius_x + dimple_size, mouth_y + dimple_size]
    draw.arc(dimple_l, start=120, end=300, fill=ink_color, width=max(2, line_w - 2))
    # hoyuelo der
    dimple_r = [center_x + mouth_radius_x - dimple_size, mouth_y - dimple_size, center_x + mouth_radius_x + dimple_size, mouth_y + dimple_size]
    draw.arc(dimple_r, start=240, end=60, fill=ink_color, width=max(2, line_w - 2))

    # Mejillas sonrojadas rosadas suaves
    blush_color = (251, 113, 133, 90)
    blush_r = int(size * 0.055)
    draw.ellipse([center_x - eye_offset_x - blush_r - 8, eye_y + int(size * 0.08) - blush_r, center_x - eye_offset_x + blush_r - 8, eye_y + int(size * 0.08) + blush_r], fill=blush_color)
    draw.ellipse([center_x + eye_offset_x - blush_r + 8, eye_y + int(size * 0.08) - blush_r, center_x + eye_offset_x + blush_r + 8, eye_y + int(size * 0.08) + blush_r], fill=blush_color)

    return img

if __name__ == "__main__":
    base_dir = "/Users/paul/develop/platform01/apps/posty_local"
    icon512 = create_happy_postit_icon(512)
    icon512.save(os.path.join(base_dir, "icon.png"))
    print("Guardado icon.png (512x512)")

    # Android mipmaps
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
        scaled = icon512.resize((s, s), Image.Resampling.LANCZOS)
        scaled.save(os.path.join(folder_path, "ic_launcher.png"))
        scaled.save(os.path.join(folder_path, "ic_launcher_round.png"))
        print(f"Guardado {folder} ({s}x{s})")
