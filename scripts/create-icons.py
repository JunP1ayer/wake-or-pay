#!/usr/bin/env python3
"""
Simple script to create PNG icons from base64 encoded 1x1 pixel images
for PWA functionality. These are minimal placeholder icons.
"""

import base64
import os

# Create icons directory if it doesn't exist
icons_dir = "/home/junp1ayer/wake-or-pay/public/icons"
os.makedirs(icons_dir, exist_ok=True)

# Base64 encoded 1x1 blue pixel PNG
blue_pixel_png = b'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9hbNdPwAAAABJRU5ErkJggg=='

# Icon sizes needed
sizes = [72, 96, 128, 144, 152, 192, 384, 512]

for size in sizes:
    filename = f"icon-{size}x{size}.png"
    filepath = os.path.join(icons_dir, filename)
    
    # Write the base64 decoded PNG data
    with open(filepath, 'wb') as f:
        f.write(base64.b64decode(blue_pixel_png))
    
    print(f"Created {filename}")

print("All PWA icons created successfully!")