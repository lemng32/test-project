import { useState, useEffect, useRef } from 'react'
import './App.css'

const App = () => {
  const [imageUrl, setImageUrl] = useState(null)
  const [coordinates, setCoordinates] = useState([])
  const [brushColor, setBrushColor] = useState("#000000")
  const [brushSize, setBrushSize] = useState(3)

  const canvas = useRef(null)
  const isDrawing = useRef(false)
  const currentStroke = useRef([])

  useEffect(() => {
    renderImage()
  }, [imageUrl])

  const getContext = () => {
    return canvas.current.getContext("2d")
  }

  const uploadImage = (e) => {
    const url = URL.createObjectURL(e.target.files[0])
    setImageUrl(url)
  }

  const renderImage = () => {
    if (imageUrl) {
      const ctx = getContext() 
      setCoordinates([])
      const img = new Image()

      img.addEventListener("load", () => {
        ctx.clearRect(0, 0, canvas.current.width, canvas.current.height)
        ctx.drawImage(img, 0, 0, canvas.current.width, canvas.current.height)
      })
      img.src = imageUrl
    }
  }

  const getMousePos = (e) => {
    const rect = canvas.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.current.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.current.height / rect.height),
    };
  };

  const startDraw = (e) => {
    isDrawing.current = true
    const ctx = getContext() 
    const {x, y} = getMousePos(e)
    ctx.beginPath()
    ctx.lineWidth = brushSize
    ctx.strokeStyle = brushColor
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.moveTo(x, y)
  }

  const draw = (e) => {
    const ctx = getContext() 
    const {x, y} = getMousePos(e)
    if (isDrawing.current) {
      ctx.lineTo(x, y) 
      currentStroke.current.push({x, y})
      ctx.stroke()
    }
  }

  const stopDraw = (e) => {
    isDrawing.current = false
    const ctx = getContext() 
    setCoordinates([...coordinates, currentStroke.current])
    currentStroke.current = []
    ctx.closePath()
  }

  const exportData = () => {
    const data = []

    coordinates.forEach(coordinate => {
      const xCoordinates = coordinate.map(p => p.x)
      const yCoordinates = coordinate.map(p => p.y)
      const minX = Math.min(...xCoordinates)
      const maxX = Math.max(...xCoordinates)
      const minY = Math.min(...yCoordinates)
      const maxY = Math.max(...yCoordinates)

      data.push({
        id: data.length,
        x: maxX,
        y: maxY,
        center: {
          x: (maxX - minX) / 2,
          y: (maxY - minY) / 2
        }
      })
    })

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "text/plain" });
    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = "data.txt";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  const viewBox = () => {
    coordinates.forEach(coordinate => {
      const xCoordinates = coordinate.map(p => p.x)
      const yCoordinates = coordinate.map(p => p.y)
      const minX = Math.min(...xCoordinates)
      const maxX = Math.max(...xCoordinates)
      const minY = Math.min(...yCoordinates)
      const maxY = Math.max(...yCoordinates)

      const ctx = getContext() 
      ctx.strokeStyle = "blue"
      ctx.lineWidth = 2
      ctx.strokeRect(minX, minY, maxX - minX, maxY - minY) 
    })
  }

  return (
    <>
      <div className="card">
        {imageUrl && 
          <div>
            <canvas
              ref={canvas}
              id="canvas"
              width="700"
              height="500"
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
            />
            <div className="canvas-tools">
              <label>Color: </label>
              <input
                className="canvas-input"
                type="color"
                value={brushColor}
                onChange={(e) => setBrushColor(e.target.value)}
              />
              <label>{brushColor}</label>
              <label id="slider-label">Size: </label>
              <input
                className="canvas-input"
                type="range"
                min="1"
                max="10"
                value={brushSize}
                onChange={(e) => setBrushSize(e.target.value)}
              />
              <label>{brushSize}</label>
            </div>
            <div className="canvas-buttons">
              <button onClick={() => setImageUrl(null)}>Remove</button>
              <button onClick={renderImage}>Clear</button>
              <button onClick={viewBox}>View Box</button>
              <button onClick={exportData}>Export</button>
            </div>
          </div>}
      </div>
      <div className="card">
        <input id="image-upload" type="file" onChange={uploadImage}/>
      </div>
    </>
  )
}

export default App
