'use client';

import { useRef, useState, useEffect } from 'react';

export default function CapOverlayApp() {
  const [imageSrc, setImageSrc] = useState(null);
  const [capPosition, setCapPosition] = useState({ x: 100, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [capScale, setCapScale] = useState(1);
  const [capRotation, setCapRotation] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState({ userImage: false, cap: false });

  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const capImg = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result);
        setImagesLoaded({ userImage: false, cap: false });
      };
      reader.readAsDataURL(file);
    }
  };

  const drawImageWithCap = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    const cap = capImg.current;
    if (!canvas || !img || !cap) return;

    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    const baseCapWidth = img.width / 3;
    const capWidth = baseCapWidth * capScale;
    const capHeight = (cap.height / cap.width) * capWidth;

    const centerX = capPosition.x + capWidth / 2;
    const centerY = capPosition.y + capHeight / 2;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((capRotation * Math.PI) / 180);
    ctx.drawImage(cap, -capWidth / 2, -capHeight / 2, capWidth, capHeight);
    ctx.restore();
  };

  const startDrag = (clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    const capWidth = (imageRef.current.width / 3) * capScale;
    const capHeight = (capImg.current.height / capImg.current.width) * capWidth;

    setDragOffset({
      x: mouseX - capPosition.x,
      y: mouseY - capPosition.y,
    });

    setIsDragging(true);
  };

  const duringDrag = (clientX, clientY) => {
    if (!isDragging || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    setCapPosition({
      x: mouseX - dragOffset.x,
      y: mouseY - dragOffset.y,
    });
  };

  const endDrag = () => {
    setIsDragging(false);
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'capped-image.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  // Redraw whenever cap updates or loads
  useEffect(() => {
    if (imagesLoaded.userImage && imagesLoaded.cap) {
      drawImageWithCap();
    }
  }, [capPosition, capScale, capRotation, imagesLoaded]);

  return (
    <div className="p-6 flex flex-col items-center gap-4">
      <h1 className="text-2xl font-bold">Cap Overlay App</h1>

      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="border border-gray-300 px-4 py-2 rounded"
      />

      {imageSrc && (
        <>
          {/* Hidden image refs */}
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Uploaded"
            className="hidden"
            onLoad={() =>
              setImagesLoaded((prev) => ({ ...prev, userImage: true }))
            }
          />
          <img
            ref={capImg}
            src="/cap.png"
            alt="Cap"
            className="hidden"
            onLoad={() =>
              setImagesLoaded((prev) => ({ ...prev, cap: true }))
            }
          />

          <div className="w-full flex justify-center">
            <canvas
              ref={canvasRef}
              className="border rounded-md shadow touch-none max-w-[95vw] h-auto"
              onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
              onMouseMove={(e) => duringDrag(e.clientX, e.clientY)}
              onMouseUp={endDrag}
              onMouseLeave={endDrag}
              onTouchStart={(e) =>
                startDrag(e.touches[0].clientX, e.touches[0].clientY)
              }
              onTouchMove={(e) => {
                e.preventDefault();
                duringDrag(e.touches[0].clientX, e.touches[0].clientY);
              }}
              onTouchEnd={endDrag}
            />
          </div>

          {/* Sliders */}
          <div className="flex flex-col gap-4 w-full max-w-xs mt-4">
            <label className="text-sm font-medium">
              Resize Cap ({capScale.toFixed(2)}x)
            </label>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.01"
              value={capScale}
              onChange={(e) => setCapScale(parseFloat(e.target.value))}
            />

            <label className="text-sm font-medium">
              Rotate Cap ({capRotation}°)
            </label>
            <input
              type="range"
              min="0"
              max="360"
              step="1"
              value={capRotation}
              onChange={(e) => setCapRotation(parseInt(e.target.value))}
            />
          </div>

          <button
            onClick={downloadImage}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Download Image
          </button>
        </>
      )}
    </div>
  );
}
