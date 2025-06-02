import clsx from "clsx";
import { unpack } from "msgpackr";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

function _CanvasViewer({ ref, image }) {
  const canvasRef = ref;
  const imageRef = useRef(null);

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
      }
    },
    [],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: ignored
  useEffect(() => {
    imageRef.current = image;
    configureCanvas(canvasRef.current);
  }, [image, configureCanvas]);

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

  return useMemo(() => {
    return <canvas ref={canvasRef} />;
  }, [canvasRef]);
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
