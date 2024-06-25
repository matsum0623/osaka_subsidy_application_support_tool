const AWS = require('aws-sdk')
const dynamo = new AWS.DynamoDB.DocumentClient({ region: 'localhost', endpoint: 'http://host.docker.internal:8000' });

const { DynamoDBClient, ListTablesCommand } = require('@aws-sdk/client-dynamodb');
const client = new DynamoDBClient({ region: 'localhost', endpoint: 'http://host.docker.internal:8000' });

exports.handler = async (event, context) => {
    const command = new ListTablesCommand({});

    const r = await client.send(command);
    console.log(r)
    console.log("test")
    const params = {
        TableName: 'test-table',
    };
    try {
        // DynamoDBにscanでアクセス
        const result = await dynamo.scan(params).promise();
        // 正常に取得できたらその値を返す
        console.log(JSON.stringify(result.Items))
    } catch (error) {
        console.log(error.message)
        // エラーが発生したらエラー情報を返す
    }
    console.log("test")

    const today = new Date()
    console.log(JSON.stringify(event))
    console.log(event.queryStringParameters)
    const qsp = event.queryStringParameters
    const dt = !qsp.date ? today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2) : qsp.date
    console.log(dt)
    const response = {
        statusCode: 200, // HTTP 200 OK
        headers: {
            'x-custom-header': 'my custom header value',
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
            data: {
                "list": [
                    ["2024-05-01", "1日", "土", "20", "1", "0", "2", "1", "1", "1",],
                    ["2024-05-02", "2日", "日", "20", "1", "0", "2", "1", "1", "1",],
                    ["2024-05-03", "3日", "月", "20", "1", "0", "2", "1", "1", "1",],
                    ["2024-05-04", "4日", "火", "20", "1", "0", "2", "1", "1", "1",],
                    ["2024-05-05", "5日", "水", "20", "1", "0", "2", "1", "1", "1",],
                    ["2024-05-06", "6日", "木", "20", "1", "0", "2", "1", "1", "1",],
                ],
                "summary": [361, 16, 0, 39, 12, 32, 19]
            },
        })
    };

    return response;
};