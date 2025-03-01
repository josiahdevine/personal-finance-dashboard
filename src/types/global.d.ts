interface Window {
  gtag: (
    command: string,
    eventName: string,
    params: {
      value?: number;
      event_category?: string;
      event_label?: string;
      non_interaction?: boolean;
      [key: string]: any;
    }
  ) => void;
} 