"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";

export default function CapOverlayApp() {
  const [imageSrc, setImageSrc] = useState(null);
  const [capScale, setCapScale] = useState(1);
  const [capRotation, setCapRotation] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState({
    userImage: false,
    cap: false,
  });

  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const capImg = useRef(null);
  const capPosition = useRef({ x: 100, y: 50 });
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const drawImageWithCap = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = imageRef.current;
    const cap = capImg.current;

    if (!canvas || !ctx || !img || !cap) return;

    const scaleFactor = canvas.clientWidth / img.width;
    canvas.width = img.width;
    canvas.height = img.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const baseCapWidth = img.width / 3;
    const capWidth = baseCapWidth * capScale;
    const capHeight = (cap.height / cap.width) * capWidth;

    const { x, y } = capPosition.current;
    const centerX = x + capWidth / 2;
    const centerY = y + capHeight / 2;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((capRotation * Math.PI) / 180);
    ctx.drawImage(cap, -capWidth / 2, -capHeight / 2, capWidth, capHeight);
    ctx.restore();
  };

  const updateCanvas = () => {
    requestAnimationFrame(drawImageWithCap);
  };

  const startDrag = (clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    const capWidth = (imageRef.current.width / 3) * capScale;
    const capHeight = (capImg.current.height / capImg.current.width) * capWidth;

    dragOffset.current = {
      x: mouseX - capPosition.current.x,
      y: mouseY - capPosition.current.y,
    };

    isDragging.current = true;
  };

  const duringDrag = (clientX, clientY) => {
    if (!isDragging.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    capPosition.current = {
      x: mouseX - dragOffset.current.x,
      y: mouseY - dragOffset.current.y,
    };

    updateCanvas();
  };

  const endDrag = () => {
    isDragging.current = false;
  };

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

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "capped-image.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  useEffect(() => {
    if (imagesLoaded.userImage && imagesLoaded.cap) {
      updateCanvas();
    }
  }, [imagesLoaded, capScale, capRotation]);

  return (
    <div className="min-h-screen bg-page-bg bg-cover bg-center  flex flex-col items-center p-4">
      <header className="w-full max-w-4xl text-center py-4 flex flex-col items-center">
      <Image src={"/succinctHero.png"} alt="Example" width={300} height={300} />
        <p className="text-gray-600 font-light  mt-1">Put a cap on it 👒</p>
      </header>

      <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-4 flex flex-col items-center">
        {!imageSrc && (
          <>
            <Image src={"/succinctCapBig.jpg"} alt="Example" width={300} height={300} />
            <p className="text-gray-500 mt-4 text-sm text-center">
              Upload a picture to get started!
            </p>
          </>
        )}

{!imageSrc && (<><label className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-full mt-6 cursor-pointer transition text-lg">
          Upload Image
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        </label></>)}

        {imageSrc && (
          <>
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Uploaded"
              className="hidden"
              onLoad={() => setImagesLoaded((prev) => ({ ...prev, userImage: true }))}
            />
            <img
              ref={capImg}
              src="/cap.png"
              alt="Cap"
              className="hidden"
              onLoad={() => setImagesLoaded((prev) => ({ ...prev, cap: true }))}
            />

            <div className="w-full overflow-auto mt-6 border rounded-xl">
              <canvas
                ref={canvasRef}
                className="w-full max-w-full h-auto rounded-md touch-none"
                onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
                onMouseMove={(e) => duringDrag(e.clientX, e.clientY)}
                onMouseUp={endDrag}
                onMouseLeave={endDrag}
                onTouchStart={(e) => {
                  e.preventDefault();
                  startDrag(e.touches[0].clientX, e.touches[0].clientY);
                }}
                onTouchMove={(e) => {
                  e.preventDefault();
                  duringDrag(e.touches[0].clientX, e.touches[0].clientY);
                }}
                onTouchEnd={endDrag}
              />
            </div>

            <div className="mt-6 w-full space-y-4">
              <div>
                <label className="block text-sm mb-1 text-black">Resize Cap</label>
                <input
                  type="range"
                  min="0.1"
                  max="2"
                  step="0.01"
                  value={capScale}
                  
                  onChange={(e) => {
                    setCapScale(parseFloat(e.target.value));
                    updateCanvas();
                  }}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm  mb-1 text-black">Rotate Cap</label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="1"
                  value={capRotation}
                  onChange={(e) => {
                    setCapRotation(parseInt(e.target.value));
                    updateCanvas();
                  }}
                  className="w-full"
                />
              </div>

              <div className="text-center mt-4">
                <button
                  onClick={downloadImage}
                  className="bg-pink-400  text-white px-6 py-2 rounded-full shadow"
                >
                  Download Image
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
