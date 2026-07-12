from PIL import Image

def make_white_transparent(img_path):
    img = Image.open(img_path).convert("RGBA")
    datas = img.getdata()
    
    new_data = []
    # Loop through pixels
    for item in datas:
        # Check if the pixel is almost white
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            # Change white to transparent
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(img_path, "PNG")
    print("Background removed")

if __name__ == "__main__":
    make_white_transparent("public/logo.png")
