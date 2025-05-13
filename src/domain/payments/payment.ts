import path from 'path';
import EfiPay from 'sdk-node-apis-efi';
import { env } from 'src/core/env';

class PaymentServices {
  constructor() {
    this.paymentService = new EfiPay(this.getOptions());
  }

  public useCertificate = true;

  public setUseCertificate(useCertificate: boolean) {
    this.useCertificate = useCertificate;
    // Atualize ou recrie as opções aqui se necessário
    this.paymentService = new EfiPay(this.getOptions());
  }

  private readonly clientId = env.EFIPAY_CLIENT_ID;
  private readonly clientSecret = env.EFIPAY_CLIENT_SECRET;
  private readonly certificatePath = path.resolve(
    __dirname,
    '../../core/cert',
    process.env.NODE_ENV === 'production' ? 'prod.p12' : 'certificado.p12',
  );

  private getOptions() {
    return this.useCertificate
      ? {
          sandbox: process.env.NODE_ENV === 'production' ? false : true,
          client_id: this.clientId,
          client_secret: this.clientSecret,
          certificate: this.certificatePath,
          cert_base64: false,
        }
      : {
          sandbox: process.env.NODE_ENV === 'production' ? false : true,
          client_id: this.clientId,
          client_secret: this.clientSecret,
          // certificate: this.certificatePath,
          cert_base64: false,
        };
  }

  public paymentService: EfiPay;
}

const paymentServicesInstance = new PaymentServices();
export const paymentService = paymentServicesInstance.paymentService;

export default PaymentServices;
