import { env } from '../env';
import { GenericThrow } from '../errors/GenericThrow';

type MessageDTO = {
  to: string;
  message: string;
};

const accountSid = env.SMS_ACC_ID;
const authToken = env.SMS_TOKEN;
const client = require('twilio')(accountSid, authToken);
export async function SendMessage({ message, to }: MessageDTO) {
  if (!to)
    throw new GenericThrow(
      'Necessário número de telefone válido para envio de mensagem',
    );
  try {
    const response = client.messages.create({
      to: `+55${to}`,
      body: message,
      from: '+12314402568',
    });

    return (await response).dateCreated;
  } catch (error) {
    throw error;
  }
}
