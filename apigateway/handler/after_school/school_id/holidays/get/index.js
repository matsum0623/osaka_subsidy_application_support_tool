const { response_ok, response_400, response_403 } = require('lambda_response')
const { holidays } = require('connect_dynamodb')
const { Auth } = require('Auth')

exports.handler = async (event, context) => {
    const decode_token = Auth.check_id_token(event)
    if(!decode_token){
        return response_403
    }
    const pp = event.pathParameters
    if (!pp.school_id){
        return response_400
    }

    const res = await holidays.get_item(pp.school_id)
    return response_ok(holidays.Holidays)
};