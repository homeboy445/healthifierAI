export type GenericObject = {
  [key: string]: any;
};

export interface ChatData {
  message: string;
  ts: string;
  sender: "user" | "ai";
}

export interface MedicineObject {
    name: string;
    dosage: string;
    time: { day: number, hour: string };
    usage: string;
}
