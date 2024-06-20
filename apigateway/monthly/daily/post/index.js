exports.handler = async (event, context) => {
    console.log(JSON.stringify(event))
    console.log(event.body)
    console.log(JSON.parse(event.body))
    const post_data = JSON.parse(event.body)
    const response = {
        statusCode: 200, // HTTP 200 OK
        headers: {
            'x-custom-header': 'my custom header value',
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
            "Access-Control-Allow-Methods": "OPTIONS,POST",
            "Access-Control-Allow-Headers": "Content-Type",
        },
        body: JSON.stringify({
            data: post_data,
        })
    };
    console.log(JSON.stringify(response))

    return response;
};