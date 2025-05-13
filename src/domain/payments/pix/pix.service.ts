import { CreatePixDto } from './dto/create-pix.dto';
import { Injectable } from '@nestjs/common';
import https from 'https';
import axios from 'axios';
import PaymentServices from '../payment';

@Injectable()
export class PixService {
  private pixService = new PaymentServices();

  /**
   * Cria uma cobrança pix Imediatada atráves da EFIPAY.
   *
   * DTO padrão exigido pela EFIPAY não da pra mudar não foi eu que fiz essa bomba de API
   *
   * @param createPixDto - Objeto exigido para criação da cobrança
   *
   * @returns Retorna resposta da EfiPay contendo um ReturnPixDto
   * @returns txId refere-se ao tx id criado pela EFI importante < para identificar a transação
   * @returns pixCopy refere-se ao copia e cola desse PIX
   * @returns pixLink link gerado pela EFI para acessar o pagamento do pix
   * @returns qrCode string em base64/png contendo o QRCode para pagamento desse pix
   * @author Dilan Lopez
   */
  async create_charge(createPixDto: CreatePixDto) {
    this.pixService.setUseCertificate(true);

    try {
      const response = await this.pixService.paymentService.pixCreateCharge(
        { txid: createPixDto.custom_id },
        {
          calendario: { expiracao: createPixDto.calendario.expiracao },
          chave: createPixDto.chave,
          valor: createPixDto.valor,
          devedor: {
            nome: createPixDto.devedor.nome,
            cpf: createPixDto.devedor.cpf,
          },
          solicitacaoPagador: createPixDto.solicitacaoPagador,
        },
      );

      const qrCode = await this.pixService.paymentService.pixGenerateQRCode({
        id: response.loc.id,
      });

      /**

       */
      return {
        txId: response.txid,
        pixCopy: qrCode.qrcode,
        pixLink: qrCode.linkVisualizacao,
        qrCode: qrCode.imagemQrcode,
      };
    } catch (error) {
      console.warn(error);
      throw error;
    }
  }

  async create_webhook() {
    try {
      const data = {
        grant_type: 'client_credentials',
      };

      const response = await axios.post(
        'https://pix-h.api.efipay.com.br/oauth/token',
        data,
        {
          httpsAgent: new https.Agent({ keepAlive: true }),
          auth: {
            username: 'Client_Id_bb023ebd506e4155967b226f2fd9b08c57a41d85',
            password: 'Client_Secret_c0e325687fb7bb3401c99632d84e6c316bb4240a',
          },
        },
      );
      console.log(response.data);
      // const response = await axios.put(
      //   `https://pix-h.api.efipay.com.br/v2/webhook/${env.PIX_KEY}`,
      //   {
      //     webhookUrl:
      //       'https://b958-200-189-29-130.ngrok-free.app/hooks/?ignorar=',
      //   },
      //   {
      //     headers: {
      //       'x-skip-mtls-checking': true,
      //       Authorization: `Bearer ${access_token}`,
      //     },
      //   },
      // );

      // console.log(response.data);
      // return response.data;
    } catch (error) {
      console.log(error);
    }
  }
}
