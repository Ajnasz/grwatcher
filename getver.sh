formatted_date=$(date '+%g%m%d%H%M%S');
branch=$(git branch | awk '/\*/ {print $2}');
hash=$(git log --pretty=%h -n 1);
echo "$formatted_date-$branch.$hash"
