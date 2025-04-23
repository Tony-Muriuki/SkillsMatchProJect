// src/app/services/chat.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EnvironmentService } from './environment.service';
import { Observable } from 'rxjs';

interface Contact {
  id: string;
  name: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  isOnline: boolean;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  time: string;
  date: string;
  status: string;
}

interface ContactsResponse {
  contacts: Contact[];
}

interface MessagesResponse {
  messages: Message[];
}

interface MessageResponse {
  message: Message;
}

interface UnreadCountResponse {
  count: number;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  constructor(private http: HttpClient, private env: EnvironmentService) {}

  getContacts(): Observable<ContactsResponse> {
    return this.http.get<ContactsResponse>(`${this.env.apiUrl}/chat/contacts`);
  }

  getMessages(contactId: string): Observable<MessagesResponse> {
    return this.http.get<MessagesResponse>(
      `${this.env.apiUrl}/chat/messages/${contactId}`
    );
  }

  sendMessage(contactId: string, content: string): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.env.apiUrl}/chat/messages`, {
      receiverId: contactId,
      text: content,
    });
  }

  markMessageAsRead(messageId: string): Observable<{ success: boolean }> {
    return this.http.put<{ success: boolean }>(
      `${this.env.apiUrl}/chat/messages/${messageId}/read`,
      {}
    );
  }

  getUnreadCount(): Observable<UnreadCountResponse> {
    return this.http.get<UnreadCountResponse>(
      `${this.env.apiUrl}/chat/messages/unread`
    );
  }
}
