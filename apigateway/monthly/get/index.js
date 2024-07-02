const {response_ok} = require('lambda_response')
const {after_school, daily} = require('connect_dynamodb')

exports.handler = async (event, context) => {
    const today = new Date()
    const qsp = event.queryStringParameters
    const ym = !qsp.ym ? today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) : qsp.ym

    const daily_dict = {}
    try {
        const result = await daily.get_list('0001', ym)
        // 結果を日付をキーにしたオブジェクトに変換
        result.forEach(item => {
            daily_dict[item.SK.slice(-10)] = item
        });
    } catch (error) {
        console.log(error.message)
    }

    const start_date = new Date(ym + '-01')
    let dt = start_date
    const res_list = []
    while (dt.getFullYear() + '-' + ('0' + (dt.getMonth() + 1)).slice(-2) == ym) {
        const dt_str = dt.getFullYear() + '-' + ('0' + (dt.getMonth() + 1)).slice(-2) + '-' + ('0' + dt.getDate()).slice(-2)
        res_list.push([
            dt_str,
            dt.getDate().toString() + '日',
            dt.getDay(),
            dt_str in daily_dict ? daily_dict[dt_str]['OpenType'] : "",
            dt_str in daily_dict ? daily_dict[dt_str]['Children'] : "",
            dt_str in daily_dict ? daily_dict[dt_str]['Disability'] : "",
            dt_str in daily_dict ? daily_dict[dt_str]['MedicalCare'] : "",
            dt_str in daily_dict ? daily_dict[dt_str]['OpenInstructor']['Qualification'] : "",
            dt_str in daily_dict ? daily_dict[dt_str]['OpenInstructor']['NonQualification'] : "",
            dt_str in daily_dict ? daily_dict[dt_str]['CloseInstructor']['Qualification'] : "",
            dt_str in daily_dict ? daily_dict[dt_str]['CloseInstructor']['NonQualification'] : "",
        ])
        dt = new Date(dt.setDate(dt.getDate() + 1));
    }

    const after_school_info = await after_school.get_item('0001')
    return response_ok({
        "list": res_list,
        "config": {
            "open_types": after_school_info['Config']['OpenTypes']
        }
    });
};