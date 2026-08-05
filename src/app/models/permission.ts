export interface Permission {
  id?: number;        // opzionale: in creazione non c'è ancora
  action: string;
  resource: string;
}
