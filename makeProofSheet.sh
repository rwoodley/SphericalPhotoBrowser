mkdir -p proofSheet
qlmanage -ti * -o proofSheet

# echo "<script>function wrapperFunc(e) { e.preventDefault();} </script>" > proofSheet.html
echo "<h4>Stills:</h4>" > proofSheet.html
for f in `find . -name "*.png" -maxdepth 1 -not -type d|grep -v proofSheet.html|egrep -i "png|mov"| sed -e "s;./;;"`
do
    echo "Processing $f" 
    echo "<a href='$f'><img src='proofSheet/$f.png' /></a>" >> proofSheet.html
done 

echo "<h4>Videos:</h4>" >> proofSheet.html
for f in `find . -name "*.mov" -maxdepth 1 -not -type d|grep -v proofSheet.html|egrep -i "png|mov"| sed -e "s;./;;"`
do
    echo "Processing $f"

    echo "<video  id='video' controls='true'' autoplay='true' src='../$f'></video>" > proofSheet/$f.html

    echo "<a href='proofSheet/$f.html' ><img src='proofSheet/$f.png' /></a>" >> proofSheet.html
done 