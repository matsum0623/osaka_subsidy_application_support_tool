const {response_ok, response_400, response_403} = require('lambda_response')
const {daily, instructor, after_school, user, app_const} = require('connect_dynamodb')
const { Auth } = require('Auth')

exports.handler = async (event, context) => {
  const decode_token = Auth.check_id_token(event)
  if(!decode_token){
      return response_403
  }

  const qsp = event.queryStringParameters
  if(qsp == undefined || !qsp.date || !qsp.school_id){
      return response_400
  }

  const after_school_id = qsp.school_id

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
    const daily_item = await daily.get_item(after_school_id, qsp.date)
    if(daily_item){
      res_data['open_type'] = daily_item.OpenType,
      res_data['children'] = {
        'sum': daily_item.Children,
        'disability': daily_item.Disability,
        'medical_care': daily_item.MedicalCare,
      }
      res_data['summary']['hours'] = daily_item.Details.Summary.WorkHours
      daily_item.Details.InstructorWorkHours.forEach((ins) => {
        instructor_data[ins.InstructorId] = ins
      })
    }
  } catch (error) {
      console.log(error.message)
  }
  // 指導員情報を取得
  try {
    const result = await instructor.get_all(after_school_id)

    // 結果を日付をキーにしたオブジェクトに変換
    result.forEach(item => {
      const instructor_id = item.SK.substring(11)
      res_data['instructors'][instructor_id] = {
        "id": instructor_id,
        "name": item.Name,
        "qualification": item.Qualification,
        "additional": item.Additional,
        "medical_care": item.MedicalCare,
        "start": instructor_data[instructor_id]?.StartTime ?? '',
        "end": instructor_data[instructor_id]?.EndTime ?? '',
        "hours": instructor_data[instructor_id]?.WorkHours ?? '',
        "order": item.Order ? item.Order : 99,
        "additional_check": instructor_data[instructor_id]?.AdditionalCheck ?? false,
      }
    });
  } catch (error) {
      console.log(error.message)
  }

  const after_school_info = await after_school.get_item(after_school_id)
  const open_types = await app_const.get_open_types()
  const user_data = await user.get_item(decode_token.email)

  res_data["config"] = {
    "open_types": {}
  }
  Object.keys(after_school_info['Config']['OpenTypes']).forEach((key) => {
    res_data["config"]["open_types"][key] = {
      OpenTime: after_school_info['Config']['OpenTypes'][key].OpenTime,
      CloseTime: after_school_info['Config']['OpenTypes'][key].CloseTime,
      TypeName: key in Object.keys(open_types) ? open_types[key].TypeName : '',
    }
  })

  res_data["user_data"]= {
    user_name: user_data.UserName,
    admin: user_data.Admin,
  }
  return response_ok(res_data)
};