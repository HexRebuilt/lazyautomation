import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RoomSelector from '../src/components/RoomSelector.jsx';

describe('RoomSelector', () => {
  const mockOnRoomSelect = vi.fn();
  const mockRooms = [
    { id: 'soggiorno', name: 'Soggiorno', icon: 'living_room' },
    { id: 'cucina', name: 'Cucina', icon: 'kitchen' },
    { id: 'camera_da_letto', name: 'Camera da Letto', icon: 'bedroom' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnRoomSelect.mockClear();
  });

  it('renders room selector with all rooms', () => {
    render(
      <RoomSelector
        rooms={mockRooms}
        selectedRoom={null}
        onRoomSelect={mockOnRoomSelect}
      />
    );

    expect(screen.getByLabelText('Room:')).toBeInTheDocument();
    expect(screen.getByText('Select a room')).toBeInTheDocument();
    expect(screen.getByText('Soggiorno')).toBeInTheDocument();
    expect(screen.getByText('Cucina')).toBeInTheDocument();
    expect(screen.getByText('Camera da Letto')).toBeInTheDocument();
  });

  it('calls onRoomSelect when room is changed', async () => {
    const user = userEvent.setup();

    render(
      <RoomSelector
        rooms={mockRooms}
        selectedRoom={null}
        onRoomSelect={mockOnRoomSelect}
      />
    );

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'cucina');

    expect(mockOnRoomSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'cucina', name: 'Cucina' })
    );
  });

  it('displays selected room in dropdown', () => {
    const selectedRoom = mockRooms[1]; // Cucina

    render(
      <RoomSelector
        rooms={mockRooms}
        selectedRoom={selectedRoom}
        onRoomSelect={mockOnRoomSelect}
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('cucina');
  });

  it('handles empty rooms array', () => {
    render(
      <RoomSelector
        rooms={[]}
        selectedRoom={null}
        onRoomSelect={mockOnRoomSelect}
      />
    );

    expect(screen.getByText('Select a room')).toBeInTheDocument();
  });

  it('handles null selectedRoom', () => {
    render(
      <RoomSelector
        rooms={mockRooms}
        selectedRoom={null}
        onRoomSelect={mockOnRoomSelect}
      />
    );

    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('');
  });
});