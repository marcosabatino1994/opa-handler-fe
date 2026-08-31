export interface Delegation {
  id?: number;
  fromUser: string;
  toUser: string;
  action: string;
  resource: string;
}

export interface DelegationRequest {
  fromUser: string;
  toUser: string;
  action: string;
  resource: string;
}
