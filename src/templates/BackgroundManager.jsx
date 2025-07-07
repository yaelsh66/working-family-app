import React, { useEffect, useState } from 'react';

function BackgroundManager() {
  const [background, setBackground] = useState(localStorage.getItem('backgroundImage'));

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const imageDataUrl = reader.result;
      setBackground(imageDataUrl);
      localStorage.setItem('backgroundImage', imageDataUrl);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (background) {
      document.body.style.backgroundImage = `url(${background})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundRepeat = 'no-repeat';
      document.body.style.backgroundPosition = 'center';
    }
  }, [background]);

  return (
    <div className="p-3 text-center bg-dark text-white">
      <label htmlFor="background-upload" className="btn btn-light">
        Choose Background Image
      </label>
      <input
        id="background-upload"
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: 'none' }}
      />
    </div>
  );
}

export default BackgroundManager;
