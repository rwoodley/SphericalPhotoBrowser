mkdir -p proofSheet

# Make thumbnails
qlmanage -ti * -o proofSheet
for f in `ls *.webm`
do
	ffmpeg -i $f -ss 00:00:07.000 -vframes 1 -y proofSheet/$f.png
done

# Build HTML file: proofSheet.html
# echo "<script>function wrapperFunc(e) { e.preventDefault();} </script>" > proofSheet.html
echo "<h4>Stills:</h4>" > proofSheet.html
for f in `find . -name "*.png" -maxdepth 1 -not -type d|grep -v proofSheet.html|egrep -i "png|mov"| sed -e "s;./;;"`
do
    echo "Processing $f" 
    echo "<a href='$f'><img width=150px src='proofSheet/$f.png' /></a>" >> proofSheet.html
done 

echo "<h4>Videos:</h4>" >> proofSheet.html
for f in `find . -name "*.mov" -o -name "*.webm" -maxdepth 1 -not -type d|grep -v proofSheet.html|egrep -i "png|mov|webm"| sed -e "s;./;;"`
do
    echo "Processing $f"

    echo "<video  id='video' controls='true'' autoplay='true' src='../$f'></video>" > proofSheet/$f.html

    echo "<a href='proofSheet/$f.html' ><img width=150px src='proofSheet/$f.png' /></a>" >> proofSheet.html
done 
