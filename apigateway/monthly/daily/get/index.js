const AWS = require('aws-sdk')
const dynamo = new AWS.DynamoDB.DocumentClient({ region: 'localhost', endpoint: 'http://host.docker.internal:8000' });

const {response_ok, response_400} = require('lambda_response')
const {daily, instructor} = require('connect_dynamodb')

exports.handler = async (event, context) => {
  const today = new Date()
  const qsp = event.queryStringParameters
  if (!qsp.date){
    return response_400
  }

  // その日の情報を取得
  const res_data = {
    'instructors': [],
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
      res_data['instructors'].push({
        "id": instructor_id,
        "name": item.Name,
        "start": (instructor_id in instructor_data) ? instructor_data[item.SK.substring(11)].StartTime : '',
        "end": (instructor_id in instructor_data) ? instructor_data[item.SK.substring(11)].EndTime : '',
        "hours": (instructor_id in instructor_data) ? instructor_data[item.SK.substring(11)].WorkHours : '',
      })
    });
  } catch (error) {
      console.log(error.message)
  }

  return response_ok(res_data)
};