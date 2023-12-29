// EmojiPicker.js
import React, { useState } from 'react';
import data from '@emoji-mart/data'
import Picker from 'emoji-picker-react';
import './style.css'


const EmojiPicker = ({ onSelect }) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleSelect = (emoji) => {
    setShowPicker(false);
    onSelect(emoji.native);
    console.log("1111", emoji.native);
  };

  return (
    <div className="emoji-picker-container">
      {showPicker && (
        <Picker
          onSelect={handleSelect}
          emojiSize={24}
          title="Pick your emoji"
          emoji="point_up"
        />
      )}
      <button onClick={() => setShowPicker(!showPicker)}>😊</button>
    </div>
  );
};

export default EmojiPicker;
