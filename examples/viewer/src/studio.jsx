import clsx from "clsx";
import { unpack } from "msgpackr";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

function _CanvasViewer({ ref, image }) {
  const canvasRef = ref;
  const imageRef = useRef(null);
  const [position, setPosition] = useState(null);

  const configureCanvas = useCallback(
    /**
     * @param {HTMLCanvasElement} canvas
     */
    (canvas) => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      canvas.width = w * devicePixelRatio;
      canvas.height = h * devicePixelRatio;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      const ctx = canvas.getContext("2d");

      ctx.fillStyle = "#333";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "rgba(255,255,255,.1)";
      ctx.lineWidth = devicePixelRatio;

      ctx.beginPath();

      const gridSize = Math.min(canvas.width, canvas.height) / 20;

      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
      }

      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
      }

      ctx.stroke();
      /**
       * @type {ImageData}
       */
      const image = imageRef.current;

      if (image !== null) {
        const imageRatio = image.width / image.height;
        const containerRatio = canvas.width / canvas.height;

        let destWidth = 0;
        let destHeight = 0;
        let destX = 0;
        let destY = 0;

        if (imageRatio > containerRatio) {
          destWidth = canvas.width;
          destHeight = destWidth / imageRatio;
          destY = (canvas.height - destHeight) / 2;
        } else {
          destHeight = canvas.height;
          destWidth = canvas.height * imageRatio;
          destX = (canvas.width - destWidth) / 2;
        }

        const maxWidth = 2480;
        const maxHeight = 2480;

        if (maxWidth && destWidth > maxWidth) {
          destWidth = maxWidth;
          destHeight = maxWidth / imageRatio;
        }

        if (maxHeight && destHeight > maxHeight) {
          destHeight = maxHeight;
          destWidth = maxHeight * imageRatio;
        }

        destX = (canvas.width - destWidth) / 2;
        destY = (canvas.height - destHeight) / 2;

        ctx.drawImage(
          image,
          0,
          0,
          image.width,
          image.height,
          destX,
          destY,
          destWidth,
          destHeight,
        );

        ctx.font = "50px monospace";

        const controller = new AbortController();
        const mouseEventHandler = (e, leave) => {
          const x = (e.clientX * devicePixelRatio - destX) / destWidth;
          const y = (e.clientY * devicePixelRatio - destY) / destHeight;

          setPosition([
            (x * image.width).toFixed(2),
            (y * image.height).toFixed(2),

            (x * 100).toFixed(2),
            (y * 100).toFixed(2),

            !leave ? e.clientX : null,
            !leave ? e.clientY : null,
          ]);
        };

        canvas.addEventListener("mousemove", mouseEventHandler, {
          signal: controller.signal,
        });

        canvas.addEventListener("mouseenter", mouseEventHandler, {
          signal: controller.signal,
        });

        canvas.addEventListener("mouseleave", (e) =>
          mouseEventHandler(e, true),
        );

        return () => {
          controller.abort();
        };
      }
    },
    [],
  );

  useEffect(() => {
    imageRef.current = image;
    return configureCanvas(canvasRef.current);
  }, [image, configureCanvas, canvasRef]);

  useEffect(() => {
    configureCanvas(canvasRef.current);
    const controller = new AbortController();
    window.addEventListener(
      "resize",
      () => {
        configureCanvas(canvasRef.current);
      },
      { signal: controller.signal },
    );
    return () => controller.abort();
  }, [canvasRef, configureCanvas]);

  const canvasElement = useMemo(() => {
    return <canvas ref={canvasRef} />;
  }, [canvasRef]);

  return (
    <>
      {position != null ? (
        <>
          <div className="fixed text-white/70 text-sm px-2 py-1 m-2 bg-black/10 rounded-lg">
            <pre>
              x: {position[0]}px ({position[2]}%)
            </pre>
            <pre>
              y: {position[1]}px ({position[3]}%)
            </pre>
          </div>

          {typeof position[4] === "number" ? (
            <div
              className="fixed top-0 bottom-0 w-[1px] bg-cyan-400/90 pointer-events-none"
              style={{ left: `${position[4]}px` }}
            />
          ) : null}

          {typeof position[5] === "number" ? (
            <div
              className="fixed left-0 right-0 top-0 h-[1px] bg-cyan-400/90 pointer-events-none"
              style={{ top: `${position[5]}px` }}
            />
          ) : null}
        </>
      ) : null}
      {canvasElement}
    </>
  );
}

export const CanvasViewer = memo(_CanvasViewer);

export function Studio() {
  const wsRef = useRef(null);
  const canvasRef = useRef(null);
  const [currentImage, setCurrentImage] = useState(null);

  const [connectionState, setConnectionState] = useState("default");

  useEffect(() => {
    const controller = new AbortController();
    const url = "ws://localhost:5003";

    const connect = () => {
      setConnectionState("connecting");
      const ws = new WebSocket(url);
      ws.binaryType = "arraybuffer";
      ws.addEventListener(
        "open",
        () => {
          console.log("[ws] connected");
          setConnectionState("connected");
        },
        { signal: controller.signal },
      );

      ws.addEventListener(
        "message",
        async (message) => {
          const data = unpack(message.data);
          if (canvasRef.current == null) return;
          const imageData = new ImageData(
            new Uint8ClampedArray(data.image),
            data.width,
            data.height,
            null,
          );

          const bitmap = await createImageBitmap(imageData);
          setCurrentImage(bitmap);
        },
        {
          signal: controller.signal,
        },
      );

      ws.addEventListener(
        "close",
        () => {
          setTimeout(() => {
            console.log("[ws] retry");
            connect();
          }, 1000);
        },
        { signal: controller.signal },
      );

      wsRef.current = ws;
    };

    connect();

    return () => {
      controller.abort();
    };
  }, []);

  const classes = {
    connecting: "text-red-300/100 bg-red-400/10 border-white/10",
    connected: "text-white/80 bg-white/5 border-white/10",
  };

  const stateLabels = {
    connecting: "Connecting\u2026",
    connected: "Connected",
  };

  return (
    <>
      <main>
        {connectionState === "connecting" ? (
          <div
            className={clsx(
              "text-center border-b text-xs font-medium px-2 py-1 fixed left-0 right-0 top-0",
              classes[connectionState],
            )}
          >
            {stateLabels[connectionState]}
          </div>
        ) : null}
        <CanvasViewer ref={canvasRef} image={currentImage} />
      </main>
    </>
  );
}
