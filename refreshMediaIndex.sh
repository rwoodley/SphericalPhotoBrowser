cd media
echo 'myTextures=["'`ls -1 *.png *.jpg *.JPG|tr '\n' ','|sed -e 's/,/","/g'|sed -e 's/,\"$//'  `']' > files.js
echo 'myVideos=["'`ls -1 *.mp4 |tr '\n' ','|sed -e 's/,/","/g'|sed -e 's/.mp4//g'|sed -e 's/.MP4//g'|sed -e 's/,\"$//'  `']' > videostemp.js
# handle case where no videos
cat ./videostemp.js |sed -e 's/\[\"\]/\[\"\"\]/' > videos.js
