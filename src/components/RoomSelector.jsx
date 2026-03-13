import React from 'react';

const RoomSelector = ({ rooms, selectedRoom, onRoomSelect }) => {
  return (
    <div className="room-selector">
      <div className="room-selector-row">
        <label htmlFor="room-select">Room:</label>
        <select
          id="room-select"
          value={selectedRoom?.id || ''}
          onChange={(e) => {
            const room = rooms.find(r => r.id === e.target.value);
            onRoomSelect(room);
          }}
        >
          <option value="">Select a room</option>
          {rooms.map(room => (
            <option key={room.id} value={room.id}>{room.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default RoomSelector;
