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
        list: []
    }
    const after_schools = await after_school.get_all()
    for (const school_info of after_schools){
        const school_id = school_info.SK.split('#')[1]
        if (user_data.AfterSchools.includes(school_id)){
            response.list.push({
                school_id: school_id,
                school_name: school_info.Name,
                open_types: school_info.Config.OpenTypes,
                child_count: 20,
                instructor_count: 9,
            })
        }
    }

    return response_ok(response);
};