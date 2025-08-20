**Sone**

A declarative Canvas layout engine for JavaScript.

```shell
npm install sone
```

```javascript
import { sone, Column, Text } from 'sone';

function Document() {
  return Column(
    Text(
      "Hello, ",
      Span("World").color("blue"),
    )
    .size(44)
    .color("black")
  )
  .padding(24)
  .bg("white")
}

// save as buffer
const buffer = await sone(Document()).jpg();

// save to file
import fs from 'node:fs/promises';
fs.writeFile("image.jpg", buffer);
```


### Acknowledgement

- skia-canvas
- node-canvas
- dropflow
- harfbuzz

### License

`Apache-2.0`

<small>Seanghay's Optimized Nesting Engine</small>
