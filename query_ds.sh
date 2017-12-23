#/bin/sh

post_data=$(cat <<EOF
{
  "from":"1514041482653",
  "to":"1514063082653",
  "queries":[
    {"target":"upper_25","refId":"A","type":"timeserie","datasourceId":7},
    {"target":"upper_25","refId":"B","type":"timeserie","datasourceId":7}
  ]
}
EOF
)

# echo ${post_data}

curl \
--header "Accept: application/json" \
--header "Content-Type: application/json" \
--data "${post_data}" \
--request POST http://admin:admin@localhost:3000/api/tsdb/query
