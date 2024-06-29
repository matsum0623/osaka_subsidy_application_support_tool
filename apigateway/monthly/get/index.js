const AWS = require('aws-sdk')
const dynamo = new AWS.DynamoDB.DocumentClient({ region: 'localhost', endpoint: 'http://host.docker.internal:8000' });

exports.handler = async (event, context) => {
    const today = new Date()
    const qsp = event.queryStringParameters
    const ym = !qsp.ym ? today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) : qsp.ym

    const daily_dict = {}
    try {
        const result = await dynamo.query({
            TableName: 'test-table',
            KeyConditionExpression: 'PK = :p_key AND begins_with(SK, :s_key)',
            ExpressionAttributeValues: {
                ':p_key': "AFTER_SCHOOL#0001",
                ':s_key': "DAILY#" + ym,
            },
        }).promise();
        // 結果を日付をキーにしたオブジェクトに変換
        result.Items.forEach(item => {
            daily_dict[item.SK.slice(-10)] = item
        });
    } catch (error) {
        console.log(error.message)
    }

    const start_date = new Date(ym + '-01')
    let dt = start_date
    const res_list = []
    while (true) {
        dt_str = dt.getFullYear() + '-' + ('0' + (dt.getMonth() + 1)).slice(-2) + '-' + ('0' + dt.getDate()).slice(-2)
        if (dt_str in daily_dict){
            console.log(daily_dict[dt_str])
        }
        res_list.push([
            dt_str,
            dt.getDate().toString() + '日',
            dt.getDay(),
            dt_str in daily_dict ? daily_dict[dt_str]['Children'] : "",
            dt_str in daily_dict ? daily_dict[dt_str]['Disability'] : "",
            dt_str in daily_dict ? daily_dict[dt_str]['MedicalCare'] : "",
            dt_str in daily_dict ? daily_dict[dt_str]['OpenInstructor']['Qualification'] : "",
            dt_str in daily_dict ? daily_dict[dt_str]['OpenInstructor']['NonQualification'] : "",
            dt_str in daily_dict ? daily_dict[dt_str]['CloseInstructor']['Qualification'] : "",
            dt_str in daily_dict ? daily_dict[dt_str]['CloseInstructor']['NonQualification'] : "",
        ])
        dt = new Date(dt.setDate(dt.getDate() + 1));
        if (dt.getFullYear() + '-' + ('0' + (dt.getMonth() + 1)).slice(-2) != ym){
            break
        }
    }

    const response = {
        statusCode: 200, // HTTP 200 OK
        headers: {
            'x-custom-header': 'my custom header value',
            "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
            data: {
                "list": res_list
            },
        })
    };

    return response;
};