const { response_ok, response_403 } = require('lambda_response')
const { user, after_school } = require('connect_dynamodb')
const { Auth } = require('Auth')

exports.handler = async (event, context) => {
    const decode_token = Auth.check_id_token(event)
    if(!decode_token){
        return response_403
    }

    const user_data = await user.get_item(decode_token.email)
    const response = {
        user_data: {
            user_name: user_data.UserName,
            admin: user_data.Admin,
            after_schools: []
        }
    }
    for (const school_id of user_data.AfterSchools){
        const af = await after_school.get_item(school_id)
        response.user_data.after_schools.push({
            school_id: school_id,
            school_name: af.Name,
        })
    }
    return response_ok(response);
};