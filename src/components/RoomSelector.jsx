import React from 'react';

const roomIcons = {
  living_room: '🛋️',
  bedroom: '🛏️',
  kitchen: '🍳',
  bathroom: '🚿',
  office: '💼',
  garage: '🚗',
  garden: '🌳',
  default: '🏠'
};

const RoomSelector = ({ rooms, selectedRoom, onRoomSelect }) => {
  return (
    <div className="room-selector">
      <h2>Select Room</h2>
      <div className="room-grid">
        {rooms.map(room => (
          <div
            key={room.id}
            className={`room-card ${selectedRoom?.id === room.id ? 'active' : ''}`}
            onClick={() => onRoomSelect(room)}
          >
            <span className="room-icon">
              {roomIcons[room.id] || roomIcons.default}
            </span>
            <span className="room-name">{room.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomSelector;
