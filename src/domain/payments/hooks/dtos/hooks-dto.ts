export type NotificationDTO = {
  id: number;
  type: string;
  custom_id: string | null;
  status: {
    current: string;
    previous: string | null;
  };
  identifiers: {
    charge_id?: number;
    subscription_id?: number;
    carnet_id?: number;
  };
  created_at: string;
};
