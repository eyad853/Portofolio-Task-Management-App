import { useRef, useState, useEffect, useCallback } from 'react';

export default function ColorWheel({selectedColor,type, setSelectedColor ,selectedCardColor , setSelectedCardColor}) {
  const [previewColor, setPreviewColor] = useState('#000000');
  const [circlePosition, setCirclePosition] = useState({ x: 0, y: 0 }); // Position of the circle
  const canvasRef = useRef(null);

  // Function to draw color wheel on canvas
  const drawColorWheel = (ctx, width, height) => {
    const radius = width / 2;
    const gradient = ctx.createConicGradient(0, radius, radius);
    const colorSteps = 360;

    // Generate a color wheel with 360 hues
    for (let i = 0; i < colorSteps; i++) {
      gradient.addColorStop(i / colorSteps, `hsl(${i}, 100%, 50%)`);
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  };

  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - canvas.width / 2;
    const y = e.clientY - rect.top - canvas.height / 2;

    const angle = Math.atan2(y, x); // angle between mouse position and the center of the canvas
    const distance = Math.sqrt(x * x + y * y);

    if (distance < canvas.width / 2) {
      // Fix hue calculation: Invert angle to match counter-clockwise wheel (start from 0° to 360°)
      let hue = (angle * (180 / Math.PI) + 360) % 360; // Angle to degrees, map to 0-360, adjusted for correct color wheel
      const lightness = Math.min(distance / (canvas.width / 2), 1) * 50 + 25;

      // Set the preview color based on mouse position
      setPreviewColor(`hsl(${Math.round(hue)}, 100%, ${Math.round(lightness)}%)`);

      // Set the position of the circle to follow the mouse
      setCirclePosition({
        x: e.clientX - rect.left - 10, // Position the circle correctly
        y: e.clientY - rect.top - 10,  // Position the circle correctly
      });
    }
  }, []);

  const handleClick = () => {
    // Set the selected color when user clicks
    if(type==="column"){
      setSelectedColor(previewColor)
    }else if(type==="card"){
      setSelectedCardColor(previewColor)
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    drawColorWheel(ctx, canvas.width, canvas.height);

    // Add mouse move listener for dynamic preview
    canvas.addEventListener('mousemove', handleMouseMove);
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [previewColor, handleMouseMove]);

  return (
    <div className="flex flex-col items-center relative">
      {/* Smaller Color Wheel */}
      <canvas
        ref={canvasRef}
        width={type==="column"?150:130}
        height={type==="column" ?150:130}
        onClick={handleClick}
        style={{ borderRadius: '50%' }}
      ></canvas>

      {/* Circle that follows the mouse */}
      <div
        style={{
          position: 'absolute',
          top: `${circlePosition.y}px`,
          left: `${circlePosition.x}px`,
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: previewColor,
          pointerEvents: 'none', // Prevent interfering with the canvas
          transition: 'top 0.1s, left 0.1s', // Smooth transition
        }}
      ></div>
    </div>
  );
}