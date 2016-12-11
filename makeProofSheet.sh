mkdir -p proofSheet

echo "<script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
  ga('create', 'UA-41066114-3', 'auto');
  ga('send', 'pageview');
</script>" > boilerPlateHeader.html

# Make thumbnails
qlmanage -ti * -o proofSheet
for f in `ls *.webm *.mp4`
do
	ffmpeg -i $f -ss 00:00:07.000 -vframes 1 -y proofSheet/$f.png
done

# Build HTML file: proofSheet.html
# echo "<script>function wrapperFunc(e) { e.preventDefault();} </script>" > proofSheet.html
cat boilerPlateHeader.html > proofSheet.html

cat notes.html >> proofSheet.html
echo "<p>Must be viewed with Chrome</p>" >> proofSheet.html
echo "<h4>Stills:</h4>" >> proofSheet.html 
#echo  "<table border='1'>" >> proofSheet.html
for f in `find . -name "*.png" -maxdepth 1 -not -type d|grep -v proofSheet.html|egrep -i "png|mov"| sed -e "s;./;;"`
do
    echo "Processing $f" 
    #echo "<tr><td><a href='$f'><img width=150px src='proofSheet/$f.png' /></a></td><td>$f</td>" >> proofSheet.html
    echo "<a href='proofSheet/$f.html'><img width=150px src='proofSheet/$f.png' /></a>" >> proofSheet.html
    cat boilerPlateHeader.html > proofSheet/$f.html
    # echo "<img src='../$f' />" >> proofSheet/$f.html
    echo "<style>
        .fill {
            height: 100%;
            overflow: hidden;
            background-size: contain;
            background-repeat: no-repeat;
            background-position: top;
            background-image: url('../$f');
        }
        </style>
        <div class='fill'></div>" >> proofSheet/$f.html
done 
#echo  "</table>" >> proofSheet.html

echo "<h4>Videos:</h4>" >> proofSheet.html
echo  "<table border='1'>" >> proofSheet.html
for f in `find . -name "*.mov" -o -name "*.webm"  -o -name "*.mp4" -maxdepth 1 -not -type d|grep -v proofSheet.html|egrep -i "mp4|png|mov|webm"| sed -e "s;./;;"`
do
    echo "Processing $f"

    cat boilerPlateHeader.html > proofSheet/$f.html
    echo "<video  id='video' controls='true'' autoplay='true' src='../$f'></video>" >> proofSheet/$f.html

    echo "<tr><td><a href='proofSheet/$f.html' ><img width=150px src='proofSheet/$f.png' /></a></td><td>$f</td>" >> proofSheet.html
done 
echo  "</table>" >> proofSheet.html