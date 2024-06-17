import React, { useContext, useEffect, useState, useRef } from 'react';
import { HandLandmarker, FilesetResolver, HandLandmarkerResult } from '@mediapipe/tasks-vision'

interface IPositionRectangle{
    x: number,
    y: number,
    w: number,
    h: number
}

export const PageBalls: React.FC = () => {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasCatchBoxRef = useRef<HTMLCanvasElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [canvasContext, setCanvasContext] = useState<CanvasRenderingContext2D>();
    const [canvasCatchBoxContext, setCanvasCatchBoxContext] = useState<CanvasRenderingContext2D>();
    const positionRectangle :IPositionRectangle[] =[]
    const canvasWidth: number = 600;
    const canvasHeight: number = 500;
    let raio: number = 35

    useEffect(() => {
        startWebcam()
    }, [])

    useEffect(() => {
        if (canvasContext) {
            createHandLandmarker()
            drawBoxToSelect()
        }
    }, [canvasContext]);

    const startWebcam = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            if (canvasRef.current) {
                let contextCanvas2d = canvasRef.current.getContext("2d");
                if (contextCanvas2d) {
                    setCanvasContext(contextCanvas2d)
                }
            }
            if (canvasCatchBoxRef.current) {
                let contextCanvasCatchBox2d = canvasCatchBoxRef.current.getContext("2d");
                if (contextCanvasCatchBox2d) {
                    setCanvasCatchBoxContext(contextCanvasCatchBox2d)
                }
            }
            createHandLandmarker();
        } catch (error) {
            console.error("Error accessing webcam:", error);
        }
    };

    const createHandLandmarker = async () => {
        const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        let handLandmarkerCreate = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                delegate: "GPU"
            },
            runningMode: "VIDEO",
            numHands: 2
        });
        drawLandmarksCanvas(handLandmarkerCreate)
    }

    const processResultInCanvas = (results: HandLandmarkerResult) => {
        if (canvasContext && canvasHeight && canvasWidth && videoRef.current) {
            canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
            results.landmarks.forEach((normalizedLandmark) => {
                normalizedLandmark.forEach((landmark, index) => {

                    if (index == 9) {
                        const x = landmark.x * canvasWidth;
                        const y = landmark.y * canvasHeight;
                        canvasContext.beginPath();
                        canvasContext.fillStyle = 'black';
                        canvasContext.font = "40px Arial solid";
                        canvasContext.arc(x, y, raio, 0, Math.PI * 2, true);
                        if (x > canvasWidth / 2) {
                            canvasContext.fillText("Esquerda", x - 100, y / 2);
                            canvasContext.fillStyle = 'purple';
                            raio += 10
                            canvasContext.fill()
                        } else {
                            canvasContext.fillText("Direita", x, y / 2);
                            canvasContext.fillStyle = 'yellow';
                            raio = Math.max(0, raio -10)
                            canvasContext.fill()
                        }
                        canvasContext.stroke();

                        if(positionRectangle.length> 0){
                            let rectangle = positionRectangle[0]
                            const dx = Math.abs(x - (rectangle.x + rectangle.w / 2));
                            const dy = Math.abs(y - (rectangle.y + rectangle.h / 2));

                            if(dx < raio + rectangle.w / 2 && dy < raio + rectangle.h / 2 && canvasCatchBoxContext){
                                    canvasCatchBoxContext.fillStyle = "green";
                                    canvasCatchBoxContext.fill()
                                    canvasCatchBoxContext.clearRect(0, 0, canvasWidth, canvasHeight);
                                    positionRectangle.pop()
                                    drawBoxToSelect()
                                }
                        }

                    }


                })

            })
        }
    }

    const drawLandmarksCanvas = (handLandmarker: HandLandmarker) => {
        if (canvasRef.current && videoRef.current && videoRef.current.readyState >= 2) {
            let results = handLandmarker.detectForVideo(videoRef.current, performance.now());
            processResultInCanvas(results)
        }
        setTimeout(() => drawLandmarksCanvas(handLandmarker), 2);
    }


    const drawBoxToSelect = () => {
        if (canvasCatchBoxContext) {
            const randomX = Math.random() * canvasWidth;
            const randomY = Math.random() * canvasHeight;
            canvasCatchBoxContext.fillRect(randomX, randomY, 70, 50); 
            canvasCatchBoxContext.fillStyle = "blue";
            canvasCatchBoxContext.fill()
            canvasCatchBoxContext.stroke()
            positionRectangle.push({x: randomX, y:randomY, h:70,w:50})
        }
    }

    return (
        <>
            <div className="flex space-y-1 pt-10 justify-center items-center font-bold h-full w-full">
                <div className="relative">
                    <video
                        ref={videoRef}
                        style={{
                            width: canvasWidth,
                            height: canvasHeight
                        }}
                        autoPlay
                    />
                    <canvas  height={canvasHeight} width={canvasWidth} ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
                    <canvas height={canvasHeight} width={canvasWidth} ref={canvasCatchBoxRef} style={{ position: 'absolute', top: 0, left: 0 }} />
                </div>
            </div>
        </>
    )
}