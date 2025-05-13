import { GenericThrow } from '../errors/GenericThrow';

export function validatePermissions(permission: string) {
  const permissions = ['READ', 'CREATE', 'UPDATE', 'DELETE'];

  if (permissions.includes(permission)) return true;

  if (!permission.includes(permission))
    throw new GenericThrow(
      'Você não possui permissão para realizar essa ação!',
    );
}
