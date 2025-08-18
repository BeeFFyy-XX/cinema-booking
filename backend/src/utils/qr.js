import QRCode from 'qrcode';

export async function generateQr(text) {
  return QRCode.toDataURL(text);
}
