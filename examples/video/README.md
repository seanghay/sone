

```shell
# create frames
node main.js

# encode frames into mp4
ffmpeg -y -framerate 60 -i "frames/%04d.jpg" -c:v libx264 -pix_fmt yuv420p -crf 18 output.mp4
```