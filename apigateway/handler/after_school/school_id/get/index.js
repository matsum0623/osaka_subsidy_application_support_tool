const { response_ok, response_400, response_403 } = require('lambda_response')
const { after_school } = require('connect_dynamodb')
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

    console.log(event.pathParameters)

    const school_info = await after_school.get_item(pp.school_id)
    console.log(school_info)

    if(!school_info){
        return response_400
    }

    const response = {
        school_id: pp.school_id,
        school_name: school_info.Name,
        open_types: [
        ]
    }
    for(const id in school_info.Config.OpenTypes){
        response.open_types.push({
            type_i: id,
            type_name: school_info.Config.OpenTypes[id].TypeName,
            open_time: school_info.Config.OpenTypes[id].OpenType,
            close_time: school_info.Config.OpenTypes[id].CloseTime,
        })
    }

    return response_ok(response);
};