#!/usr/bin/env python3
"""
Genera los iconos oficiales de UnLethe a partir del diseño gráfico provisto por el usuario:
Un post-it amarillo con signo de exclamación rojo en 3D sobre fondo oscuro elegante.
"""
from PIL import Image, ImageDraw
import os

def generate_icons(source_image_path, base_dir):
    src = Image.open(source_image_path).convert("RGBA")
    
    # Guardar 512x512 icon.png principal
    icon512 = src.resize((512, 512), Image.Resampling.LANCZOS)
    icon512_path = os.path.join(base_dir, "icon.png")
    icon512.save(icon512_path, "PNG")
    print(f"✓ Guardado: {icon512_path}")

    # Copiar a assets y www
    targets = [
        os.path.join(base_dir, "android/app/src/main/assets/icon.png"),
        os.path.join(base_dir, "android/app/src/main/assets/www/icon.png"),
        os.path.join(base_dir, "ios/PostyLocal/www/icon.png")
    ]
    for target in targets:
        os.makedirs(os.path.dirname(target), exist_ok=True)
        icon512.save(target, "PNG")
        print(f"✓ Copiado: {target}")

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
        scaled = src.resize((s, s), Image.Resampling.LANCZOS)
        scaled.save(os.path.join(folder_path, "ic_launcher.png"), "PNG")
        
        # Icono circular recortado para lanzadores redondos
        mask = Image.new("L", (s, s), 0)
        draw_mask = ImageDraw.Draw(mask)
        draw_mask.ellipse((0, 0, s - 1, s - 1), fill=255)
        
        round_img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
        round_img.paste(scaled, (0, 0), mask=mask)
        round_img.save(os.path.join(folder_path, "ic_launcher_round.png"), "PNG")
        print(f"✓ Generado {folder}: {s}x{s} (cuadrado y circular)")

if __name__ == "__main__":
    base_dir = os.path.abspath(os.path.dirname(__file__))
    source_path = os.path.join(base_dir, "icon.png")
    generate_icons(source_path, base_dir)
