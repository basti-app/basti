set -e

trap "rm -f palette.png" EXIT

ffmpeg -y -i $1 -vf palettegen palette.png
ffmpeg -y -i $1 -i palette.png -filter_complex "paletteuse" $2