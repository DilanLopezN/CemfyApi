import * as QRCode from 'qrcode';
type QrCodeProps = {
  url: string;
};
export async function generateQrCode({ url }: QrCodeProps) {
  try {
    return new Promise((resolve, reject) => {
      QRCode.toDataURL(url, (err, qrCodeUrl) => {
        if (err) reject(err);

        resolve(qrCodeUrl);
      });
    });
  } catch (error) {
    throw new Error('Falha ao gerar QRCode');
  }
}
