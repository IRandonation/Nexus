from PIL import Image, ImageDraw, ImageFont
import os

os.makedirs('src-tauri/icons', exist_ok=True)

# Create 512x512 main icon
img = Image.new('RGBA', (512, 512), color=(99, 102, 241, 255))
draw = ImageDraw.Draw(img)

# Draw circle background
draw.ellipse([20, 20, 492, 492], fill=(99, 102, 241, 255))

# Add text
try:
    font = ImageFont.truetype("arial.ttf", 200)
except:
    font = ImageFont.load_default()

# Get text size
bbox = draw.textbbox((0, 0), "N", font=font)
text_width = bbox[2] - bbox[0]
text_height = bbox[3] - bbox[1]

# Center text
x = (512 - text_width) // 2
y = (512 - text_height) // 2 - 20
draw.text((x, y), "N", fill=(255, 255, 255, 255), font=font)

# Save main icon
img.save('src-tauri/icons/icon.png')
print("Created icon.png")

# Create different sizes
sizes = [32, 128]
for size in sizes:
    img_resized = img.resize((size, size), Image.Resampling.LANCZOS)
    img_resized.save(f'src-tauri/icons/{size}x{size}.png')
    print(f"Created {size}x{size}.png")

# Create ICO file for Windows
img.save('src-tauri/icons/icon.ico', format='ICO', sizes=[(32, 32), (128, 128), (256, 256)])
print("Created icon.ico")

print("\nAll icons created successfully!")
