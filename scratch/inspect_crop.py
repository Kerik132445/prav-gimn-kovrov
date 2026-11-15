from PIL import Image

im = Image.open(r'C:/Users/kerik/.gemini/antigravity/brain/13f49d60-01c4-4af5-96b4-d4309f96ddc4/.user_uploaded/media_1794765064350_bb72d942.png')
print("Image mode:", im.mode, "size:", im.size)

crop_card = im.crop((200, 60, 750, 450))
crop_card.save(r'c:\Users\kerik\krytoi_site\scratch\crop_card.png')
print("Saved crop_card.png")
