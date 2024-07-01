const {response_ok} = require('lambda_response')
const {daily} = require('connect_dynamodb')

exports.handler = async (event, context) => {
    console.log(JSON.stringify(event))
    console.log(event.body)
    console.log(JSON.parse(event.body))
    const post_data = JSON.parse(event.body)

    console.log(post_data)
    const children = post_data['children']
    const disability = post_data['disability']
    const medical_care = post_data['medical_care']

    for (const key in post_data){
        if (key.split('.')[0] == 'times'){
            console.log(key)
        }
    }

    // 現在の登録を取得する

    // 取得結果を書き換える

    // 再登録する

    return response_ok({});
};