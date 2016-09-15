cd media
echo 'myTextures=["'`ls -1 *.jpg *.JPG|tr '\n' ','|sed -e 's/,/","/g'|sed -e 's/.jpg//g'|sed -e 's/.JPG//g'|sed -e 's/,\"$//'  `']' > files.js
echo 'myVideos=["'`ls -1 *.mp4 |tr '\n' ','|sed -e 's/,/","/g'|sed -e 's/.mp4//g'|sed -e 's/.MP4//g'|sed -e 's/,\"$//'  `']' > videos.js
