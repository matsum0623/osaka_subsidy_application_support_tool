const AWS = require('aws-sdk')
const dynamo = new AWS.DynamoDB.DocumentClient({ region: 'localhost', endpoint: 'http://host.docker.internal:8000' });

exports.handler = async (event, context) => {
  const today = new Date()
  const qsp = event.queryStringParameters
  if (!qsp.date){
    return  {
      statusCode: 400,
      headers: {
        'x-custom-header': 'my custom header value',
        "Access-Control-Allow-Origin": "*"
      }
    }
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
      const result = await dynamo.query({
          TableName: 'test-table',
          KeyConditionExpression: 'PK = :p_key AND SK = :s_key',
          ExpressionAttributeValues: {
              ':p_key': 'AFTER_SCHOOL#0001',
              ':s_key': 'DAILY#' + qsp.date,
          },
      }).promise();
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
    const result = await dynamo.query({
        TableName: 'test-table',
        KeyConditionExpression: 'PK = :p_key AND begins_with(SK, :s_key)',
        ExpressionAttributeValues: {
            ':p_key': 'AFTER_SCHOOL#0001',
            ':s_key': 'INSTRUCTOR#',
        },
    }).promise();
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

  const response = {
    statusCode: 200, // HTTP 200 OK
    headers: {
      'x-custom-header': 'my custom header value',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      data: res_data,
    })
  };

  return response;
};