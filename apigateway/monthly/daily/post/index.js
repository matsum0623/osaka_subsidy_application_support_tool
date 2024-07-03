const {response_ok} = require('lambda_response')
const {after_school, daily, instructor} = require('connect_dynamodb')

exports.handler = async (event, context) => {
  const post_data = JSON.parse(event.body)

  console.log(post_data)
  const children = post_data['children']
  const disability = post_data['disability']
  const medical_care = post_data['medical_care']

  const instructor_work_hours_tmp = {}
  for (const key in post_data){
    if (key.split('.')[0] == 'times'){
      const [ins_id, type] = key.split('.').slice(-2)
      if(!(ins_id in instructor_work_hours_tmp)){
        instructor_work_hours_tmp[ins_id] = {}
      }
      instructor_work_hours_tmp[ins_id][type] = post_data[key]
    }
  }
  const after_school_info = await after_school.get_item('0001')
  const instructor_work_hours =[]
  const open_instructor = {
    "Qualification": 0,
    "NonQualification": 0
  }
  const close_instructor = {
    "Qualification": 0,
    "NonQualification": 0
  }
  for (const ins_id in instructor_work_hours_tmp){
    instructor_work_hours.push({
      "InstructorId": ins_id,
      "StartTime": instructor_work_hours_tmp[ins_id]['start'],
      "EndTime": instructor_work_hours_tmp[ins_id]['end'],
      "WorkHours": instructor_work_hours_tmp[ins_id]['hour'],
    })
    const instructor_info = await instructor.get_item('0001', ins_id)
    if (instructor_work_hours_tmp[ins_id]['start'] <= after_school_info['Config']['OpenTypes'][post_data.open_type]['OpenTime']){
      if (instructor_info.Qualification){
        open_instructor['Qualification'] += 1
      }else{
        open_instructor['NonQualification'] += 1
      }
    }
    if (instructor_work_hours_tmp[ins_id]['end'] >= after_school_info['Config']['OpenTypes'][post_data.open_type]['CloseTime']){
      if (instructor_info.Qualification){
        close_instructor['Qualification'] += 1
      }else{
        close_instructor['NonQualification'] += 1
      }
    }

  }

  // 再登録する
  const response = await daily.put(
    '0001',
    post_data.date,
    post_data.open_type,
    children,
    disability,
    medical_care,
    open_instructor,
    close_instructor,
    {
      "InstructorWorkHours": instructor_work_hours,
      "Summary": {
        "WorkHours": post_data.hour_summary,
      }
    } // Details
  )
  console.log(response)

  return response_ok({});
};