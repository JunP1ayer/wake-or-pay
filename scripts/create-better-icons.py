#!/usr/bin/env python3
"""
Create better PWA icons with a simple alarm clock design using PIL
"""

try:
    from PIL import Image, ImageDraw, ImageFont
    import os
    
    icons_dir = "/home/junp1ayer/wake-or-pay/public/icons"
    os.makedirs(icons_dir, exist_ok=True)
    
    def create_alarm_icon(size):
        # Create a new RGBA image with transparent background
        img = Image.new('RGBA', (size, size), (37, 99, 235, 255))  # Primary blue background
        draw = ImageDraw.Draw(img)
        
        # Draw white circle for clock face
        margin = size // 8
        clock_size = size - 2 * margin
        draw.ellipse([margin, margin, margin + clock_size, margin + clock_size], 
                    fill=(255, 255, 255, 255), outline=(30, 64, 175, 255), width=max(1, size//50))
        
        # Draw clock hands
        center = size // 2
        hand_length = clock_size // 3
        
        # Hour hand (pointing to 7)
        hour_x = center - hand_length // 2
        hour_y = center + hand_length // 2
        draw.line([center, center, hour_x, hour_y], fill=(30, 64, 175, 255), width=max(2, size//25))
        
        # Minute hand (pointing to 12)
        draw.line([center, center, center, center - hand_length], fill=(30, 64, 175, 255), width=max(2, size//30))
        
        # Center dot
        dot_size = max(2, size // 25)
        draw.ellipse([center - dot_size, center - dot_size, center + dot_size, center + dot_size], 
                    fill=(30, 64, 175, 255))
        
        # Add dollar sign if icon is large enough
        if size >= 128:
            dollar_size = size // 6
            try:
                # Try to use a font, fallback to default if not available
                font = ImageFont.load_default()
                dollar_x = center + clock_size // 3
                dollar_y = center + clock_size // 4
                draw.text((dollar_x, dollar_y), "$", fill=(255, 255, 255, 255), font=font)
            except:
                # Fallback: draw simple dollar shape
                draw.line([dollar_x, dollar_y - dollar_size//2, dollar_x, dollar_y + dollar_size//2], 
                         fill=(255, 255, 255, 255), width=max(1, size//60))
        
        return img
    
    # Icon sizes needed for PWA
    sizes = [72, 96, 128, 144, 152, 192, 384, 512]
    
    for size in sizes:
        icon = create_alarm_icon(size)
        filename = f"icon-{size}x{size}.png"
        filepath = os.path.join(icons_dir, filename)
        icon.save(filepath, "PNG")
        print(f"Created enhanced {filename}")
    
    print("Enhanced PWA icons created successfully!")
    
except ImportError:
    print("PIL (Pillow) not available. Using simple fallback icons.")
    # Fallback to previous method if PIL is not available