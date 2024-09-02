const {response_ok, response_403} = require('lambda_response')
const {after_school, daily, instructor} = require('connect_dynamodb')
const { Auth } = require('Auth')

exports.handler = async (event, context) => {
  const decode_token = Auth.check_id_token(event)
  if(!decode_token){
      return response_403
  }

  const post_data = JSON.parse(event.body)

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
  const after_school_info = await after_school.get_item('0001') // TODO: 学童の選択を可能にする
  const instructor_work_hours =[]
  const open_instructor = {
    "Qualification": 0,
    "NonQualification": 0
  }
  const close_instructor = {
    "Qualification": 0,
    "NonQualification": 0
  }
  const instructor_info_tmp = {}
  for (const ins_id in instructor_work_hours_tmp){
    if(instructor_work_hours_tmp[ins_id]['start'] == '' || instructor_work_hours_tmp[ins_id]['end'] == ''){
      continue
    }
    instructor_work_hours.push({
      "InstructorId": ins_id,
      "StartTime": instructor_work_hours_tmp[ins_id]['start'],
      "EndTime": instructor_work_hours_tmp[ins_id]['end'],
      "WorkHours": instructor_work_hours_tmp[ins_id]['hour'],
    })
    const instructor_info = await instructor.get_item('0001', ins_id) // TODO: 学童の選択を可能にする
    instructor_info_tmp[ins_id] = instructor_info
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

  // 指導員配置チェック
  const ins_check = checkInstructor(instructor_work_hours, after_school_info['Config']['OpenTypes'][post_data.open_type], instructor_info_tmp)

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
    },
    instructor_check = ins_check,
  )

  return response_ok({});
};

function checkInstructor(instData, config, instructor_info_tmp) {
  const open = config.OpenTime
  const close = config.CloseTime
  // 開所・閉所時間から勤務ボックス作成
  let [open_h, open_m] = open.split(':').map((s) => parseInt(s))
  const work_member = {}
  while(true){
      const key = String(open_h) + ':' + String(open_m)
      if(key >= close){
          break
      }
      work_member[key] = {
          num: 0,
          qua: 0,
          add: 0,
          med: 0,
      }
      open_m += 15
      if(open_m >= 60){
          open_h += 1
          open_m -= 60
      }
  }
  instData.map((value) => {
      if(value.WorkHours != ''){
          ins_info = instructor_info_tmp[value.InstructorId]
          console.log(ins_info)
          Object.keys(work_member).forEach((key) => {
              if(value.StartTime <= key && key < value.EndTime){
                  work_member[key].num += 1
                  if(ins_info.Qualification){
                      work_member[key].qua += 1
                  }
                  if(ins_info.Additional){
                      work_member[key].add += 1
                  }
                  if(ins_info.MedicalCare){
                      work_member[key].med += 1
                  }
              }
          })
      }
  })
  console.log(work_member)

  /*
      配置をチェックする
          １．全時間帯で2人以上
          ２．全時間帯にquaが1人以上
          TODO: 加配の条件をどうするか
  */
  let check_response = true
  Object.keys(work_member).map((key) => {
      if(work_member[key].num < 2 || work_member[key].qua < 1){
        console.log(key)
        check_response = false
      }
  })
  return check_response
}