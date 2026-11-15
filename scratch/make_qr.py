import qrcode
import qrcode.image.svg

data = 'ST00012|Name=ЧОУ "Православная гимназия г. Коврова"|PersonalAcc=40703810810000000118|BankName=Ульяновское отделение №8588 ПАО СБЕРБАНК|BIC=047308602|CorrespAcc=30101810000000000602|PayeeINN=3305051862|KPP=330501001|Purpose=Пожертвование на уставную деятельность'

# Generate SVG
factory = qrcode.image.svg.SvgPathImage
img_svg = qrcode.make(data, image_factory=factory, box_size=10, border=2)
img_svg.save('assets/images/qr-donation.svg')

# Generate PNG
qr = qrcode.QRCode(
    version=None,
    error_correction=qrcode.constants.ERROR_CORRECT_M,
    box_size=12,
    border=2,
)
qr.add_data(data)
qr.make(fit=True)
img_png = qr.make_image(fill_color='#0f172a', back_color='white')
img_png.save('assets/images/qr-donation.png')

print('Generated QR codes successfully!')
