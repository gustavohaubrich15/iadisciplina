import React, { useEffect, useRef, useState } from 'react';
import * as tmImage from '@teachablemachine/image';
import styles from 'C:\\Users\\ghaubrich\\Documents\\ProjetoReactMediapipeExemplo\\my-app\\src\\page\\style.module.css';


export const PageDetectorObject: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    let model: tmImage.CustomMobileNet | null = null;
    let intervalId: NodeJS.Timeout | null = null;
    const [canal, setCanal] = useState<string>('sbt')
    const [ligarTV, setLigarTv] = useState<boolean>(false)
    const [mute, setMute] = useState<string>('1')

    useEffect(() => {
        startWebcam();
        loadModel();
    }, []);

    const startWebcam = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (error) {
            console.error("Error accessing webcam:", error);
        }
    };

    const loadModel = async () => {
        const URL = "https://teachablemachine.withgoogle.com/models/DRDj32Ztk/";
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";
        model = await tmImage.load(modelURL, metadataURL);
        intervalId = setInterval(predict, 5000);
    };

    const ajustarVolumeIframe = (muteCanal : boolean) => {
        setMute(muteCanal ? '0' : '1')
    };
    

    const predict = async () => {
        if (!model || !videoRef.current) return;

        const image = videoRef.current;
        const prediction = await model.predict(image);
        console.log(prediction)
        prediction.forEach((predict) => {
            if (predict.probability > 0.7) {
                switch (predict.className) {
                    case 'sbt':
                        setLigarTv(true)
                        setCanal('sbt')
                        console.log('Ação: sbt')
                        break;
                    case 'record':
                        setLigarTv(true)
                        setCanal('record')
                        console.log('Ação: record')
                        break;
                    case 'globo':
                        setLigarTv(true)
                        setCanal('globo')
                        console.log('Ação: globo')
                        break;
                    case 'aumentarVolume':
                        console.log('Ação: aumentar o volume do vídeo')
                        ajustarVolumeIframe(true)
                        break;
                    case 'diminuirVolume':
                        console.log('Ação: diminuir o volume do vídeo')
                        ajustarVolumeIframe(false)
                        break;
                    case 'desligarTV':
                        setLigarTv(false)
                        break;
                    default:
                        console.log('Ação: outras')
                        break;
                }
            }
        })
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
            <video id="video" width="400" height="400" autoPlay ref={videoRef}></video>
            <div className={styles["tv-container"]}>
                <div className={styles.antenna}></div>
                {ligarTV && <div>
                    {canal === 'sbt' && <iframe  id="sbt" className={styles.screen} src={`https://www.youtube.com/embed/UJwr7yV-jU0?autoplay=1&mute=${mute}&controls=0&showinfo=0&modestbranding=1`}  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen ></iframe>}
                    {canal === 'globo' && <iframe id="globo" className={styles.screen} src={`https://www.youtube.com/embed/WGEXLRTR0J0?autoplay=1&mute=${mute}&controls=0&showinfo=0&modestbranding=1`}  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>}
                    {canal === 'record' && <iframe  id="record" className={styles.screen} src={`https://www.youtube.com/embed/GKIeMqQ1pvU?autoplay=1&mute=${mute}&controls=0&showinfo=0&modestbranding=1`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>}
                </div>}
                {!ligarTV && <div className={styles.desligada} >TV desligada</div>}
                <div className={styles.buttons}>
                    <div style={{ color: 'white' }}>SONY</div>
                </div>
            </div>
        </div>
    );
};
