#/bin/sh

post_data=$(cat <<EOF
{
    "from":"1512979580818",
    "to":"1513001180818",
    "queries":[
        {
            "refId":"A",
            "intervalMs":20000,
            "maxDataPoints":940,
            "datasourceId":7,
            "rawSql":"SELECT 'http://www.grafana.com?var1=1&var2=2' as link",
            "format":"table"}
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