import type { Record } from "pocketbase";

export interface User extends Record {
  username: string;
  pubkey: string;
}

export interface ChatPartner {
  user: User,
  latest: string,
  content: string;
}

export interface MessageRecord extends Record {
  content: { message: string, image?: string }
}

export interface Message {
  to: User; 
  from: User;
  content: string;
  created: string;
}

export interface RawMessage {
  content: { message: string, image?: string };
  created: string;
  expand: { from: User, to: User }
}

export enum MessageType {
  Image = 'image',
  Other = 'other',
}

export type ParsedMessage = {
  content: string;
  type: MessageType;
}


export type Respons = {
    value: string | null;
    error: string | null
}

export interface Result<T> {
  value: T | null;
  error: string | null;
};


