const {response_ok, response_400, response_403} = require('lambda_response')
const {daily, instructor, after_school, user} = require('connect_dynamodb')
const { Auth } = require('Auth')

exports.handler = async (event, context) => {
  const qsp = event.queryStringParameters
  if (!qsp.date){
    return response_400
  }
  const decode_token = Auth.check_id_token(event)
  if(!decode_token){
      return response_403
  }

  // その日の情報を取得
  const res_data = {
    'open_type': 0,
    'instructors': {},
    'children': {
      'sum': '',
      'disability': '',
      'medical_care': '',
    },
    'summary': {
      'hours': ''
    }
  }
  const instructor_data = {}
  try {
    const result = await daily.get_item('0001', qsp.date)

    result.Items.forEach(item => {
      res_data['open_type'] = item.OpenType,
      res_data['children'] = {
        'sum': item.Children,
        'disability': item.Disability,
        'medical_care': item.MedicalCare,
      }
      res_data['summary']['hours'] = item.Details.Summary.WorkHours
      item.Details.InstructorWorkHours.forEach((ins) => {
        instructor_data[ins.InstructorId] = ins
      })
    });
  } catch (error) {
      console.log(error.message)
  }
  // 指導員情報を取得
  try {
    const result = await instructor.get_all('0001')

    // 結果を日付をキーにしたオブジェクトに変換
    result.Items.forEach(item => {
      const instructor_id = item.SK.substring(11)
      res_data['instructors'][instructor_id] = {
        "id": instructor_id,
        "name": item.Name,
        "start": (instructor_id in instructor_data) ? instructor_data[item.SK.substring(11)].StartTime : '',
        "end": (instructor_id in instructor_data) ? instructor_data[item.SK.substring(11)].EndTime : '',
        "hours": (instructor_id in instructor_data) ? instructor_data[item.SK.substring(11)].WorkHours : '',
      }
    });
  } catch (error) {
      console.log(error.message)
  }

  const after_school_info = await after_school.get_item('0001')
  const user_data = await user.get_item(decode_token.email)
  res_data["config"]= {
    "open_types": after_school_info['Config']['OpenTypes']
  }
  res_data["user_data"]= {
    user_name: user_data.UserName,
    admin: user_data.Admin,
  }
  return response_ok(res_data)
};