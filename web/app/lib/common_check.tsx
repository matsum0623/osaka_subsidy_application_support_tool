// 共通のチェック処理を実装する

export function checkInstructor(instData: any, config:any) {
    const open = config.OpenTime
    const close = config.CloseTime
    // 開所・閉所時間から勤務ボックス作成
    let [open_h, open_m] = open.split(':').map((s:string) => parseInt(s))
    const work_member:{[key: string]: {
        num: number,
        qua: number,
        add: number,
        med: number,
    }} = {}
    while(true){
        const key = ('00' + String(open_h)).slice(-2) + ':' + ('00' + String(open_m)).slice(-2)
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
    Object.values(instData).forEach((value:any) => {
        if(value.hours != ''){
            Object.keys(work_member).forEach((key:string) => {
                if(value.start <= key && key < value.end){
                    if(!value.additional_check){
                        work_member[key].num += 1
                    }
                    if(value.qualification && !value.additional_check){
                        work_member[key].qua += 1
                    }
                    if(value.additional_check){
                        work_member[key].add += 1
                    }
                    if(value.medical_care){
                        work_member[key].med += 1
                    }
                }
            })
        }
    })
    /*
        配置をチェックする
            １．全時間帯で2人以上
            ２．全時間帯にquaが1人以上
            TODO: 加配の条件をどうするか
    */
    let check_response = true
    Object.keys(work_member).map((key) => {
        if(work_member[key].num < 2 || work_member[key].qua < 1){
            check_response = false
        }
    })
    return check_response
}