const { response_ok, response_403 } = require('lambda_response')
const { user } = require('connect_dynamodb')
const { Auth } = require('Auth')

exports.handler = async (event, context) => {
    const decode_token = Auth.check_id_token(event)
    if(!decode_token){
        return response_403
    }

    const post_data = JSON.parse(event.body)
    const request_user = await user.get_item(decode_token.email)

    // 管理者のみユーザ追加が可能
    if(!request_user.Admin){
        return response_403
    }

    const response = user.put(
        post_data.user_id,
        post_data.user_name,
        post_data.after_schools,
        post_data.admin_flag,
    )

    return response_ok(response);
};