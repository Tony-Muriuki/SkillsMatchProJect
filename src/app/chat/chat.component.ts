import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Contact {
  id: string;
  name: string;
  avatar: string;
  company: string;
  jobTitle: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  isOnline: boolean;
  isSelected: boolean;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  time: string;
  date: string;
  status: 'sent' | 'delivered' | 'read';
  isCurrentUser: boolean;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatMessages') private chatMessagesRef!: ElementRef;

  contacts: Contact[] = [];
  filteredContacts: Contact[] = [];
  messages: Message[] = [];
  selectedContact: Contact | null = null;
  newMessage = '';
  searchTerm = '';
  showChatInfo = false;
  isLoading = true;

  ngOnInit(): void {
    this.loadContacts();
    this.initializeSelectedContact();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      if (this.chatMessagesRef) {
        this.chatMessagesRef.nativeElement.scrollTop =
          this.chatMessagesRef.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  loadContacts(): void {
    // Simulate API call
    setTimeout(() => {
      this.contacts = this.getMockContacts();
      this.filteredContacts = [...this.contacts];
      this.isLoading = false;
    }, 1000);
  }

  getMockContacts(): Contact[] {
    return [
      {
        id: '1',
        name: 'Sarah Wilson',
        avatar: 'assets/avatars/sarah.jpg',
        company: 'TechCorp Inc.',
        jobTitle: 'HR Manager',
        lastMessage:
          'Thank you for applying. We would like to schedule an interview.',
        time: '10:30 AM',
        unreadCount: 2,
        isOnline: true,
        isSelected: false,
      },
      {
        id: '2',
        name: 'John Davis',
        avatar: 'assets/avatars/john.jpg',
        company: 'DesignMasters',
        jobTitle: 'Creative Director',
        lastMessage:
          "I reviewed your portfolio and I'm impressed with your work.",
        time: 'Yesterday',
        unreadCount: 0,
        isOnline: false,
        isSelected: false,
      },
      {
        id: '3',
        name: 'Emily Johnson',
        avatar: 'assets/avatars/emily.jpg',
        company: 'WebTech Solutions',
        jobTitle: 'Senior Developer',
        lastMessage: 'When can you start the technical interview?',
        time: 'Apr 10',
        unreadCount: 1,
        isOnline: true,
        isSelected: false,
      },
      {
        id: '4',
        name: 'Michael Brown',
        avatar: 'assets/avatars/michael.jpg',
        company: 'StartupXYZ',
        jobTitle: 'CTO',
        lastMessage: 'Looking forward to our chat tomorrow.',
        time: 'Apr 8',
        unreadCount: 0,
        isOnline: false,
        isSelected: false,
      },
      {
        id: '5',
        name: 'Jessica Lee',
        avatar: 'assets/avatars/jessica.jpg',
        company: 'TechCorp Inc.',
        jobTitle: 'Product Manager',
        lastMessage: 'We have a new job opening that matches your skills.',
        time: 'Apr 5',
        unreadCount: 0,
        isOnline: true,
        isSelected: false,
      },
    ];
  }

  initializeSelectedContact(): void {
    // Select the first contact with unread messages, or the first contact
    setTimeout(() => {
      const contactWithUnread = this.contacts.find(
        (contact) => contact.unreadCount > 0
      );
      if (contactWithUnread) {
        this.selectContact(contactWithUnread);
      } else if (this.contacts.length > 0) {
        this.selectContact(this.contacts[0]);
      }
    }, 1200);
  }

  selectContact(contact: Contact): void {
    // Reset previous selection
    this.contacts.forEach((c) => (c.isSelected = false));

    // Set new selection
    contact.isSelected = true;
    this.selectedContact = contact;

    // Mark messages as read
    contact.unreadCount = 0;

    // Load messages for this contact
    this.loadMessages(contact.id);

    // Close chat info on mobile
    this.showChatInfo = false;
  }

  loadMessages(contactId: string): void {
    // Simulate API call
    setTimeout(() => {
      this.messages = this.getMockMessages(contactId);
      setTimeout(() => {
        this.scrollToBottom();
      }, 100);
    }, 500);
  }

  getMockMessages(contactId: string): Message[] {
    // Different messages based on contact
    if (contactId === '1') {
      return [
        {
          id: '101',
          senderId: '1',
          receiverId: 'current-user',
          text: 'Hello! Thank you for applying to the Senior Frontend Developer position at TechCorp Inc.',
          time: '10:00 AM',
          date: '2023-04-15',
          status: 'read',
          isCurrentUser: false,
        },
        {
          id: '102',
          senderId: 'current-user',
          receiverId: '1',
          text: "Hi Sarah! Thank you for reviewing my application. I'm very excited about this opportunity.",
          time: '10:05 AM',
          date: '2023-04-15',
          status: 'read',
          isCurrentUser: true,
        },
        {
          id: '103',
          senderId: '1',
          receiverId: 'current-user',
          text: "We're impressed with your qualifications and would like to schedule an interview with our technical team.",
          time: '10:15 AM',
          date: '2023-04-15',
          status: 'read',
          isCurrentUser: false,
        },
        {
          id: '104',
          senderId: '1',
          receiverId: 'current-user',
          text: 'Would you be available on Monday, April 20th at 2:00 PM for a video interview?',
          time: '10:16 AM',
          date: '2023-04-15',
          status: 'read',
          isCurrentUser: false,
        },
        {
          id: '105',
          senderId: '1',
          receiverId: 'current-user',
          text: 'Also, please prepare a short presentation of your most recent project.',
          time: '10:20 AM',
          date: '2023-04-15',
          status: 'delivered',
          isCurrentUser: false,
        },
      ];
    } else if (contactId === '2') {
      return [
        {
          id: '201',
          senderId: '2',
          receiverId: 'current-user',
          text: "Hi there! I just reviewed your portfolio and I'm really impressed with your UX design work.",
          time: '3:30 PM',
          date: '2023-04-14',
          status: 'read',
          isCurrentUser: false,
        },
        {
          id: '202',
          senderId: 'current-user',
          receiverId: '2',
          text: 'Thank you, John! I appreciate you taking the time to look through my work.',
          time: '4:00 PM',
          date: '2023-04-14',
          status: 'read',
          isCurrentUser: true,
        },
        {
          id: '203',
          senderId: '2',
          receiverId: 'current-user',
          text: "We're currently looking for a UX Designer to join our team at DesignMasters. Would you be interested in learning more about the position?",
          time: '4:15 PM',
          date: '2023-04-14',
          status: 'read',
          isCurrentUser: false,
        },
        {
          id: '204',
          senderId: 'current-user',
          receiverId: '2',
          text: "Absolutely! I'd love to hear more details about the role and your company.",
          time: '4:30 PM',
          date: '2023-04-14',
          status: 'read',
          isCurrentUser: true,
        },
      ];
    } else {
      // Default messages for other contacts
      return [
        {
          id: '301',
          senderId: contactId,
          receiverId: 'current-user',
          text: 'Hello! Thanks for connecting on SkillMatch AI.',
          time: '9:00 AM',
          date: '2023-04-13',
          status: 'read',
          isCurrentUser: false,
        },
        {
          id: '302',
          senderId: 'current-user',
          receiverId: contactId,
          text: 'Hi! Thank you for reaching out. How can I help you?',
          time: '9:15 AM',
          date: '2023-04-13',
          status: 'read',
          isCurrentUser: true,
        },
        {
          id: '303',
          senderId: contactId,
          receiverId: 'current-user',
          text: 'I noticed your profile matches a position we have open. Would you be interested in discussing it?',
          time: '9:30 AM',
          date: '2023-04-13',
          status: 'read',
          isCurrentUser: false,
        },
      ];
    }
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedContact) {
      return;
    }

    // Create a new message
    const newMsg: Message = {
      id: 'msg-' + Date.now(),
      senderId: 'current-user',
      receiverId: this.selectedContact.id,
      text: this.newMessage.trim(),
      time: this.formatTime(new Date()),
      date: new Date().toISOString().split('T')[0],
      status: 'sent',
      isCurrentUser: true,
    };

    // Add to messages list
    this.messages.push(newMsg);

    // Update last message in contacts list
    this.selectedContact.lastMessage = this.newMessage.trim();
    this.selectedContact.time = 'Just now';

    // Clear input
    this.newMessage = '';

    // Scroll to bottom
    setTimeout(() => {
      this.scrollToBottom();
    }, 100);

    // Simulate reply after a delay (only for first contact)
    if (this.selectedContact.id === '1') {
      setTimeout(() => {
        // Update status of sent message
        newMsg.status = 'delivered';

        // Create reply
        const reply: Message = {
          id: 'msg-' + Date.now(),
          senderId: this.selectedContact!.id,
          receiverId: 'current-user',
          text: "Great! I'll send you the details of the interview soon. Please let me know if you need any additional information.",
          time: this.formatTime(new Date()),
          date: new Date().toISOString().split('T')[0],
          status: 'delivered',
          isCurrentUser: false,
        };

        // Add to messages list
        this.messages.push(reply);

        // Update last message in contacts list
        this.selectedContact!.lastMessage = reply.text;
        this.selectedContact!.time = 'Just now';

        // Scroll to bottom
        setTimeout(() => {
          this.scrollToBottom();
        }, 100);
      }, 3000);
    }
  }

  searchContacts(): void {
    if (!this.searchTerm.trim()) {
      this.filteredContacts = [...this.contacts];
      return;
    }

    const term = this.searchTerm.toLowerCase().trim();
    this.filteredContacts = this.contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(term) ||
        contact.company.toLowerCase().includes(term) ||
        contact.jobTitle.toLowerCase().includes(term)
    );
  }

  toggleChatInfo(): void {
    this.showChatInfo = !this.showChatInfo;
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  getUnreadTotal(): number {
    return this.contacts.reduce(
      (total, contact) => total + contact.unreadCount,
      0
    );
  }

  getMessageDate(message: Message, index: number): string | null {
    if (index === 0) {
      return message.date;
    }

    const prevMessage = this.messages[index - 1];
    return prevMessage.date !== message.date ? message.date : null;
  }
}
