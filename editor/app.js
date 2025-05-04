const preview = document.getElementById("preview");
const filelist = document.getElementById("filelist");

let controller;

const store = new Map();

let elements = [];
let currentFile = null;

function handleButtonClick(currentElement, file) {
  currentFile = file;

  if (store.has(file)) {
    preview.src = store.get(file);
  }

  for (const element of elements) {
    if (element === currentElement) {
      element.classList.add("active");
    } else {
      element.classList.remove("active");
    }
  }
}

function connect() {
  if (controller) controller.abort();
  elements = [];

  controller = new AbortController();
  const ws = new WebSocket(":8080");
  ws.binaryType = "arraybuffer";

  ws.addEventListener(
    "open",
    () => {
      console.log("[ws] connected");
    },
    { signal: controller.signal },
  );

  ws.addEventListener(
    "message",
    async (message) => {
      const payload = window.MessagePack.decode(message.data);

      if (payload.type === "list") {
        filelist.innerHTML = "";
        for (const file of payload.data) {
          const element = document.createElement("button");
          element.textContent = `📦 ${file}`;
          filelist.appendChild(element);
          element.addEventListener(
            "click",
            handleButtonClick.bind(null, element, file),
            {
              signal: controller.signal,
            },
          );
          elements.push(element);
        }
      }

      if (payload.type === "image") {
        if (store.has(payload.name)) {
          URL.revokeObjectURL(store.get(payload.name));
        }

        const image = new Blob([payload.image], { type: payload.mimeType });
        store.set(payload.name, URL.createObjectURL(image));

        if (payload.name === currentFile) {
          preview.src = store.get(payload.name);
        }
      }
    },
    { signal: controller.signal },
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
}

connect();
