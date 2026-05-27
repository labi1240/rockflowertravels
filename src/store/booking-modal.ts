import { create } from 'zustand';

export type BookingRouteId =
  | 'sunrise-express'
  | 'daytime-circuit'
  | 'evening-return';

interface BookingModalOpenOptions {
  date?: string;
  passengers?: number;
}

interface BookingModalState {
  isOpen: boolean;
  initialRoute: BookingRouteId;
  initialDate?: string;
  initialPassengers?: number;
  open: (route?: BookingRouteId, opts?: BookingModalOpenOptions) => void;
  close: () => void;
}

export const useBookingModal = create<BookingModalState>((set) => ({
  isOpen: false,
  initialRoute: 'daytime-circuit',
  initialDate: undefined,
  initialPassengers: undefined,
  open: (route = 'daytime-circuit', opts) =>
    set({
      isOpen: true,
      initialRoute: route,
      initialDate: opts?.date,
      initialPassengers: opts?.passengers,
    }),
  close: () => set({ isOpen: false }),
}));
